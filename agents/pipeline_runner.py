"""
World Contrast — Pipeline Runner
File: agents/pipeline_runner.py
"""
import asyncio
import logging
import hashlib
from datetime import datetime, timezone

log = logging.getLogger('pipeline')

MAX_CONCURRENT_CRAWLS = 8
MAX_CONCURRENT_EXTRACTIONS = 3

class PipelineRunner:
    def __init__(self, crawler, extractor, validator, archiver, db, telegram_bot=None, dry_run=False):
        self.crawler = crawler
        self.extractor = extractor
        self.validator = validator
        self.archiver = archiver
        self.db = db
        self.telegram_bot = telegram_bot
        self.dry_run = dry_run

    async def run_parallel(self, registry: list[dict], stats: dict) -> dict:
        tasks = []
        for election in registry:
            election_id = election['id']
            country = election['country']
            
            for candidate in election['candidates']:
                candidate_db_id = None
                if not self.dry_run and self.db:
                    candidate_db_id = await self.db.upsert_candidate(candidate, election_id)
                
                tasks.append(
                    self._process_candidate_streams(candidate, candidate_db_id, election_id, country, stats)
                )

        results = await asyncio.gather(*tasks, return_exceptions=True)
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
            if not url: continue
            streams.append(
                self._process_source(url, source_type, candidate, candidate_name, candidate_db_id, election_id, country, stats, crawl_sem, extract_sem)
            )
            
        await asyncio.gather(*streams, return_exceptions=True)

    async def _process_source(self, url, source_type, candidate, candidate_name, candidate_db_id, election_id, country, stats, crawl_sem, extract_sem):
        log.info(f"    [{source_type}] {url}")
        stats['sources_visited'] += 1

        try:
            async with crawl_sem:
                page = await self.crawler.fetch(url, source_type)
            
            if not page:
                log.warning(f"    ✗ Failed to fetch: {url}")
                stats['errors'].append(f"fetch_failed:{url}")
                return

            archive_url = None
            if self.archiver is not None:
                try: archive_url = await self.archiver.save(page); stats['pages_archived'] += 1
                except Exception as arch_err: pass
            page['archive_url'] = archive_url or ''

            crawled_page_id = None
            if not self.dry_run and self.db:
                crawled_page_id = await self.db.save_crawled_page(page, candidate_db_id)

            async with extract_sem:
                 extraction = await self.extractor.extract(
                     content=page['text'], candidate_name=candidate_name, country=country,
                     source_type=source_type, source_url=url, collection_date=datetime.now(timezone.utc).date().isoformat(),
                 )

            stats['promises_extracted'] += len(extraction.get('promises', []))
            stats['promises_rejected'] += extraction.get('extraction_metadata', {}).get('total_rejected', 0)

            if self.dry_run: return

            for raw_promise in extraction.get('promises', []):
                # FILTRO MÁGICO APLICADO: Removemos a linha problemática do text_hash!
                
                validated = await self.validator.validate(raw_promise, candidate.get('id', ''), election_id, page)
                if not validated: continue

                validated['candidate_id'] = candidate_db_id
                validated['crawled_page_id'] = crawled_page_id
                validated['source_url'] = url
                validated['archive_url'] = archive_url
                validated['content_hash'] = page.get('content_hash', '')
                validated['prompt_hash'] = self.extractor.get_prompt_hash()

                if validated.get('flagged_for_review'):
                    if self.telegram_bot and not self.dry_run:
                        try: await self.telegram_bot.send_for_review(validated, candidate_name)
                        except: pass
                    stats['pending_reviews'] = stats.get('pending_reviews', 0) + 1
                else:
                    if self.db and not self.dry_run:
                        saved = await self.db.save_promise(validated)
                        if saved: stats['promises_saved'] += 1

            if self.db and 'extraction_rejections' in extraction:
                for rej in extraction['extraction_rejections']:
                     await self.db.log_rejection_real(candidate_id=candidate_db_id, text=rej.get('text_original', rej.get('text', '')), reason=rej.get('rejection_reason', 'rejected_by_llm'), source_url=url)

        except Exception as e:
            log.error(f"    ✗ Error processing {url}: {e}")
            stats['errors'].append(f"processing_error:{url}:{str(e)}")
