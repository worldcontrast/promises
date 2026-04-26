"""
World Contrast — Database v3.0 (Global Automation)
File: config/database.py

Persistence layer via Supabase.
Now with automatic Jurisdiction (Election) creation and smart candidate handling.
Compatible with TEXT-based election IDs.
"""

import logging
import re
import unicodedata
from datetime import datetime, timezone

log = logging.getLogger('database')

class Database:
    def __init__(self, settings):
        try:
            from supabase import create_client
        except ImportError:
            raise ImportError("Instale a biblioteca: pip install supabase>=2.5.0")

        self.client = create_client(settings.supabase_url, settings.supabase_key)
        self.agent_version = settings.agent_version
        self.run_id = None
        log.info("Base de Dados: Ligado ao Supabase")

    # ── JURISDICTION AUTOMATION ───────────────────────────────

    def _slugify(self, text: str) -> str:
        """Converte 'US Presidential 2024' -> 'us-presidential-2024'"""
        text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
        text = re.sub(r"[^\w\s-]", "", text).strip().lower()
        return re.sub(r"[\s_]+", "-", text)

    async def ensure_election_exists(self, country_code: str, election_name: str):
        """
        Verifica se a jurisdição existe. Se não existir, cria-a 
        automaticamente com bandeira e status 'live'.
        """
        election_id = self._slugify(f"{country_code}-{election_name}")
        
        try:
            res = self.client.table('elections').select('id').eq('id', election_id).execute()
            
            if not res.data:
                log.info(f"✨ Nova Jurisdição detetada: {election_id}. A criar registo automático...")
                
                # Mapeamento automático de bandeiras para os países mais comuns
                flags = {
                    "BR": "🇧🇷", "US": "🇺🇸", "AR": "🇦🇷", "UK": "🇬🇧", 
                    "FR": "🇫🇷", "PT": "🇵🇹", "ES": "🇪🇸", "DE": "🇩🇪"
                }
                flag = flags.get(country_code.upper(), "🌐")

                record = {
                    'id':            election_id,
                    'country_code':  country_code.upper(),
                    'election_name': election_name,
                    'status':        'live',
                    'flag':          flag,
                    'active':        True,
                    'updated_at':    datetime.now(timezone.utc).isoformat()
                }
                self.client.table('elections').insert(record).execute()
                log.info(f"✓ Jurisdição {election_id} criada com sucesso.")
            
            return election_id
        except Exception as e:
            log.error(f"Erro ao garantir existência da eleição {election_id}: {e}")
            return election_id

    # ── COLLECTION RUNS ───────────────────────────────────────

    async def start_run(self, trigger: str = 'manual') -> str:
        record = {
            'started_at':     datetime.now(timezone.utc).isoformat(),
            'status':         'running',
            'agent_version':  self.agent_version,
            'trigger':        trigger,
        }
        result = self.client.table('collection_runs').insert(record).execute()
        self.run_id = result.data[0]['id']
        log.info(f"Execução iniciada: {self.run_id}")
        return self.run_id

    async def finish_run(self, stats: dict) -> None:
        if not self.run_id: return
        update = {
            'completed_at':   datetime.now(timezone.utc).isoformat(),
            'status':         'completed' if not stats.get('errors') else 'failed',
            'promises_extracted': stats.get('promises_extracted', 0),
        }
        self.client.table('collection_runs').update(update).eq('id', self.run_id).execute()

    # ── CANDIDATES ────────────────────────────────────────────

    async def upsert_candidate(self, candidate: dict, election_id: str) -> str | None:
        """
        Grava ou atualiza um candidato. 
        Usa Nome + Eleição como chave para evitar duplicados sem depender do número da urna.
        """
        try:
            full_name = candidate.get('fullName') or candidate.get('name', 'Unknown')
            sources = candidate.get('sources', {})
            
            record = {
                'election_id':      election_id,
                'full_legal_name':  full_name,
                'display_name':     candidate.get('displayName') or full_name,
                'party_name':       candidate.get('party', ''),
                'electoral_number': str(candidate.get('electoralNumber') or ''),
                'official_site_url': sources.get('official_site') or sources.get('officialSite', ''),
                'twitter_url':      sources.get('twitter', ''),
                'updated_at':       datetime.now(timezone.utc).isoformat(),
            }

            # Procura se o candidato já existe nesta eleição específica
            res = self.client.table('candidates').select('id').eq('election_id', election_id).eq('full_legal_name', full_name).execute()

            if res.data:
                cand_id = res.data[0]['id']
                self.client.table('candidates').update(record).eq('id', cand_id).execute()
                log.debug(f"Candidato atualizado: {full_name}")
                return cand_id
            else:
                ins_res = self.client.table('candidates').insert(record).execute()
                cand_id = ins_res.data[0]['id']
                log.debug(f"Candidato criado: {full_name}")
                return cand_id

        except Exception as e:
            log.error(f"Erro ao processar candidato {candidate.get('fullName')}: {e}")
            return None

    # ── DATA PERSISTENCE ──────────────────────────────────────

    async def save_crawled_page(self, page: dict, candidate_id: str) -> str | None:
        try:
            record = {
                'run_id':       self.run_id,
                'candidate_id': candidate_id,
                'url':          page.get('url', ''),
                'archive_url':  page.get('archive_url', ''),
                'collected_at': datetime.now(timezone.utc).isoformat(),
                'http_status':  page.get('http_status', 200)
            }
            res = self.client.table('crawled_pages').insert(record).execute()
            return res.data[0]['id']
        except Exception: return None

    async def save_promise(self, promise: dict) -> dict | None:
        try:
            res = self.client.table('promises').insert(promise).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            log.error(f"Erro ao salvar promessa no Supabase: {e}")
            return None

    async def promise_hash_exists(self, text_hash: str, candidate_id: str) -> bool:
        res = self.client.table('promises').select('id').eq('candidate_id', candidate_id).eq('text_hash', text_hash).execute()
        return len(res.data) > 0

    # FIX 4a: Método que faltava — pipeline_runner chama isto para cada rejeição.
    # Sem ele, qualquer run com rejeições crashava silenciosamente.
    async def log_rejection_real(
        self,
        candidate_id: str | None,
        text: str,
        reason: str,
        source_url: str,
    ) -> None:
        """
        Grava rejeições POCVA-01 na tabela pública extraction_rejections.
        Transparência total — nada é descartado silenciosamente.
        """
        try:
            record = {
                'candidate_id':     candidate_id,
                'rejected_text':    text[:300],   # schema: max 300 chars
                'rejection_reason': reason,
                'source_url':       source_url,
                'collected_at':     datetime.now(timezone.utc).isoformat(),
            }
            self.client.table('extraction_rejections').insert(record).execute()
        except Exception as e:
            # Nunca deixar a falha de log bloquear o pipeline principal
            log.warning(f"Não foi possível gravar rejeição: {e}")

    # FIX 3: Método para refrescar a Materialized View após cada run.
    # O Supabase não tem cron automático para isto — tem de ser chamado explicitamente.
    async def refresh_materialized_view(self, view_name: str) -> None:
        """
        Executa REFRESH MATERIALIZED VIEW via RPC do Supabase.
        Requer que exista uma função SQL: refresh_<view_name>() com SECURITY DEFINER.
        Ver: supabase/functions/refresh_candidate_stats.sql
        """
        try:
            # Método preferido: chamar função RPC dedicada (mais seguro que SQL raw)
            self.client.rpc(f'refresh_{view_name}').execute()
            log.info(f"✓ Materialized View '{view_name}' refrescada.")
        except Exception as e:
            log.warning(
                f"Não foi possível refrescar '{view_name}': {e}. "
                f"Execute manualmente: REFRESH MATERIALIZED VIEW {view_name};"
            )
