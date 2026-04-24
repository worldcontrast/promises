"""
World Contrast — Pipeline Runner (v2)
File: agents/pipeline_runner.py

Orchestrates multi-source extraction with confidence-based routing.

New in v2:
  — ConfidenceRouter wired into step 5 (validate & route)
  — raw page text passed through the whole chain for Gate 0
  — stats extended with routing counters
  — import hashlib moved to module level

Flow per source:
  1. Crawl        (bounded by crawl_sem)
  2. Archive      (Wayback Machine)
  3. Save page    (crawled_pages table)
  4. Extract      (bounded by extract_sem, releases API ASAP)
  5. Validate     (Gates 0-3, mutates confidence)
  6. Route        ┬─ confidence ≥ 0.95 AND seed URL → AUTO-APPROVE
                  └─ otherwise                       → TELEGRAM HITL

Concurrency model:
  MAX_CONCURRENT_CRAWLS     = 8   (I/O bound)
  MAX_CONCURRENT_EXTRACTIONS = 3  (Anthropic API rate limit)
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional

from agents.validation.confidence_router import ConfidenceRouter

log = logging.getLogger('pipeline')

# ── Concurrency limits (Pillar 2 — Technological Equivalence) ────────────────
MAX_CONCURRENT_CRAWLS      = 8
MAX_CONCURRENT_EXTRACTIONS = 3


class PipelineRunner:
    """
    Orchestrates the full extraction pipeline for all candidates in a registry.

    Args:
        crawler:           Async HTTP crawler.
        extractor:         LLM extractor (POCVA-01 protocol).
        validator:         PromiseValidator (Gates 0-3).
        router:            ConfidenceRouter — decides auto-approve vs HITL.
        archiver:          Wayback Machine archiver.
        db:                Database adapter.
        dry_run:           If True, nothing is written to the database.
    """

    def __init__(
        self,
        crawler,
        extractor,
        validator,
        router: ConfidenceRouter,
        archiver,
        db,
        dry_run: bool = False,
    ) -> None:
        self.crawler   = crawler
        self.extractor = extractor
        self.validator = validator
        self.router    = router
        self.archiver  = archiver
        self.db        = db
        self.dry_run   = dry_run

    # ── Public orchestration ──────────────────────────────────────────────────

    async def run_parallel(self, registry: list[dict], stats: dict) -> dict:
        """
        Entry point.  Upserts candidates sequentially (avoids race conditions
        on the same candidate_id), then processes all sources in parallel.

        Args:
            registry: List of election dicts.  Each must contain 'id',
                      'country', and 'candidates' (list).
            stats:    Mutable stats dict accumulated across the run.

        Returns:
            Updated stats dict.
        """
        tasks = []

        for election in registry:
            election_id = election['id']
            country     = election['country']

            for candidate in election['candidates']:
                # Upsert is sequential per candidate to prevent concurrent
                # INSERT conflicts on the same candidate_id.
                candidate_db_id: Optional[str] = None
                if not self.dry_run and self.db:
                    candidate_db_id = await self.db.upsert_candidate(
                        candidate, election_id
                    )

                tasks.append(
                    self._process_candidate_streams(
                        candidate=candidate,
                        candidate_db_id=candidate_db_id,
                        election_id=election_id,
                        country=country,
                        stats=stats,
                    )
                )

        results = await asyncio.gather(*tasks, return_exceptions=True)

        for res in results:
            if isinstance(res, Exception):
                log.error(f"Critical candidate processing error: {res}")
                stats['errors'].append(f"concurrent_error:{res!s}")

        return stats

    # ── Per-candidate orchestration ───────────────────────────────────────────

    async def _process_candidate_streams(
        self,
        candidate: dict,
        candidate_db_id: Optional[str],
        election_id: str,
        country: str,
        stats: dict,
    ) -> None:
        """
        Launch all source streams for one candidate, bounded by semaphores.
        Semaphores are per-candidate so one slow candidate cannot starve others.
        """
        crawl_sem   = asyncio.Semaphore(MAX_CONCURRENT_CRAWLS)
        extract_sem = asyncio.Semaphore(MAX_CONCURRENT_EXTRACTIONS)

        sources        = candidate.get('sources', {})
        candidate_name = candidate.get('name', candidate.get('fullName', ''))

        streams = [
            self._process_source(
                url=url,
                source_type=src_type,
                candidate=candidate,
                candidate_name=candidate_name,
                candidate_db_id=candidate_db_id,
                election_id=election_id,
                country=country,
                stats=stats,
                crawl_sem=crawl_sem,
                extract_sem=extract_sem,
            )
            for src_type, url in sources.items()
            if url
        ]

        await asyncio.gather(*streams, return_exceptions=True)

    # ── Per-source pipeline ───────────────────────────────────────────────────

    async def _process_source(
        self,
        url: str,
        source_type: str,
        candidate: dict,
        candidate_name: str,
        candidate_db_id: Optional[str],
        election_id: str,
        country: str,
        stats: dict,
        crawl_sem: asyncio.Semaphore,
        extract_sem: asyncio.Semaphore,
    ) -> None:
        log.info(f"    [{source_type}] {url}")
        stats['sources_visited'] += 1

        try:
            # ── Step 1: Crawl ─────────────────────────────────────────────────
            async with crawl_sem:
                page = await self.crawler.fetch(url, source_type)

            if not page:
                log.warning(f"    ✗ Failed to fetch: {url}")
                stats['errors'].append(f"fetch_failed:{url}")
                return

            # ── Step 2: Archive ───────────────────────────────────────────────
            archive_url         = await self.archiver.save(page)
            page['archive_url'] = archive_url
            stats['pages_archived'] += 1
            log.info(f"    ✓ Archived: {archive_url}")

            # ── Step 3: Save crawled page ─────────────────────────────────────
            crawled_page_id: Optional[str] = None
            if not self.dry_run and self.db:
                crawled_page_id = await self.db.save_crawled_page(
                    page, candidate_db_id
                )

            # ── Step 4: Extract ───────────────────────────────────────────────
            # Extract ASAP then release the semaphore before the slow
            # validate+route work so we don't monopolise Anthropic API slots.
            async with extract_sem:
                extraction = await self.extractor.extract(
                    content=page['text'],
                    candidate_name=candidate_name,
                    country=country,
                    source_type=source_type,
                    source_url=url,
                    collection_date=datetime.now(timezone.utc).date().isoformat(),
                )

            promises_found = len(extraction.get('promises', []))
            rejected_by_llm = (
                extraction.get('extraction_metadata', {})
                .get('total_rejected', 0)
            )
            stats['promises_extracted'] += promises_found
            stats['promises_rejected']  += rejected_by_llm
            log.info(
                f"    ✓ Extracted {promises_found} promises, "
                f"{rejected_by_llm} rejected | {url}"
            )

            if self.dry_run:
                for p in extraction.get('promises', []):
                    log.info(
                        f"      → [{p.get('category')}] "
                        f"{p.get('text_original', '')[:80]}…"
                    )
                return

            # ── Step 5: Log LLM rejections ────────────────────────────────────
            if self.db and 'extraction_rejections' in extraction:
                for rej in extraction['extraction_rejections']:
                    await self.db.log_rejection_real(
                        candidate_id=candidate_db_id,
                        text=rej.get('text', ''),
                        reason=rej.get('reason', 'rejected_by_llm'),
                        source_url=url,
                    )

            # ── Step 6: Validate → Route ──────────────────────────────────────
            for raw_promise in extraction.get('promises', []):
                await self._validate_and_route(
                    raw_promise=raw_promise,
                    candidate=candidate,
                    candidate_db_id=candidate_db_id,
                    election_id=election_id,
                    page=page,
                    crawled_page_id=crawled_page_id,
                    archive_url=archive_url,
                    url=url,
                    stats=stats,
                )

        except Exception as exc:
            log.error(f"    ✗ Error processing {url}: {exc}")
            stats['errors'].append(f"processing_error:{url}:{exc!s}")

    # ── Validate + Route (extracted into own method for testability) ──────────

    async def _validate_and_route(
        self,
        raw_promise: dict,
        candidate: dict,
        candidate_db_id: Optional[str],
        election_id: str,
        page: dict,
        crawled_page_id: Optional[str],
        archive_url: str,
        url: str,
        stats: dict,
    ) -> None:
        """
        Run Gates 0-3 (validator) then hand off to ConfidenceRouter.

        Gate 0 is wired here: the raw page text is passed to the validator
        so it can perform the exact-match substring check and adjust
        confidence before the router makes its decision.
        """
        # Deterministic hash — must happen before validate()
        text_orig = raw_promise.get('text_original', '').strip()
        raw_promise['text_hash'] = hashlib.sha256(text_orig.encode()).hexdigest()

        # Gates 0-3
        validated = await self.validator.validate(
            promise=raw_promise,
            candidate_id=candidate.get('id', ''),
            election_id=election_id,
            page=page,            # page['text'] carries raw HTML for Gate 0
        )

        if not validated:
            # Hard-rejected by Gates 1-3; rejection already logged inside validator
            return

        # Enrich with runtime provenance not available at validator time
        validated['candidate_id']    = candidate_db_id
        validated['crawled_page_id'] = crawled_page_id
        validated['source_url']      = url
        validated['archive_url']     = archive_url
        validated['content_hash']    = page.get('content_hash', '')
        validated['prompt_hash']     = self.extractor.get_prompt_hash()

        # ── ROUTING BIFURCATION ───────────────────────────────────────────────
        #   Route A (confidence ≥ 0.95 AND seed URL) → auto-approve to Supabase
        #   Route B (anything else)                  → Telegram HITL
        decision = await self.router.route(
            validated=validated,
            raw_page_text=page.get('text', ''),   # Gate 0 already ran; router re-checks
        )

        # Update stats by route
        if decision.route == 'auto_approve':
            stats['promises_saved']         = stats.get('promises_saved', 0) + 1
            stats['auto_approved']          = stats.get('auto_approved', 0) + 1
        else:
            stats['sent_to_telegram']       = stats.get('sent_to_telegram', 0) + 1

        log.info(
            f"      → [{decision.route.upper()}] "
            f"conf={decision.final_confidence:.3f} "
            f"quote={decision.quote_match} "
            f"| {text_orig[:60]}…"
        )
