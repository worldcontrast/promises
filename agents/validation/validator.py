"""
World Contrast — Promise Validator (v2)
File: agents/validation/validator.py
"""

from __future__ import annotations

import logging
import re
import unicodedata
import uuid
from datetime import datetime, timezone
from typing import Optional

log = logging.getLogger('validator')

CONFIDENCE_THRESHOLD: float = 0.70
DUPLICATE_THRESHOLD: float = 0.92
QUOTE_FUZZY_PENALTY: float = 0.10
QUOTE_MISMATCH_PENALTY: float = 0.30

ATTACK_PATTERNS = [
    r'\b(failed|failure|corrupt|corruption|liar|lie|incompetent)\b',
    r'\b(my opponent|the other candidate|unlike my opponent)\b',
    r'\b(disaster|catastrophe|destroyed|ruined)\b',
    r'\b(falhou|fracasso|corrupto|corrupção|mentiroso|mentiu|incompetente)\b',
    r'\b(meu adversário|o outro candidato|ao contrário do meu adversário)\b',
    r'\b(desastre|catástrofe|destruiu|arruinou)\b',
    r'\b(fracasó|fracaso|corrupto|corrupción|mentiroso|mintió|incompetente)\b',
    r'\b(mi oponente|el otro candidato|a diferencia de mi oponente)\b',
]

VAGUE_PATTERNS = [
    r'^we believe in\b', r'^we are committed to\b', r'^we stand for\b', r'^we support\b',
    r'^acreditamos em\b', r'^estamos comprometidos com\b', r'^defendemos\b', r'^apoiamos\b',
    r'^creemos en\b', r'^estamos comprometidos con\b', r'^defendemos\b', r'^apoyamos\b',
]

HISTORICAL_PATTERNS = [
    r'\b(last year|previously|in my previous|during my time as|when I was)\b',
    r'\b(we did|we achieved|we accomplished|we delivered)\b',
    r'\b(no ano passado|anteriormente|no meu governo anterior|quando eu era)\b',
    r'\b(fizemos|conquistamos|realizamos|entregamos)\b',
    r'\b(el año pasado|anteriormente|en mi gobierno anterior|cuando era)\b',
    r'\b(hicimos|logramos|realizamos|entregamos)\b',
]

class PromiseValidator:
    def __init__(self, settings, db=None) -> None:
        self.settings = settings
        self._db = db

    async def validate(self, promise: dict, candidate_id: str, election_id: str, page: dict) -> Optional[dict]:
        text = promise.get('text_original', '').strip()

        if not text:
            return None

        raw_page_text = page.get('text', '')
        promise = self._exact_match_gate(promise, raw_page_text)

        sentiment_check = self._sentiment_guard(text)
        if not sentiment_check['passed']:
            await self._log_rejection(text, sentiment_check['reason'], candidate_id, page)
            return None

        confidence = promise.get('confidence', 0.0)
        if confidence < CONFIDENCE_THRESHOLD:
            promise['flagged_for_review'] = True
            promise['flag_reason'] = f"low_confidence:{confidence:.2f}"

        return self._build_record(promise, candidate_id, election_id, page)

    def _exact_match_gate(self, promise: dict, raw_text: str) -> dict:
        quote = promise.get('quote', '').strip()
        original_conf = float(promise.get('confidence', 0.0))

        if not quote or not raw_text:
            promise['quote_match'] = 'skipped'
            return promise

        if quote in raw_text:
            promise['quote_match'] = 'exact'
            return promise

        def norm(s: str) -> str:
            return unicodedata.normalize('NFKD', s).casefold()

        if norm(quote) in norm(raw_text):
            penalised = max(0.0, original_conf - QUOTE_FUZZY_PENALTY)
            promise['confidence'] = penalised
            promise['quote_match'] = 'normalised'
            return promise

        CHUNK = 30
        if len(quote) > CHUNK:
            windows = [(quote[i:i + CHUNK]) for i in range(0, len(quote) - CHUNK + 1, CHUNK)]
            hits = sum(1 for w in windows if w in raw_text)
            if hits >= max(1, len(windows) // 2):
                penalised = max(0.0, original_conf - QUOTE_FUZZY_PENALTY)
                promise['confidence'] = penalised
                promise['quote_match'] = 'normalised'
                return promise

        penalised = max(0.0, original_conf - QUOTE_MISMATCH_PENALTY)
        promise['confidence'] = penalised
        promise['quote_match'] = 'failed'
        return promise

    def _sentiment_guard(self, text: str) -> dict:
        text_lower = text.lower()
        for pattern in ATTACK_PATTERNS:
            if re.search(pattern, text_lower): return {'passed': False, 'reason': f'attack_pattern:{pattern}'}
        for pattern in VAGUE_PATTERNS:
            if re.search(pattern, text_lower): return {'passed': False, 'reason': f'vague_statement:{pattern}'}
        for pattern in HISTORICAL_PATTERNS:
            if re.search(pattern, text_lower): return {'passed': False, 'reason': f'historical_claim:{pattern}'}
        if len(text.split()) < 8:
            return {'passed': False, 'reason': 'too_short:less_than_8_words'}
        return {'passed': True, 'reason': 'passed'}

    def _build_record(self, promise: dict, candidate_id: str, election_id: str, page: dict) -> dict:
        return {
            'id':               str(uuid.uuid4()),
            'candidate_id':     candidate_id,
            'election_id':      election_id,
            'category':             promise.get('category', 'governance'),
            'secondary_category':   promise.get('secondary_category'),
            'text_original':        promise.get('text_original', ''),
            'quote':                promise.get('quote', ''),
            'language_original':    promise.get('language_original', 'pt'),
            'verbatim':             promise.get('verbatim', True),
            'ambiguous':            promise.get('ambiguous', False),
            
            'text_en':  promise.get('text_en'),
            'text_es':  promise.get('text_es'),
            'text_fr':  promise.get('text_fr'),
            'text_ar':  promise.get('text_ar'),
            'text_zh':  promise.get('text_zh'),
            'text_pt':  promise.get('text_pt'),
            
            # ADICIONADOS OS 4 CAMPOS ESSENCIAIS PARA O SITE
            'accountability_score': int(promise.get('accountability_score', 0)),
            'metrics':              promise.get('metrics', ''),
            'deadline':             promise.get('deadline', ''),
            'verification_criteria':promise.get('verification_criteria', ''),

            'source_url':    page.get('url', ''),
            'source_type':   page.get('source_type', ''),
            'archive_url':   page.get('archive_url', ''),
            'content_hash':  page.get('content_hash', ''),
            'collected_at':  page.get('collected_at', datetime.now(timezone.utc).isoformat()),
            'confidence':       promise.get('confidence', 0.0),
            'quote_match':      promise.get('quote_match', 'skipped'),
            'agent_version':    '2.0.0',
            'status':           'stated',
            'flagged_for_review': promise.get('flagged_for_review', False),
            'flag_reason':        promise.get('flag_reason'),
        }

    async def _log_rejection(self, text: str, reason: str, candidate_id: str, page: dict) -> None:
        if self._db:
            await self._db.log_rejection_real(candidate_id=candidate_id, text=text, reason=reason, source_url=page.get('url', ''))
