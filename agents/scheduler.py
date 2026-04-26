"""
World Contrast — Main Scheduler v2.0
File: agents/scheduler.py

Pipeline order (respects FK constraints in schema.sql):
  1. db.start_run()           → INSERT collection_runs
  2. db.upsert_candidate()    → UPSERT candidates
  3. crawler.fetch()          → fetch URL
  4. db.save_crawled_page()   → INSERT crawled_pages
  5. extractor.extract()      → Claude API → promises[]
  6. validator.validate()     → filter + enrich
  7. db.save_promise()        → INSERT promises
  8. db.finish_run()          → UPDATE collection_runs
"""

import sys
import os

# Insere a RAIZ do repo no path
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
        log.warning("No elections found. Check if the JSON files have the correct schema.")
        if not dry_run and db:
            await db.finish_run(stats)
        return stats

    crawler   = WebCrawler(settings)
    extractor = PromiseExtractor(settings)
    validator = PromiseValidator(settings, db=db)
    
    # O ARQUIVADOR FOI DESLIGADO PARA PROTEGER A REDE E A API DA ANTHROPIC
    archiver  = None 

    # FIX 1: Garantir que cada eleição existe na tabela ANTES do pipeline correr.
    # Sem isto, upsert_candidate() falha com erro de FK (election_id não existe).
    if db:
        log.info("Step 2/5: Ensuring election records exist in database...")
        for election in registry:
            await db.ensure_election_exists(
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
        # FIX 3: Refrescar a Materialized View após o pipeline para que o
        # frontend veja os dados imediatamente (sem esperar pelo cron do Supabase).
        await db.refresh_materialized_view('candidate_stats')

    return stats


def load_source_registry(country_filter: str | None = None, election_id: str | None = None) -> list[dict]:
    import json
    data_dir = Path(os.getcwd()) / 'data' / 'countries'

    if not data_dir.exists():
        log.warning(f"Data directory not found: {data_dir}")
        return []

    elections = []
    for filepath in sorted(data_dir.glob('*.json')):
        with open(filepath) as f:
            data = json.load(f)

        country = data.get('country') or data.get('country_code')
        if country_filter and country != country_filter:
            continue

        # ── V2 Format (Generated by new Scout) ──
        if 'candidates' in data and 'election' in data:
            el_id = slugify(f"{country}-{data['election']}")
            if election_id and el_id != election_id:
                continue
            
            # Só adicionamos se o status for "live" ou tiver candidatos
            if data.get('status') == 'scheduled' and not data.get('candidates'):
                log.info(f"  Skipping {el_id}: Election is scheduled (no candidates yet).")
                continue

            elections.append({
                'id':           el_id,
                'country':      country,
                'tribunal_url': None,
                'candidates':   data.get('candidates', []),
            })
            
        # ── V1 Format (Legacy) ──
        elif 'elections' in data:
            for election in data['elections']:
                if election_id and election['id'] != election_id:
                    continue
                elections.append({
                    'id':           election['id'],
                    'country':      country,
                    'tribunal_url': data.get('tribunal', {}).get('url'),
                    'candidates':   election.get('candidates', []),
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
    sys.exit(1 if stats.get('errors') else 0)

if __name__ == '__main__':
    main()
