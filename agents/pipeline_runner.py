"""
World Contrast — Pipeline Runner
File: agents/pipeline_runner.py

Orquestração multi-thread da extração sob a diretriz de "Super Concorrência" (Pilar 1).
Usa asyncio.Semaphore para coordenar crawls e requisições HTTP massivas sem bater limits.
"""
import asyncio
import logging
from datetime import datetime, timezone

log = logging.getLogger('pipeline')

# Constraints from Pilar 1:
MAX_CONCURRENT_CRAWLS = 8
MAX_CONCURRENT_EXTRACTIONS = 3

class PipelineRunner:
    def __init__(self, crawler, extractor, validator, archiver, db, dry_run=False):
        self.crawler = crawler
        self.extractor = extractor
        self.validator = validator
        self.archiver = archiver
        self.db = db
        self.dry_run = dry_run

    async def run_parallel(self, registry: list[dict], stats: dict) -> dict:
        """
        Executes the extraction pipeline with parallel semaphore orchestration.
        """
        tasks = []
        # Para evitar problemas de concorrência com o mesmo candidate_id, upsert candidate 1 por 1, depois paralela.
        # Na verdade, a etapa UPSERT Candidate precisa ser síncrona ou travada por candidate.
        for election in registry:
            election_id = election['id']
            country = election['country']
            
            for candidate in election['candidates']:
                candidate_db_id = None
                if not self.dry_run and self.db:
                    candidate_db_id = await self.db.upsert_candidate(candidate, election_id)
                
                tasks.append(
                    self._process_candidate_streams(
                        candidate=candidate,
                        candidate_db_id=candidate_db_id,
                        election_id=election_id,
                        country=country,
                        stats=stats
                    )
                )

        # Executar todos os candidatos paralelamente
        results = await asyncio.gather(*tasks, return_exceptions=True)
        # Handle exceptions gracefully
        for res in results:
            if isinstance(res, Exception):
                log.error(f"Critical candidate processing error: {res}")
                stats['errors'].append(f"concurrent_error:{str(res)}")
                
        return stats

    async def _process_candidate_streams(self, candidate, candidate_db_id, election_id, country, stats):
        crawl_sem = asyncio.Semaphore(MAX_CONCURRENT_CRAWLS)
        extract_sem = asyncio.Semaphore(MAX_CONCURRENT_EXTRACTIONS)
        
        streams = []
        sources = candidate.get('sources', {})
        candidate_name = candidate.get('name', candidate.get('fullName', ''))

        for src_type, url in sources.items():
            if not url:
                continue
            streams.append(
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
                    extract_sem=extract_sem
                )
            )
            
        await asyncio.gather(*streams, return_exceptions=True)

    async def _process_source(self, url, source_type, candidate, candidate_name, candidate_db_id, election_id, country, stats, crawl_sem, extract_sem):
        log.info(f"    [{source_type}] {url}")
        stats['sources_visited'] += 1

        try:
            # 1. Crawl (Bounded)
            async with crawl_sem:
                page = await self.crawler.fetch(url, source_type)
            
            if not page:
                log.warning(f"    ✗ Failed to fetch: {url}")
                stats['errors'].append(f"fetch_failed:{url}")
                return

            # 2. Archive
            archive_url = await self.archiver.save(page)
            page['archive_url'] = archive_url
            stats['pages_archived'] += 1
            log.info(f"    ✓ Archived: {archive_url}")

            # 3. Save Crawled Page
            crawled_page_id = None
            if not self.dry_run and self.db:
                crawled_page_id = await self.db.save_crawled_page(page, candidate_db_id)

            # 4. Extract (Bounded)
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
            rejected = extraction.get('extraction_metadata', {}).get('total_rejected', 0)
            stats['promises_extracted'] += promises_found
            stats['promises_rejected'] += rejected
            log.info(f"    ✓ Extracted: {promises_found} promises, {rejected} rejected out of {url}")

            if self.dry_run:
                for p in extraction.get('promises', []):
                    log.info(f"      → [{p.get('category')}] {p.get('text_original','')[:80]}...")
                return

            # 5. Validate & Save
            # This happens outside extraction semaphore to release Anthropic API ASAP
            for raw_promise in extraction.get('promises', []):
                # Apply text_hash deterministically
                import hashlib
                text_orig = raw_promise.get('text_original', '').strip()
                raw_promise['text_hash'] = hashlib.sha256(text_orig.encode()).hexdigest()
                
                validated = await self.validator.validate(
                    promise=raw_promise,
                    candidate_id=candidate.get('id', ''),
                    election_id=election_id,
                    page=page,
                )

                if not validated:
                    continue

                validated['candidate_id'] = candidate_db_id
                validated['crawled_page_id'] = crawled_page_id
                validated['source_url'] = url
                validated['archive_url'] = archive_url
                validated['content_hash'] = page.get('content_hash', '')
                validated['prompt_hash'] = self.extractor.get_prompt_hash()

                if self.db:
                    saved = await self.db.save_promise(validated)
                    if saved:
                        stats['promises_saved'] += 1

            # Log Rejections Real
            if self.db and 'extraction_rejections' in extraction:
                for rej in extraction['extraction_rejections']:
                     await self.db.log_rejection_real(
                         candidate_id=candidate_db_id,
                         text=rej.get('text', ''),
                         reason=rej.get('reason', 'rejected_by_llm'),
                         source_url=url
                     )

        except Exception as e:
            log.error(f"    ✗ Error processing {url}: {e}")
            stats['errors'].append(f"processing_error:{url}:{str(e)}")
