"""
World Contrast — Database
File: config/database.py

Persistence layer via Supabase.
Follows exactly the schema in backend/db/schema.sql.

Table order (respecting foreign keys):
  1. collection_runs   — one record per agent execution
  2. candidates        — upsert before saving promises
  3. crawled_pages     — one record per URL fetched
  4. promises          — the core data, requires candidates + crawled_pages
"""

import logging
from datetime import datetime, timezone

log = logging.getLogger('database')


class Database:
    def __init__(self, settings):
        try:
            from supabase import create_client
        except ImportError:
            raise ImportError("Add 'supabase>=2.5.0' to agents/requirements.txt")

        self.client = create_client(settings.supabase_url, settings.supabase_key)
        self.agent_version = settings.agent_version
        self.run_id = None  # set by start_run()
        log.info("Database connected to Supabase")

    # ── COLLECTION RUNS ───────────────────────────────────────

    async def start_run(self, trigger: str = 'manual') -> str:
        """
        Insert a new row in collection_runs and store the UUID.
        Call this FIRST before processing anything.

        trigger: 'scheduled' | 'manual' | 'ci'
        Returns: run UUID string
        """
        record = {
            'started_at':             datetime.now(timezone.utc).isoformat(),
            'status':                 'running',
            'candidates_processed':   0,
            'sources_crawled':        0,
            'promises_extracted':     0,
            'promises_rejected':      0,
            'agent_version':          self.agent_version,
            'trigger':                trigger,
        }
        result = self.client.table('collection_runs').insert(record).execute()
        self.run_id = result.data[0]['id']
        log.info(f"Run started: {self.run_id}")
        return self.run_id

    async def finish_run(self, stats: dict) -> None:
        """
        Update the collection_runs row with final counters and status.
        Call this LAST after all processing is done.
        """
        if not self.run_id:
            log.warning("finish_run called but no run_id set")
            return

        update = {
            'completed_at':           datetime.now(timezone.utc).isoformat(),
            'status':                 'completed' if not stats.get('errors') else 'failed',
            'candidates_processed':   stats.get('elections_processed', 0),
            'sources_crawled':        stats.get('sources_visited', 0),
            'promises_extracted':     stats.get('promises_extracted', 0),
            'promises_rejected':      stats.get('promises_rejected', 0),
        }
        self.client.table('collection_runs').update(update).eq('id', self.run_id).execute()
        log.info(f"Run finished: {self.run_id} — {update['status']}")

    # ── CANDIDATES ────────────────────────────────────────────

    async def upsert_candidate(self, candidate: dict, election_id: str) -> str | None:
        """
        Upsert a candidate row. Returns the candidate UUID.

        candidate dict keys (from data/countries/*.json):
          id, name, party, electoral_number, sources{}

        The 'id' field in the JSON is used as electoral_number.
        Upsert key: electoral_number + election_id (avoids duplicates across runs).
        """
        try:
            record = {
                'election_id':           election_id,
                'full_legal_name':       candidate.get('fullName') or candidate.get('name', ''),
                'display_name':          candidate.get('name', ''),
                'party_name':            candidate.get('party', ''),
                'electoral_number':      str(candidate.get('electoralNumber') or candidate.get('id', '')),
                'electoral_filing_url':  candidate.get('sources', {}).get('electoralFiling', ''),
                'official_site_url':     candidate.get('sources', {}).get('officialSite', ''),
                'instagram_url':         candidate.get('sources', {}).get('instagram', ''),
                'facebook_url':          candidate.get('sources', {}).get('facebook', ''),
                'twitter_url':           candidate.get('sources', {}).get('twitter', ''),
                'updated_at':            datetime.now(timezone.utc).isoformat(),
            }

            result = (
                self.client.table('candidates')
                .upsert(record, on_conflict='electoral_number,election_id')
                .execute()
            )
            candidate_uuid = result.data[0]['id']
            log.debug(f"Candidate upserted: {record['display_name']} → {candidate_uuid}")
            return candidate_uuid

        except Exception as e:
            log.error(f"Failed to upsert candidate {candidate.get('name')}: {e}")
            return None

    # ── CRAWLED PAGES ─────────────────────────────────────────

    async def save_crawled_page(self, page: dict, candidate_id: str) -> str | None:
        """
        Insert a crawled_pages row. Returns the page UUID.
        This UUID becomes crawled_page_id in promises.

        page dict keys (from WebCrawler.fetch):
          url, archive_url, content_hash, http_status,
          content_type, content_length, error
        """
        if not self.run_id:
            log.warning("save_crawled_page called but no run_id — call start_run() first")
            return None

        try:
            record = {
                'run_id':          self.run_id,
                'candidate_id':    candidate_id,
                'url':             page.get('url', ''),
                'archive_url':     page.get('archive_url', ''),
                'content_hash':    page.get('content_hash', ''),
                'collected_at':    datetime.now(timezone.utc).isoformat(),
                'http_status':     page.get('http_status', 200),
                'content_type':    page.get('content_type', 'text/html'),
                'content_length':  page.get('content_length', 0),
                'error':           page.get('error'),
            }

            result = (
                self.client.table('crawled_pages')
                .insert(record)
                .execute()
            )
            page_uuid = result.data[0]['id']
            log.debug(f"Crawled page saved: {record['url'][:60]} → {page_uuid}")
            return page_uuid

        except Exception as e:
            log.error(f"Failed to save crawled page {page.get('url', '')}: {e}")
            return None

    # ── PROMISES ──────────────────────────────────────────────

    async def save_promise(self, promise: dict) -> dict | None:
        """
        Insert a validated promise into the `promises` table.
        Requires promise['candidate_id'] and promise['crawled_page_id']
        to already exist in their respective tables.

        promise dict keys (from PromiseValidator.validate):
          candidate_id, crawled_page_id, category,
          text_original, language_original,
          text_pt, text_en, text_es, text_fr, text_ar,
          source_url, archive_url, content_hash,
          collected_at, confidence, verbatim, ambiguous
        """
        try:
            record = {
                # Foreign keys — MUST exist before insert
                'candidate_id':      promise['candidate_id'],
                'crawled_page_id':   promise['crawled_page_id'],

                # Category (must match CHECK constraint in schema)
                'category':          promise.get('category', 'governance'),
                'secondary_category': promise.get('secondary_category'),

                # Content
                'text_original':     promise.get('text_original', ''),
                'language_original': promise.get('language_original', 'pt'),
                'text_pt':           promise.get('text', {}).get('pt', ''),
                'text_en':           promise.get('text', {}).get('en', ''),
                'text_es':           promise.get('text', {}).get('es', ''),
                'text_fr':           promise.get('text', {}).get('fr', ''),
                'text_ar':           promise.get('text', {}).get('ar', ''),

                # Provenance
                'source_url':        promise.get('source_url', ''),
                'archive_url':       promise.get('archive_url', ''),
                'content_hash':      promise.get('content_hash', ''),
                'collected_at':      promise.get('collected_at',
                                        datetime.now(timezone.utc).isoformat()),

                # Quality
                'confidence':        promise.get('confidence', 0.0),
                'verbatim':          promise.get('verbatim', True),
                'ambiguous':         promise.get('ambiguous', False),
                'agent_version':     self.agent_version,

                # Status (default from schema)
                'status':            'stated',
            }

            result = (
                self.client.table('promises')
                .insert(record)
                .execute()
            )
            saved = result.data[0] if result.data else None
            if saved:
                log.debug(f"Promise saved: [{record['category']}] {record['text_original'][:60]}")
            return saved

        except Exception as e:
            log.error(f"Failed to save promise: {e}")
            return None
