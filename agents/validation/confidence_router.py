"""
World Contrast — Confidence-Based HITL Router
File: agents/validation/confidence_router.py

Routing logic for the Human-in-the-Loop validation pipeline.

Decision tree:
  ┌─────────────────────────────────────────────────────┐
  │  Validated promise arrives from PromiseValidator    │
  └──────────────────────────┬──────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │  Gate 0: Exact-Match Check  │  ← deterministic, pre-LLM
              │  quote substring in raw HTML│
              └──────────────┬──────────────┘
                    pass      │      fail → penalise confidence
                             │
              ┌──────────────▼──────────────┐
              │  score ≥ 0.95               │
              │  AND source in seed list?   │
              └──────┬───────────────┬──────┘
                   YES               NO
                    │                │
        ┌───────────▼──┐     ┌──────▼──────────────────┐
        │ AUTO-APPROVE │     │  TELEGRAM REVIEW (HITL)  │
        │ save + log   │     │  send payload to bot     │
        └──────────────┘     └──────────────────────────┘

All routes are auditable — every decision is written to
the routing_log table with timestamp and reason.
"""

from __future__ import annotations

import logging
import unicodedata
from dataclasses import dataclass
from typing import Optional

import httpx

log = logging.getLogger('confidence_router')

# ── Thresholds ──────────────────────────────────────────────────────────────

# A promise must reach this score AND come from a seed URL to be auto-approved.
AUTO_APPROVE_THRESHOLD: float = 0.95

# If the LLM-extracted quote is not found in the raw page text, we depress the
# confidence by this amount (may push it below AUTO_APPROVE_THRESHOLD).
QUOTE_MISMATCH_PENALTY: float = 0.30

# Penalty applied when quote match only succeeds after normalisation
# (case-fold + unicode normalisation), signalling possible rephrasing.
QUOTE_FUZZY_PENALTY: float = 0.10


@dataclass
class RoutingDecision:
    """Immutable record of the router's decision for audit logging."""
    promise_id: str
    route: str                    # 'auto_approve' | 'telegram_review'
    final_confidence: float
    original_confidence: float
    quote_match: str              # 'exact' | 'normalised' | 'failed' | 'skipped'
    source_in_seed_list: bool
    reason: str                   # human-readable explanation


