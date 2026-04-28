import logging
import re
import unicodedata
from datetime import datetime, timezone

log = logging.getLogger('database')

class Database:
    def __init__(self, settings):
        from supabase import create_client
        self.client = create_client(settings.supabase_url, settings.supabase_key)
        self.agent_version = settings.agent_version
        self.run_id = None
        log.info("Base de Dados: Conectado ao Supabase")

    def _slugify(self, text: str) -> str:
        text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
        text = re.sub(r"[^\w\s-]", "", text).strip().lower()
        return re.sub(r"[\s_]+", "-", text)

    async def ensure_election_exists(self, election_id: str, country_code: str, election_name: str):
        try:
            res = self.client.table('elections').select('id').eq('id', election_id).execute()
            if not res.data:
                flags = {"BR": "🇧🇷", "US": "🇺🇸", "AR": "🇦🇷", "UK": "🇬🇧", "PT": "🇵🇹"}
                record = {
                    'id': election_id,
                    'country_code': country_code.upper(),
                    'election_name': election_name,
                    'status': 'live',
                    'flag': flags.get(country_code.upper(), "🌐"),
                    'active': True,
                    'updated_at': datetime.now(timezone.utc).isoformat()
                }
                self.client.table('elections').insert(record).execute()
            return election_id
        except Exception as e:
            log.error(f"Erro eleição: {e}")
            return election_id

    async def start_run(self, trigger: str = 'manual'):
        record = {'started_at': datetime.now(timezone.utc).isoformat(), 'status': 'running', 'agent_version': self.agent_version, 'trigger': trigger}
        res = self.client.table('collection_runs').insert(record).execute()
        self.run_id = res.data[0]['id']
        return self.run_id

    async def finish_run(self, stats: dict):
        if self.run_id:
            update = {'completed_at': datetime.now(timezone.utc).isoformat(), 'status': 'completed'}
            self.client.table('collection_runs').update(update).eq('id', self.run_id).execute()

    async def upsert_candidate(self, candidate, election_id):
        try:
            full_name = candidate.get('fullName', 'Unknown')
            record = {
                'election_id': election_id,
                'full_legal_name': full_name,
                'display_name': candidate.get('displayName', full_name),
                'updated_at': datetime.now(timezone.utc).isoformat(),
            }
            res = self.client.table('candidates').select('id').eq('election_id', election_id).eq('full_legal_name', full_name).execute()
            if res.data:
                cand_id = res.data[0]['id']
                self.client.table('candidates').update(record).eq('id', cand_id).execute()
                return cand_id
            else:
                res = self.client.table('candidates').insert(record).execute()
                return res.data[0]['id']
        except Exception as e:
            log.error(f"Erro candidato: {e}")
            return None

    async def log_rejection_real(self, candidate_id, text, reason, source_url):
        try:
            record = {'candidate_id': candidate_id, 'rejected_text': text[:1000], 'rejection_reason': reason, 'source_url': source_url}
            self.client.table('extraction_rejections').insert(record).execute()
        except: pass

    async def save_crawled_page(self, page, candidate_id):
        try:
            record = {
                'run_id': self.run_id, 
                'candidate_id': candidate_id, 
                'url': page.get('url', ''), 
                'content_hash': page.get('content_hash', 'hash_ausente_ou_falha'),
                'collected_at': datetime.now(timezone.utc).isoformat()
            }
            res = self.client.table('crawled_pages').insert(record).execute()
            return res.data[0]['id']
        except Exception as e: 
            log.error(f"Erro ao salvar crawled page: {e}")
            return None

    async def save_promise(self, promise):
        try:
            clean_promise = {k: v for k, v in promise.items() if k != 'text_hash'}
            self.client.table('promises').insert(clean_promise).execute()
            return True
        except Exception as e: 
            log.error(f"Erro ao salvar promessa: {e}")
            return False

    async def promise_hash_exists(self, h, cid):
        return False
        
    async def refresh_materialized_view(self, view_name: str):
        try:
            self.client.rpc('refresh_candidate_stats').execute()
        except Exception as e:
            log.error(f"Erro ao atualizar view: {e}")
