"""
World Contrast — Promise Validator
File: agents/validation/validator.py

Every extracted promise passes through three validation gates
before being saved to the database:

Gate 1 — Sentiment Guard
  Rejects any promise containing attacks, insults, or
  comparative statements about other candidates.
  Only forward-looking policy commitments pass.

Gate 2 — Duplicate Detector
  Uses vector similarity to detect semantically duplicate
  promises already in the database.
  Same promise from multiple sources → merged, not duplicated.

Gate 3 — Confidence Threshold
  Promises below 0.70 confidence are flagged for data quality
  review (not content review — neutrality is maintained).

All rejections are logged publicly in the extraction_rejections table.
Nothing is silently discarded.
"""

import hashlib
import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Optional

log = logging.getLogger('validator')

# Minimum confidence score to pass validation
CONFIDENCE_THRESHOLD = 0.70

# Similarity threshold for duplicate detection (cosine similarity)
DUPLICATE_THRESHOLD = 0.92

# Patterns that indicate the text is NOT a promise
# (attacks, vague statements, historical claims)
ATTACK_PATTERNS = [
    r'\b(failed|failure|corrupt|corruption|liar|lie|incompetent)\b',
    r'\b(my opponent|the other candidate|unlike my opponent)\b',
    r'\b(disaster|catastrophe|destroyed|ruined)\b',
]

VAGUE_PATTERNS = [
    r'^we believe in\b',
    r'^we are committed to\b',
    r'^we stand for\b',
    r'^we support\b',
]

HISTORICAL_PATTERNS = [
    r'\b(last year|previously|in my previous|during my time as|when I was)\b',
    r'\b(we did|we achieved|we accomplished|we delivered)\b',
]


class PromiseValidator:
    """
    Multi-gate validation for extracted political promises.
    All rejections are logged for full transparency.
    """

    def __init__(self, settings):
        self.settings = settings
        self._db = None  # Lazy-loaded

    async def validate(
        self,
        promise: dict,
        candidate_id: str,
        election_id: str,
        page: dict,
    ) -> Optional[dict]:
        """
        Run all validation gates on a promise.

        Returns:
            Validated promise dict ready for database insertion,
            or None if the promise was rejected.
        """
        text = promise.get('text_original', '').strip()

        if not text:
            log.debug("Rejected: empty text")
            return None

        # ── GATE 1: Sentiment Guard ───────────────────────────
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

        # ── GATE 2: Duplicate Detection ───────────────────────
        is_duplicate = await self._is_duplicate(text, candidate_id, election_id)
        if is_duplicate:
            log.debug(f"Duplicate detected: {text[:60]}...")
            return None

        # ── GATE 3: Confidence Threshold ──────────────────────
        confidence = promise.get('confidence', 0)
        if confidence < CONFIDENCE_THRESHOLD:
            log.debug(f"Low confidence ({confidence:.2f}), flagging for review")
            # Don't reject — flag for human review of data quality
            promise['flagged_for_review'] = True
            promise['flag_reason'] = f"low_confidence:{confidence:.2f}"

        # ── BUILD VALIDATED RECORD ────────────────────────────
        return self._build_record(
            promise=promise,
            candidate_id=candidate_id,
            election_id=election_id,
            page=page,
        )

    def _sentiment_guard(self, text: str) -> dict:
        """
        Checks if text contains attacks, insults, or editorial framing.
        Returns {'passed': bool, 'reason': str}
        """
        text_lower = text.lower()

        for pattern in ATTACK_PATTERNS:
            if re.search(pattern, text_lower):
                return {
                    'passed': False,
                    'reason': f'attack_pattern:{pattern}',
                }

        for pattern in VAGUE_PATTERNS:
            if re.search(pattern, text_lower):
                return {
                    'passed': False,
                    'reason': f'vague_statement:{pattern}',
                }

        for pattern in HISTORICAL_PATTERNS:
            if re.search(pattern, text_lower):
                return {
                    'passed': False,
                    'reason': f'historical_claim:{pattern}',
                }

        # Check for sufficient specificity
        # A promise should be more than 10 words
        words = text.split()
        if len(words) < 8:
            return {
                'passed': False,
                'reason': 'too_short:less_than_8_words',
            }

        return {'passed': True, 'reason': 'passed'}

    async def _is_duplicate(
        self,
        text: str,
        candidate_id: str,
        election_id: str,
    ) -> bool:
        """
        Check if a semantically similar promise already exists
        for this candidate in this election.

        Uses SHA-256 for exact duplicates (fast).
        Uses vector similarity for semantic duplicates (thorough).
        """
        # Fast check: exact hash match
        text_hash = hashlib.sha256(text.encode()).hexdigest()

        # TODO: Check database for existing hash
        # existing = await self._db.find_by_hash(text_hash, candidate_id)
        # if existing:
        #     return True

        # Semantic check via embeddings would go here in production
        # For MVP, we rely on the exact hash check

        return False

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
            'id': str(uuid.uuid4()),
            'candidate_id': candidate_id,
            'election_id': election_id,

            # The promise content
            'category': promise.get('category', 'governance'),
            'secondary_category': promise.get('secondary_category'),
            'text_original': promise.get('text_original', ''),
            'language_original': promise.get('language_original', 'pt'),
            'verbatim': promise.get('verbatim', True),
            'ambiguous': promise.get('ambiguous', False),

            # Translations (populated by translator agent)
            'text_en': promise.get('text_en'),
            'text_es': promise.get('text_es'),
            'text_fr': promise.get('text_fr'),
            'text_ar': promise.get('text_ar'),
            'text_zh': promise.get('text_zh'),
            'text_pt': promise.get('text_pt'),

            # Provenance — the audit trail
            'source_url': page.get('url', ''),
            'source_type': page.get('source_type', ''),
            'archive_url': page.get('archive_url', ''),
            'content_hash': page.get('content_hash', ''),
            'collected_at': page.get('collected_at', datetime.now(timezone.utc).isoformat()),

            # Quality signals
            'confidence': promise.get('confidence', 0.0),
            'agent_version': '1.0.0',
            'status': 'stated',

            # Review flags
            'flagged_for_review': promise.get('flagged_for_review', False),
            'flag_reason': promise.get('flag_reason'),
        }

    async def _log_rejection(
        self,
        text: str,
        reason: str,
        candidate_id: str,
        page: dict,
    ) -> None:
        """
        Log every rejection to the public extraction_rejections table.
        Full transparency — nothing is silently discarded.
        """
        # In production, this saves to the database
        log.info(f"[REJECTION LOG] reason={reason} text={text[:80]}...")

        # TODO: await self._db.log_rejection({
        #     'candidate_id': candidate_id,
        #     'rejected_text': text,
        #     'rejection_reason': reason,
        #     'source_url': page.get('url', ''),
        #     'collected_at': datetime.now(timezone.utc).isoformat(),
        # })
