"""
World Contrast — Database
File: config/database.py

Handles all persistence via Supabase.
Called exclusively by agents/scheduler.py.

Expected tables in Supabase:
  promises   — individual campaign promises
  agent_runs — pipeline execution logs
"""

import logging
from datetime import datetime, timezone

log = logging.getLogger('database')


class Database:
    def __init__(self, settings):
        try:
            from supabase import create_client
        except ImportError:
            raise ImportError(
                "supabase package not installed. "
                "Add 'supabase' to agents/requirements.txt"
            )

        self.client = create_client(settings.supabase_url, settings.supabase_key)
        log.info("Database connected to Supabase")

    async def save_promise(self, promise: dict) -> dict | None:
        """
        Upsert a validated promise into the `promises` table.
        Uses (candidate_id, source_url, category) as the unique key
        to avoid duplicates across runs.

        Args:
            promise: validated promise dict from PromiseValidator

        Returns:
            saved record dict, or None on error
        """
        try:
            record = {
                # Core identity
                'candidate_id':  promise.get('candidate_id'),
                'election_id':   promise.get('election_id'),
                'category':      promise.get('category'),

                # Promise content (multilingual)
                'text_pt':       promise.get('text', {}).get('pt', ''),
                'text_en':       promise.get('text', {}).get('en', ''),
                'text_es':       promise.get('text', {}).get('es', ''),
                'text_original': promise.get('text_original', ''),

                # Optional quote / verbatim excerpt
                'quote_pt':      promise.get('quote', {}).get('pt', ''),
                'quote_en':      promise.get('quote', {}).get('en', ''),

                # Provenance
                'source_url':    promise.get('source_url', ''),
                'archive_url':   promise.get('archive_url', ''),
                'collected_at':  promise.get('collected_at',
                                    datetime.now(timezone.utc).date().isoformat()),

                # Quality signals
                'confidence':    promise.get('confidence', 0.0),

                # Timestamps
                'updated_at':    datetime.now(timezone.utc).isoformat(),
            }

            result = (
                self.client.table('promises')
                .upsert(record, on_conflict='candidate_id,source_url,category')
                .execute()
            )

            saved = result.data[0] if result.data else None
            if saved:
                log.debug(f"Saved promise: [{record['category']}] {record['text_original'][:60]}")
            return saved

        except Exception as e:
            log.error(f"Failed to save promise: {e}")
            return None

    async def save_run_log(self, stats: dict) -> dict | None:
        """
        Insert a pipeline run summary into the `agent_runs` table.

        Args:
            stats: run statistics dict from scheduler.run_pipeline()

        Returns:
            saved record dict, or None on error
        """
        try:
            record = {
                'run_id':               stats.get('run_id'),
                'started_at':           stats.get('started_at'),
                'completed_at':         stats.get('completed_at'),
                'status':               stats.get('status', 'unknown'),
                'country_filter':       stats.get('country_filter'),
                'dry_run':              stats.get('dry_run', False),
                'elections_processed':  stats.get('elections_processed', 0),
                'sources_visited':      stats.get('sources_visited', 0),
                'pages_archived':       stats.get('pages_archived', 0),
                'promises_extracted':   stats.get('promises_extracted', 0),
                'promises_rejected':    stats.get('promises_rejected', 0),
                'promises_saved':       stats.get('promises_saved', 0),
                'error_count':          len(stats.get('errors', [])),
                'errors':               stats.get('errors', []),
            }

            result = (
                self.client.table('agent_runs')
                .insert(record)
                .execute()
            )

            saved = result.data[0] if result.data else None
            if saved:
                log.info(f"Run log saved: {record['run_id'][:8]} — {record['status']}")
            return saved

        except Exception as e:
            log.error(f"Failed to save run log: {e}")
            return None
