"""
World Contrast — Main Scheduler
File: agents/scheduler.py

Pipeline order (respects FK constraints in schema.sql):
  1. db.start_run()           → INSERT collection_runs
  2. db.upsert_candidate()    → UPSERT candidates
  3. crawler.fetch()          → fetch URL
  4. db.save_crawled_page()   → INSERT crawled_pages
  5. extractor.extract()      → Claude API → promises[]
  6. validator.validate()     → filter + enrich
  7. db.save_promise()        → INSERT promises (needs candidate_id + crawled_page_id)
  8. db.finish_run()          → UPDATE collection_runs
"""

import sys
import os

# Insere a RAIZ do repo no path — permite `from config.x` e `from agents.x`
# os.getcwd() no GitHub Actions é sempre a raiz após o checkout.
sys.path.insert(0, os.getcwd())

import asyncio
import argparse
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Cria logs/ antes do FileHandler tentar abrir o arquivo
Path('logs').mkdir(exist_ok=True)

logging.basicConfig(
    level=os.environ.get('LOG_LEVEL', 'INFO'),
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f'logs/run-{datetime.now().strftime("%Y%m%d-%H%M%S")}.log'),
    ]
)
log = logging.getLogger('scheduler')

from agents.crawler.crawler import WebCrawler
from agents.extraction.extractor import PromiseExtractor
from agents.validation.validator import PromiseValidator
from agents.archive.archiver import PageArchiver
from config.settings import Settings
from config.database import Database


async def run_pipeline(
    country_filter: str | None = None,
    dry_run: bool = False,
    election_id: str | None = None,
) -> dict:

    run_id = str(uuid.uuid4())
    started_at = datetime.now(timezone.utc)

    log.info("═══════════════════════════════════════")
    log.info(f"World Contrast Agent — Run {run_id[:8]}")
    log.info(f"Started:        {started_at.isoformat()}")
    log.info(f"Country filter: {country_filter or 'all'}")
    log.info(f"Dry run:        {dry_run}")
    log.info("═══════════════════════════════════════")

    settings = Settings()

    stats = {
        'run_id': run_id,
        'started_at': started_at.isoformat(),
        'country_filter': country_filter,
        'dry_run': dry_run,
        'elections_processed': 0,
        'sources_visited': 0,
        'pages_archived': 0,
        'promises_extracted': 0,
        'promises_rejected': 0,
        'promises_saved': 0,
        'errors': [],
    }

    # ── STEP 1: Open DB + start run ───────────────────────────
    db = None
    if not dry_run:
        db = Database(settings)
        trigger = 'scheduled' if os.environ.get('GITHUB_EVENT_NAME') == 'schedule' else 'manual'
        await db.start_run(trigger=trigger)

    # ── STEP 2: Load registry ─────────────────────────────────
    log.info("Step 1/5: Loading source registry...")
    registry = load_source_registry(country_filter, election_id)
    log.info(f"  Found {len(registry)} elections to process")

    crawler   = WebCrawler(settings)
    extractor = PromiseExtractor(settings)
    validator = PromiseValidator(settings)
    archiver  = PageArchiver(settings)

    for election in registry:
        log.info(f"\nProcessing: {election['id']} ({election['country']})")
        stats['elections_processed'] += 1

        for candidate in election['candidates']:
            log.info(f"  Candidate: {candidate.get('name', candidate.get('fullName', ''))}")

            # ── STEP 3: Upsert candidate row ──────────────────
            candidate_db_id = None
            if not dry_run and db:
                candidate_db_id = await db.upsert_candidate(
                    candidate=candidate,
                    election_id=election['id'],
                )
                if not candidate_db_id:
                    log.warning(f"  Could not upsert candidate, skipping")
                    continue

            for source_type, url in candidate.get('sources', {}).items():
                if not url:
                    continue

                log.info(f"    [{source_type}] {url}")
                stats['sources_visited'] += 1

                try:
                    # ── STEP 4: Crawl ─────────────────────────
                    page = await crawler.fetch(url, source_type)
                    if not page:
                        log.warning(f"    ✗ Failed to fetch: {url}")
                        stats['errors'].append(f"fetch_failed:{url}")
                        continue

                    # ── STEP 5: Archive ───────────────────────
                    archive_url = await archiver.save(page)
                    page['archive_url'] = archive_url
                    stats['pages_archived'] += 1
                    log.info(f"    ✓ Archived: {archive_url}")

                    # ── STEP 6: Save crawled page (gets UUID) ─
                    crawled_page_id = None
                    if not dry_run and db:
                        crawled_page_id = await db.save_crawled_page(
                            page=page,
                            candidate_id=candidate_db_id,
                        )

                    # ── STEP 7: Extract ───────────────────────
                    extraction = await extractor.extract(
                        content=page['text'],
                        candidate_name=candidate.get('name', ''),
                        country=election['country'],
                        source_type=source_type,
                        source_url=url,
                        collection_date=datetime.now(timezone.utc).date().isoformat(),
                    )

                    promises_found = len(extraction.get('promises', []))
                    rejected = extraction.get('extraction_metadata', {}).get('total_rejected', 0)
                    stats['promises_extracted'] += promises_found
                    stats['promises_rejected'] += rejected
                    log.info(f"    ✓ Extracted: {promises_found} promises, {rejected} rejected")

                    if dry_run:
                        for p in extraction.get('promises', []):
                            log.info(f"      → [{p.get('category')}] {p.get('text_original','')[:80]}...")
                        continue

                    # ── STEP 8: Validate + Save ───────────────
                    for raw_promise in extraction.get('promises', []):
                        validated = await validator.validate(
                            promise=raw_promise,
                            candidate_id=candidate.get('id', ''),
                            election_id=election['id'],
                            page=page,
                        )

                        if not validated:
                            log.debug(f"      Validator rejected: {raw_promise.get('text_original','')[:60]}")
                            continue

                        # Inject the DB foreign keys before saving
                        validated['candidate_id']    = candidate_db_id
                        validated['crawled_page_id'] = crawled_page_id
                        validated['source_url']      = url
                        validated['archive_url']     = archive_url
                        validated['content_hash']    = page.get('content_hash', '')

                        if db:
                            saved = await db.save_promise(validated)
                            if saved:
                                stats['promises_saved'] += 1

                except Exception as e:
                    log.error(f"    ✗ Error processing {url}: {e}")
                    stats['errors'].append(f"processing_error:{url}:{str(e)}")
                    continue

    # ── FINALIZE ─────────────────────────────────────────────
    stats['completed_at'] = datetime.now(timezone.utc).isoformat()
    stats['status'] = 'completed' if not stats['errors'] else 'completed_with_errors'

    log.info("\n═══════════════════════════════════════")
    log.info(f"Run complete:        {run_id[:8]}")
    log.info(f"Elections processed: {stats['elections_processed']}")
    log.info(f"Sources visited:     {stats['sources_visited']}")
    log.info(f"Pages archived:      {stats['pages_archived']}")
    log.info(f"Promises extracted:  {stats['promises_extracted']}")
    log.info(f"Promises rejected:   {stats['promises_rejected']}")
    log.info(f"Promises saved:      {stats['promises_saved']}")
    log.info(f"Errors:              {len(stats['errors'])}")
    log.info("═══════════════════════════════════════")

    if not dry_run and db:
        await db.finish_run(stats)

    return stats


