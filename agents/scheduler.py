"""
World Contrast — Main Scheduler v2.0
File: agents/scheduler.py
"""

import sys
import os

sys.path.insert(0, os.getcwd())

import asyncio
import argparse
import logging
import uuid
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

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
from agents.pipeline_runner import PipelineRunner
from config.settings import Settings
from config.database import Database

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_]+", "-", text)

async def run_pipeline(
    country_filter: str | None = None,
    dry_run: bool = False,
    election_id: str | None = None,
) -> dict:

    run_id = str(uuid.uuid4())
    started_at = datetime.now(timezone.utc)

    log.info("═══════════════════════════════════════")
    log.info(f"World Contrast Agent — Run {run_id[:8]}")
    log.info("═══════════════════════════════════════")

    settings = Settings()
    stats = {
        'run_id': run_id, 'started_at': started_at.isoformat(),
        'country_filter': country_filter, 'dry_run': dry_run,
        'elections_processed': 0, 'sources_visited': 0,
        'pages_archived': 0, 'promises_extracted': 0,
        'promises_rejected': 0, 'promises_saved': 0, 'errors': [],
    }

    db = None
    if not dry_run:
        db = Database(settings)
        trigger = 'scheduled' if os.environ.get('GITHUB_EVENT_NAME') == 'schedule' else 'manual'
        await db.start_run(trigger=trigger)

    log.info("Step 1/5: Loading source registry...")
    registry = load_source_registry(country_filter, election_id)
    log.info(f"  Found {len(registry)} elections to process")

    if not registry:
        log.warning("No elections found.")
        if not dry_run and db:
            await db.finish_run(stats)
        return stats

    crawler   = WebCrawler(settings)
    extractor = PromiseExtractor(settings)
    validator = PromiseValidator(settings, db=db)
    archiver  = None 

    if db:
        log.info("Step 2/5: Ensuring election records exist in database...")
        for election in registry:
            # CORREÇÃO: Passamos o election_id exato lido do ficheiro
            await db.ensure_election_exists(
                election_id=election['id'],
                country_code=election['country'],
                election_name=election['id'].replace(f"{election['country'].lower()}-", ""),
            )

    runner = PipelineRunner(crawler, extractor, validator, archiver, db, dry_run=dry_run)
    stats = await runner.run_parallel(registry, stats)

    stats['completed_at'] = datetime.now(timezone.utc).isoformat()
    stats['status'] = 'completed' if not stats['errors'] else 'completed_with_errors'

    log.info("\n═══════════════════════════════════════")
    log.info(f"Run complete:        {run_id[:8]}")
    log.info(f"Promises saved:      {stats['promises_saved']}")
    log.info("═══════════════════════════════════════")

    if not dry_run and db:
        await db.finish_run(stats)
        await db.refresh_materialized_view('candidate_stats')

    return stats


def load_source_registry(country_filter: str | None = None, election_id: str | None = None) -> list[dict]:
    import json
    data_dir = Path(os.getcwd()) / 'data' / 'countries'

    if not data_dir.exists():
        return []

    elections = []
    for filepath in sorted(data_dir.glob('*.json')):
        with open(filepath) as f:
            data = json.load(f)

        country = data.get('country') or data.get('country_code')
        if country_filter and country != country_filter:
            continue

        if 'candidates' in data and 'election' in data:
            el_id = data.get('id') or slugify(f"{country}-{data['election']}")
            if election_id and el_id != election_id:
                continue
            
            if data.get('status') == 'scheduled' and not data.get('candidates'):
                continue

            elections.append({
                'id':           el_id,
                'country':      country,
                'tribunal_url': None,
                'candidates':   data.get('candidates', []),
            })
            
    return elections


def main():
    parser = argparse.ArgumentParser(description='World Contrast Agent')
    parser.add_argument('--country',  help='ISO country code (e.g. BR)')
    parser.add_argument('--election', help='Election ID (e.g. brazil-2026)')
    parser.add_argument('--dry-run',  action='store_true')
    args = parser.parse_args()

    stats = asyncio.run(run_pipeline(
        country_filter=args.country,
        dry_run=args.dry_run,
        election_id=args.election,
    ))
    
    erros_criticos = [e for e in stats.get('errors', []) if not e.startswith('fetch_failed')]
    sys.exit(1 if erros_criticos else 0)

if __name__ == '__main__':
    main()
