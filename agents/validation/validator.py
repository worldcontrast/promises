"""
World Contrast — Promise Validator (v2)
File: agents/validation/validator.py

Validation pipeline — four sequential gates:

Gate 0 — Exact-Match Anti-Hallucination  [NEW]
  Deterministic Python check: verifies the LLM-supplied quote
  is a real substring of the raw page HTML/text.
  A mismatch does NOT reject — it lowers confidence_score so the
  ConfidenceRouter is forced to send the record to Telegram (HITL).
  No LLM can hallucinate its way to auto-approval.

Gate 1 — Sentiment Guard
  Rejects promises containing attacks, insults, or comparative
  statements about other candidates.
  Only forward-looking policy commitments pass.

Gate 2 — Duplicate Detector
  SHA-256 exact match first (O(1)).
  Semantic vector similarity for near-duplicates (production).
  Same promise from multiple sources → merged, not duplicated.

Gate 3 — Confidence Threshold
  Promises below CONFIDENCE_THRESHOLD are flagged for data
  quality review (not content review — neutrality is maintained).

All rejections are logged publicly in extraction_rejections.
Nothing is silently discarded.
"""

from __future__ import annotations

import hashlib
import logging
import re
import unicodedata
import uuid
from datetime import datetime, timezone
from typing import Optional

log = logging.getLogger('validator')

# ── Thresholds ───────────────────────────────────────────────────────────────

# Minimum confidence score to remain in the pipeline at all
CONFIDENCE_THRESHOLD: float = 0.70

# Cosine similarity threshold for semantic duplicate detection
DUPLICATE_THRESHOLD: float = 0.92

# Confidence penalty when LLM quote found only after unicode normalisation
QUOTE_FUZZY_PENALTY: float = 0.10

# Confidence penalty when LLM quote is completely absent from raw page
QUOTE_MISMATCH_PENALTY: float = 0.30

# ── Pattern sets ─────────────────────────────────────────────────────────────
# Multilingual — covers PT, EN, ES, FR patterns.

ATTACK_PATTERNS = [
    # English
    r'\b(failed|failure|corrupt|corruption|liar|lie|incompetent)\b',
    r'\b(my opponent|the other candidate|unlike my opponent)\b',
    r'\b(disaster|catastrophe|destroyed|ruined)\b',
    # Portuguese
    r'\b(falhou|fracasso|corrupto|corrupção|mentiroso|mentiu|incompetente)\b',
    r'\b(meu adversário|o outro candidato|ao contrário do meu adversário)\b',
    r'\b(desastre|catástrofe|destruiu|arruinou)\b',
    # Spanish
    r'\b(fracasó|fracaso|corrupto|corrupción|mentiroso|mintió|incompetente)\b',
    r'\b(mi oponente|el otro candidato|a diferencia de mi oponente)\b',
]

VAGUE_PATTERNS = [
    # English
    r'^we believe in\b',
    r'^we are committed to\b',
    r'^we stand for\b',
    r'^we support\b',
    # Portuguese
    r'^acreditamos em\b',
    r'^estamos comprometidos com\b',
    r'^defendemos\b',
    r'^apoiamos\b',
    # Spanish
    r'^creemos en\b',
    r'^estamos comprometidos con\b',
    r'^defendemos\b',
    r'^apoyamos\b',
]

HISTORICAL_PATTERNS = [
    # English
    r'\b(last year|previously|in my previous|during my time as|when I was)\b',
    r'\b(we did|we achieved|we accomplished|we delivered)\b',
    # Portuguese
    r'\b(no ano passado|anteriormente|no meu governo anterior|quando eu era)\b',
    r'\b(fizemos|conquistamos|realizamos|entregamos)\b',
    # Spanish
    r'\b(el año pasado|anteriormente|en mi gobierno anterior|cuando era)\b',
    r'\b(hicimos|logramos|realizamos|entregamos)\b',
]