class ConfidenceRouter:
    """
    Routes a validated promise either to auto-approval or Telegram HITL review.

    Dependencies injected at construction time so every component is
    independently testable without side effects.

    Args:
        seed_urls:         Allowlist of trusted source domains/URLs.
                           Only promises from these sources can be auto-approved.
        telegram_notifier: Object exposing ``async send(payload) -> str``.
                           Returns a Telegram message_id for tracking.
        db:                Database adapter.  Must expose:
                           - async save_promise(record) -> bool
                           - async log_routing_decision(decision) -> None
    """

    def __init__(
        self,
        seed_urls: set[str],
        telegram_notifier,
        db,
    ) -> None:
        self.seed_urls = seed_urls
        self.telegram = telegram_notifier
        self.db = db

    # ── Public entry point ──────────────────────────────────────────────────

    async def route(self, validated: dict, raw_page_text: str) -> RoutingDecision:
        """
        Evaluate a validated promise and dispatch to the correct lane.

        Args:
            validated:      Record from PromiseValidator._build_record().
            raw_page_text:  Full HTML/text of the crawled page — used for
                            the deterministic exact-match anti-hallucination check.

        Returns:
            RoutingDecision describing what happened and why.
        """
        promise_id    = validated.get('id', 'unknown')
        original_conf = float(validated.get('confidence', 0.0))
        source_url    = validated.get('source_url', '')
        quote         = validated.get('text_original', '')  # verbatim quote from LLM

        # ── GATE 0: Deterministic exact-match check ─────────────────────────
        final_conf, quote_match = self._exact_match_check(
            quote=quote,
            raw_text=raw_page_text,
            original_confidence=original_conf,
        )

        if final_conf != original_conf:
            validated['confidence'] = final_conf
            log.warning(
                f"[ROUTER] Quote mismatch penalty applied "
                f"{original_conf:.2f} → {final_conf:.2f} | id={promise_id}"
            )

        # ── GATE 1: Source in seed list? ────────────────────────────────────
        source_trusted = self._is_trusted_source(source_url)

        # ── ROUTING DECISION ────────────────────────────────────────────────
        if final_conf >= AUTO_APPROVE_THRESHOLD and source_trusted:
            decision = await self._auto_approve(
                validated=validated,
                promise_id=promise_id,
                final_conf=final_conf,
                original_conf=original_conf,
                quote_match=quote_match,
            )
        else:
            reason = self._build_rejection_reason(
                final_conf=final_conf,
                source_trusted=source_trusted,
                quote_match=quote_match,
            )
            decision = await self._send_to_telegram(
                validated=validated,
                promise_id=promise_id,
                final_conf=final_conf,
                original_conf=original_conf,
                quote_match=quote_match,
                source_trusted=source_trusted,
                reason=reason,
            )

        # Persist routing decision for public audit trail
        if self.db:
            await self.db.log_routing_decision(decision)

        return decision

    # ── Private: exact-match anti-hallucination gate ────────────────────────

    def _exact_match_check(
        self,
        quote: str,
        raw_text: str,
        original_confidence: float,
    ) -> tuple[float, str]:
        """
        Verify that the LLM-supplied quote (text_original) is actually
        present as a substring in the raw page text.

        Three outcomes:
          'exact'      — verbatim match found → confidence unchanged
          'normalised' — match only after unicode fold → small penalty
          'failed'     — not found at all → large penalty
          'skipped'    — quote or raw_text is empty → no check possible

        Returns (adjusted_confidence, match_status)
        """
        if not quote or not raw_text:
            return original_confidence, 'skipped'

        # Strip surrounding whitespace from both sides
        q = quote.strip()

        # ── Level 1: verbatim substring ─────────────────────────────────────
        if q in raw_text:
            return original_confidence, 'exact'

        # ── Level 2: unicode-normalised case-folded ──────────────────────────
        # Catches smart-quotes (" "), non-breaking spaces, accents that were
        # decoded differently between the LLM output and the raw HTML.
        def normalise(s: str) -> str:
            return unicodedata.normalize('NFKD', s).casefold()

        if normalise(q) in normalise(raw_text):
            penalised = max(0.0, original_confidence - QUOTE_FUZZY_PENALTY)
            return penalised, 'normalised'

        # ── Level 3: chunk search (handles partial quotes > 30 chars) ────────
        # Sometimes the LLM extracts a sentence boundary slightly differently.
        # If any 30-char rolling window of the quote appears verbatim, we
        # still apply the fuzzy penalty but don't fail completely.
        CHUNK = 30
        if len(q) > CHUNK:
            chunks_found = sum(
                1 for i in range(0, len(q) - CHUNK + 1, CHUNK)
                if q[i:i + CHUNK] in raw_text
            )
            if chunks_found >= max(1, (len(q) // CHUNK) // 2):
                # At least half the chunks matched — partial match
                penalised = max(0.0, original_confidence - QUOTE_FUZZY_PENALTY)
                return penalised, 'normalised'

        # ── Level 4: complete failure ────────────────────────────────────────
        penalised = max(0.0, original_confidence - QUOTE_MISMATCH_PENALTY)
        return penalised, 'failed'

    # ── Private: seed URL check ─────────────────────────────────────────────

    def _is_trusted_source(self, source_url: str) -> bool:
        """
        Returns True if the promise's source_url matches any entry
        in the seed_urls allowlist.

        Matching rules (in priority order):
          1. Exact URL match
          2. Domain suffix match  (e.g. seed='tse.jus.br' matches 'https://www.tse.jus.br/...')
        """
        if not source_url:
            return False

        # Normalise: strip scheme and leading www.
        def bare(url: str) -> str:
            url = url.lower().strip()
            for prefix in ('https://', 'http://', 'www.'):
                if url.startswith(prefix):
                    url = url[len(prefix):]
            return url

        bare_source = bare(source_url)

        for seed in self.seed_urls:
            bare_seed = bare(seed)
            if bare_source == bare_seed or bare_source.startswith(bare_seed):
                return True

        return False

    # ── Private: routing lanes ──────────────────────────────────────────────

    async def _auto_approve(
        self,
        validated: dict,
        promise_id: str,
        final_conf: float,
        original_conf: float,
        quote_match: str,
    ) -> RoutingDecision:
        """
        Fast lane: save directly to database, emit silent audit log.
        No human eyes needed.
        """
        if self.db:
            await self.db.save_promise(validated)

        reason = (
            f"confidence={final_conf:.3f} ≥ {AUTO_APPROVE_THRESHOLD} "
            f"AND source_trusted=True "
            f"AND quote_match={quote_match}"
        )

        log.info(f"[AUTO-APPROVE] {promise_id[:8]}… | conf={final_conf:.3f} | {quote_match}")

        return RoutingDecision(
            promise_id=promise_id,
            route='auto_approve',
            final_confidence=final_conf,
            original_confidence=original_conf,
            quote_match=quote_match,
            source_in_seed_list=True,
            reason=reason,
        )

    async def _send_to_telegram(
        self,
        validated: dict,
        promise_id: str,
        final_conf: float,
        original_conf: float,
        quote_match: str,
        source_trusted: bool,
        reason: str,
    ) -> RoutingDecision:
        """
        HITL lane: format a review payload and send to Telegram bot.
        The human reviewer responds with /approve or /reject.
        """
        payload = self._build_telegram_payload(
            validated=validated,
            final_conf=final_conf,
            quote_match=quote_match,
            source_trusted=source_trusted,
            reason=reason,
        )

        try:
            if self.telegram:
                await self.telegram.send(payload)
            log.info(
                f"[TELEGRAM] {promise_id[:8]}… | conf={final_conf:.3f} "
                f"| trusted={source_trusted} | {quote_match}"
            )
        except Exception as exc:
            # Telegram failure must not block the pipeline — log and continue
            log.error(f"[TELEGRAM] Failed to send review for {promise_id}: {exc}")

        return RoutingDecision(
            promise_id=promise_id,
            route='telegram_review',
            final_confidence=final_conf,
            original_confidence=original_conf,
            quote_match=quote_match,
            source_in_seed_list=source_trusted,
            reason=reason,
        )

    # ── Private: helpers ────────────────────────────────────────────────────

    def _build_rejection_reason(
        self,
        final_conf: float,
        source_trusted: bool,
        quote_match: str,
    ) -> str:
        parts = []
        if final_conf < AUTO_APPROVE_THRESHOLD:
            parts.append(f"confidence={final_conf:.3f} < {AUTO_APPROVE_THRESHOLD}")
        if not source_trusted:
            parts.append("source_not_in_seed_list")
        if quote_match == 'failed':
            parts.append("quote_not_found_in_raw_page")
        elif quote_match == 'normalised':
            parts.append("quote_fuzzy_match_only")
        return " | ".join(parts) if parts else "routing_condition_not_met"

    @staticmethod
    def _build_telegram_payload(
        validated: dict,
        final_conf: float,
        quote_match: str,
        source_trusted: bool,
        reason: str,
    ) -> dict:
        """
        Structured payload sent to the Telegram review bot.
        Reviewers receive all provenance info to make an informed decision.
        """
        return {
            'promise_id':      validated.get('id'),
            'candidate_id':    validated.get('candidate_id'),
            'election_id':     validated.get('election_id'),
            'category':        validated.get('category'),
            'text_original':   validated.get('text_original', ''),
            'confidence':      round(final_conf, 4),
            'quote_match':     quote_match,
            'source_trusted':  source_trusted,
            'source_url':      validated.get('source_url', ''),
            'archive_url':     validated.get('archive_url', ''),
            'content_hash':    validated.get('content_hash', ''),
            'collected_at':    validated.get('collected_at', ''),
            'routing_reason':  reason,
            # Telegram-specific: the bot uses these to build approve/reject buttons
            'review_actions': [
                {'label': '✅ Approve', 'callback': f"approve:{validated.get('id')}"},
                {'label': '❌ Reject',  'callback': f"reject:{validated.get('id')}"},
                {'label': '⚠️ Flag',    'callback': f"flag:{validated.get('id')}"},
            ],
        }