def load_source_registry(
    country_filter: str | None = None,
    election_id: str | None = None,
) -> list[dict]:
    import json
    data_dir = Path(os.getcwd()) / 'data' / 'countries'

    if not data_dir.exists():
        log.warning(f"Data directory not found: {data_dir}")
        return []

    elections = []
    for filepath in sorted(data_dir.glob('*.json')):
        with open(filepath) as f:
            data = json.load(f)

        if country_filter and data.get('country_code') != country_filter:
            continue

        country_elections = data.get('elections', [])
        if election_id:
            country_elections = [e for e in country_elections if e['id'] == election_id]

        for election in country_elections:
            elections.append({
                'id':           election['id'],
                'country':      data['country_code'],
                'tribunal_url': data.get('tribunal', {}).get('url'),
                'candidates':   election.get('candidates', []),
            })

    return elections


def main():
    parser = argparse.ArgumentParser(
        description='World Contrast Agent — Collection Pipeline',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python agents/scheduler.py                          # all countries
  python agents/scheduler.py --country BR             # Brazil only
  python agents/scheduler.py --country BR --dry-run   # test, no DB writes
  python agents/scheduler.py --election brazil-2026   # specific election
        """
    )
    parser.add_argument('--country',  help='ISO country code (e.g. BR)')
    parser.add_argument('--election', help='Election ID (e.g. brazil-2026)')
    parser.add_argument('--dry-run',  action='store_true')
    args = parser.parse_args()

    stats = asyncio.run(run_pipeline(
        country_filter=args.country,
        dry_run=args.dry_run,
        election_id=args.election,
    ))

    sys.exit(1 if stats.get('errors') else 0)


if __name__ == '__main__':
    main()