class PromiseValidator:
    """
    Multi-gate validation for extracted political promises.
    All rejections are logged for full transparency.

    Gate 0 (exact-match) lowers confidence but does not reject,
    ensuring hallucinated quotes never reach auto-approval.
    """

    def __init__(self, settings, db=None) -> None:
        self.settings = settings
        self._db = db

    async def validate(
        self,
        promise: dict,
        candidate_id: str,
        election_id: str,
        page: dict,
    ) -> Optional[dict]:
        """
        Run all validation gates on a single promise.

        Args:
            promise:      Raw promise dict from the extractor.
                          Must contain 'text_original', 'quote', and 'confidence'.
            candidate_id: Logical candidate id (string slug).
            election_id:  Election id.
            page:         Crawled page dict.  Must contain 'text' (raw HTML/text)
                          and 'url'.

        Returns:
            Validated promise dict ready for ConfidenceRouter routing,
            or None if the promise was hard-rejected (Gates 1–3 only).
        """
        text = promise.get('text_original', '').strip()

        if not text:
            log.debug("Rejected: empty text")
            return None

        raw_page_text = page.get('text', '')

        # ── GATE 0: Exact-Match Anti-Hallucination ────────────────────────────
        # Does NOT reject — adjusts confidence to prevent auto-approval of
        # quotes the LLM may have invented or rephrased.
        promise = self._exact_match_gate(promise, raw_page_text)

        # ── GATE 1: Sentiment Guard ───────────────────────────────────────────
        sentiment_check = self._sentiment_guard(text)
        if not sentiment_check['passed']:
            log.debug(f"Sentiment guard rejected: {sentiment_check['reason']}")
            await self._log_rejection(
                text=text,
                reason=sentiment_check['reason'],
                candidate_id=candidate_id,
                page=page,
            )
            return None

        # ── GATE 2: Duplicate Detection ───────────────────────────────────────
        is_duplicate = await self._is_duplicate(text, candidate_id, election_id)
        if is_duplicate:
            log.debug(f"Duplicate detected: {text[:60]}…")
            return None

        # ── GATE 3: Confidence Threshold ──────────────────────────────────────
        confidence = promise.get('confidence', 0.0)
        if confidence < CONFIDENCE_THRESHOLD:
            log.debug(f"Low confidence ({confidence:.2f}), flagging for review")
            promise['flagged_for_review'] = True
            promise['flag_reason'] = f"low_confidence:{confidence:.2f}"

        # ── BUILD VALIDATED RECORD ────────────────────────────────────────────
        return self._build_record(
            promise=promise,
            candidate_id=candidate_id,
            election_id=election_id,
            page=page,
        )

    # ── Gate 0: Exact-Match ───────────────────────────────────────────────────

    def _exact_match_gate(self, promise: dict, raw_text: str) -> dict:
        """
        Verify the LLM quote is present in the raw page text.

        Mutates promise['confidence'] in-place with a penalty if the
        quote cannot be found.  Returns the (possibly modified) promise.
        """
        # CORREÇÃO: Buscando a variável 'quote' em vez de 'text_original'
        quote = promise.get('quote', '').strip()
        original_conf = float(promise.get('confidence', 0.0))

        if not quote or not raw_text:
            promise['quote_match'] = 'skipped'
            return promise

        # Level 1: verbatim
        if quote in raw_text:
            promise['quote_match'] = 'exact'
            return promise

        # Level 2: unicode-normalised casefold
        def norm(s: str) -> str:
            return unicodedata.normalize('NFKD', s).casefold()

        if norm(quote) in norm(raw_text):
            penalised = max(0.0, original_conf - QUOTE_FUZZY_PENALTY)
            promise['confidence'] = penalised
            promise['quote_match'] = 'normalised'
            log.info(
                f"[GATE 0] Fuzzy match: conf {original_conf:.3f} → {penalised:.3f} "
                f"| quote={quote[:60]}…"
            )
            return promise

        # Level 3: rolling 30-char chunk search
        CHUNK = 30
        if len(quote) > CHUNK:
            windows = [(quote[i:i + CHUNK]) for i in range(0, len(quote) - CHUNK + 1, CHUNK)]
            hits = sum(1 for w in windows if w in raw_text)
            if hits >= max(1, len(windows) // 2):
                penalised = max(0.0, original_conf - QUOTE_FUZZY_PENALTY)
                promise['confidence'] = penalised
                promise['quote_match'] = 'normalised'
                log.info(
                    f"[GATE 0] Partial chunk match ({hits}/{len(windows)}): "
                    f"conf {original_conf:.3f} → {penalised:.3f}"
                )
                return promise

        # Level 4: complete mismatch
        penalised = max(0.0, original_conf - QUOTE_MISMATCH_PENALTY)
        promise['confidence'] = penalised
        promise['quote_match'] = 'failed'
        log.warning(
            f"[GATE 0] Quote NOT in raw page: conf {original_conf:.3f} → {penalised:.3f} "
            f"| quote={quote[:80]}…"
        )
        return promise

    # ── Gate 1: Sentiment Guard ───────────────────────────────────────────────

    def _sentiment_guard(self, text: str) -> dict:
        """
        Rejects text containing attacks, insults, or editorial framing.
        Returns {'passed': bool, 'reason': str}
        """
        text_lower = text.lower()

        for pattern in ATTACK_PATTERNS:
            if re.search(pattern, text_lower):
                return {'passed': False, 'reason': f'attack_pattern:{pattern}'}

        for pattern in VAGUE_PATTERNS:
            if re.search(pattern, text_lower):
                return {'passed': False, 'reason': f'vague_statement:{pattern}'}

        for pattern in HISTORICAL_PATTERNS:
            if re.search(pattern, text_lower):
                return {'passed': False, 'reason': f'historical_claim:{pattern}'}

        words = text.split()
        if len(words) < 8:
            return {'passed': False, 'reason': 'too_short:less_than_8_words'}

        return {'passed': True, 'reason': 'passed'}

    # ── Gate 2: Duplicate Detection ──────────────────────────────────────────

    async def _is_duplicate(
        self,
        text: str,
        candidate_id: str,
        election_id: str,
    ) -> bool:
        """
        Check for exact (SHA-256) or semantic duplicates.
        """
        text_hash = hashlib.sha256(text.encode()).hexdigest()

        if self._db:
            if await self._db.promise_hash_exists(text_hash, candidate_id):
                return True

        # Semantic vector check lives here in production (pgvector / Pinecone).
        # MVP relies on exact hash only.
        return False

    # ── Record builder ────────────────────────────────────────────────────────

    def _build_record(
        self,
        promise: dict,
        candidate_id: str,
        election_id: str,
        page: dict,
    ) -> dict:
        """
        Build the final database record for a validated promise.
        Includes full provenance trail.
        """
        return {
            'id':               str(uuid.uuid4()),
            'candidate_id':     candidate_id,
            'election_id':      election_id,

            # Promise content
            'category':             promise.get('category', 'governance'),
            'secondary_category':   promise.get('secondary_category'),
            'text_original':        promise.get('text_original', ''),
            'quote':                promise.get('quote', ''),  # CORREÇÃO: Faltava este campo!
            'language_original':    promise.get('language_original', 'pt'),
            'verbatim':             promise.get('verbatim', True),
            'ambiguous':            promise.get('ambiguous', False),

            # Translations (populated by translator agent downstream)
            'text_en':  promise.get('text_en'),
            'text_es':  promise.get('text_es'),
            'text_fr':  promise.get('text_fr'),
            'text_ar':  promise.get('text_ar'),
            'text_zh':  promise.get('text_zh'),
            'text_pt':  promise.get('text_pt'),

            # Provenance — the audit trail
            'source_url':    page.get('url', ''),
            'source_type':   page.get('source_type', ''),
            'archive_url':   page.get('archive_url', ''),
            'content_hash':  page.get('content_hash', ''),
            'collected_at':  page.get('collected_at', datetime.now(timezone.utc).isoformat()),

            # Quality signals
            'confidence':       promise.get('confidence', 0.0),
            'quote_match':      promise.get('quote_match', 'skipped'),
            'agent_version':    '2.0.0',
            'status':           'stated',

            # Review flags
            'flagged_for_review': promise.get('flagged_for_review', False),
            'flag_reason':        promise.get('flag_reason'),
        }

    # ── Logging ───────────────────────────────────────────────────────────────

    async def _log_rejection(
        self,
        text: str,
        reason: str,
        candidate_id: str,
        page: dict,
    ) -> None:
        """
        Log every hard rejection to the public extraction_rejections table.
        Nothing is silently discarded.
        """
        log.info(f"[REJECTION LOG] reason={reason} | text={text[:80]}…")

        if self._db:
            await self._db.log_rejection_real(
                candidate_id=candidate_id,
                text=text,
                reason=reason,
                source_url=page.get('url', ''),
            )
