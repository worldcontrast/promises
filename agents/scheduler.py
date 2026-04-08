"""
World Contrast — Main Scheduler
File: agents/scheduler.py
"""

import sys
import os

# Garante que a raiz do projeto está no PATH, independente de onde o script é chamado
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import argparse
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

from agents.crawler.crawler import WebCrawler
from agents.extraction.extractor import PromiseExtractor
from agents.validation.validator import PromiseValidator
from agents.archive.archiver import PageArchiver
from config.settings import Settings
from config.database import Database

# ── LOGGING ──────────────────────────────────────────────────
Path('logs').mkdir(exist_ok=True)  # garante que o diretório existe antes de criar o FileHandler

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f'logs/run-{datetime.now().strftime("%Y%m%d-%H%M%S")}.log'),
    ]
)
log = logging.getLogger('scheduler')


# ── PIPELINE ─────────────────────────────────────────────────
async def run_pipeline(
    country_filter: str | None = None,
    dry_run: bool = False,
    election_id: str | None = None,
) -> dict:
    run_id = str(uuid.uuid4())
    started_at = datetime.now(timezone.utc)

    log.info(f"═══════════════════════════════════════")
    log.info(f"World Contrast Agent — Run {run_id[:8]}")
    log.info(f"Started: {started_at.isoformat()}")
    log.info(f"Country filter: {country_filter or 'all'}")
    log.info(f"Dry run: {dry_run}")
    log.info(f"═══════════════════════════════════════")

    settings = Settings()
    db = Database(settings) if not dry_run else None

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

    log.info("Step 1/5: Loading source registry...")
    registry = load_source_registry(country_filter, election_id)
    log.info(f"  Found {len(registry)} elections to process")

    crawler = WebCrawler(settings)
    extractor = PromiseExtractor(settings)
    validator = PromiseValidator(settings)
    archiver = PageArchiver(settings)

    for election in registry:
        log.info(f"\nProcessing: {election['id']} ({election['country']})")
        stats['elections_processed'] += 1

        for candidate in election['candidates']:
            log.info(f"  Candidate: {candidate['name']}")

            for source_type, url in candidate['sources'].items():
                if not url:
                    continue

                log.info(f"    [{source_type}] {url}")
                stats['sources_visited'] += 1

                try:
                    page = await crawler.fetch(url, source_type)
                    if not page:
                        log.warning(f"    ✗ Failed to fetch: {url}")
                        stats['errors'].append(f"fetch_failed:{url}")
                        continue

                    archive_url = await archiver.save(page)
                    page['archive_url'] = archive_url
                    stats['pages_archived'] += 1
                    log.info(f"    ✓ Archived: {archive_url}")

                    extraction = await extractor.extract(
                        content=page['text'],
                        candidate_name=candidate['name'],
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
                            log.info(f"      → [{p['category']}] {p['text_original'][:80]}...")
                        continue

                    for raw_promise in extraction.get('promises', []):
                        validated = await validator.validate(
                            promise=raw_promise,
                            candidate_id=candidate['id'],
                            election_id=election['id'],
                            page=page,
                        )

                        if validated:
                            await db.save_promise(validated)
                            stats['promises_saved'] += 1
                        else:
                            log.debug(f"    Validator rejected: {raw_promise.get('text_original', '')[:60]}")

                except Exception as e:
                    log.error(f"    ✗ Error processing {url}: {e}")
                    stats['errors'].append(f"processing_error:{url}:{str(e)}")
                    continue

    stats['completed_at'] = datetime.now(timezone.utc).isoformat()
    stats['status'] = 'completed' if not stats['errors'] else 'completed_with_errors'

    log.info(f"\n═══════════════════════════════════════")
    log.info(f"Run complete: {run_id[:8]}")
    log.info(f"Elections processed: {stats['elections_processed']}")
    log.info(f"Sources visited:     {stats['sources_visited']}")
    log.info(f"Pages archived:      {stats['pages_archived']}")
    log.info(f"Promises extracted:  {stats['promises_extracted']}")
    log.info(f"Promises rejected:   {stats['promises_rejected']}")
    log.info(f"Promises saved:      {stats['promises_saved']}")
    log.info(f"Errors:              {len(stats['errors'])}")
    log.info(f"═══════════════════════════════════════")

    if not dry_run and db:
        await db.save_run_log(stats)

    return stats


def load_source_registry(
    country_filter: str | None = None,
    election_id: str | None = None,
) -> list[dict]:
    import json
    data_dir = Path(__file__).parent.parent / 'data' / 'countries'

    elections = []
    for filepath in sorted(data_dir.glob('*.json')):
        with open(filepath) as f:
            data = json.load(f)

        if country_filter and data.get('country_code') != country_filter:
            continue
        if election_id:
            data['elections'] = [e for e in data.get('elections', []) if e['id'] == election_id]

        for election in data.get('elections', []):
            elections.append({
                'id': election['id'],
                'country': data['country_code'],
                'tribunal_url': data.get('tribunal', {}).get('url'),
                'candidates': election.get('candidates', []),
            })

    return elections


# ── CLI ENTRY POINT ───────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description='World Contrast Agent — Collection Pipeline',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scheduler.py                        # Run all countries
  python scheduler.py --country BR           # Brazil only
  python scheduler.py --country BR --dry-run # Test without saving
  python scheduler.py --election brazil-2026 # Specific election
        """
    )
    parser.add_argument('--country', help='ISO country code (e.g. BR, US)')
    parser.add_argument('--election', help='Election ID (e.g. brazil-2026)')
    parser.add_argument('--dry-run', action='store_true', help='Extract but do not save')
    args = parser.parse_args()

    stats = asyncio.run(run_pipeline(
        country_filter=args.country,
        dry_run=args.dry_run,
        election_id=args.election,
    ))

    sys.exit(1 if stats.get('errors') else 0)


if __name__ == '__main__':
    main()
