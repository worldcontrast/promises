"""
World Contrast — Promise Extractor Agent
File: agents/extraction/extractor.py
"""

import json
import logging
import asyncio
import anthropic
import re
from pathlib import Path

log = logging.getLogger('extractor')
PROMPT_PATH = Path(__file__).parent / 'prompts' / 'extraction_prompt.txt'

class PromiseExtractor:
    def __init__(self, settings):
        # A BLINDAGEM DA CHAVE (Funciona a 100%)
        raw_key = str(settings.anthropic_api_key)
        clean_key = re.sub(r"[\s\r\n]+", "", raw_key).replace("\\n", "").replace("\\r", "").strip("'\"")
        
        self.client = anthropic.AsyncAnthropic(
            api_key=clean_key,
            max_retries=3,
            timeout=80.0
        )
        
        # O SEMÁFORO: Processa 2 de cada vez
        self.semaphore = asyncio.Semaphore(2)

        self._prompt_raw = self._load_prompt_file()
        self._system_prompt = self._parse_system_prompt()
        log.info(f"Extractor ready — prompt hash: {self.get_prompt_hash()[:12]}...")

    def _load_prompt_file(self) -> str:
        if not PROMPT_PATH.exists(): return ""
        return PROMPT_PATH.read_text(encoding='utf-8')

    def _parse_system_prompt(self) -> str:
        content = self._prompt_raw
        if 'SYSTEM PROMPT' in content and 'USER PROMPT TEMPLATE' in content:
            start = content.index('SYSTEM PROMPT') + len('SYSTEM PROMPT')
            end = content.index('USER PROMPT TEMPLATE')
            return content[start:end].strip()
        return content

    async def extract(self, content: str, candidate_name: str, country: str, source_type: str, source_url: str, collection_date: str) -> dict:
        if not content or len(content.strip()) < 50:
            return self._empty_result("content_too_short")

        user_message = (
            f"Extract political promises for {candidate_name} in {country} from {source_url}.\n\n"
            f"---CONTENT---\n{content[:150000]}\n---END---"
        )

        # A MÁGICA: Lista de todos os modelos atuais. Se um der erro 404, salta para o próximo!
        models_to_try = [
            'claude-3-5-sonnet-20241022',
            'claude-3-5-haiku-20241022',
            'claude-3-5-sonnet-20240620',
            'claude-3-haiku-20240307'
        ]

        async with self.semaphore:
            for model_name in models_to_try:
                log.info(f"Calling Claude [{model_name}] — {candidate_name}")
                try:
                    response = await self.client.messages.create(
                        model=model_name,
                        max_tokens=4096,
                        system=self._system_prompt,
                        messages=[{'role': 'user', 'content': user_message}],
                    )
                    return self._parse_response(response.content[0].text, source_url)
                
                except Exception as e:
                    error_msg = str(e).lower()
                    # Se for erro 404 de modelo não encontrado, ignoramos e tentamos o seguinte
                    if "404" in error_msg or "not_found" in error_msg:
                        log.warning(f"⚠️ Model {model_name} bloqueado na sua conta (404). A tentar o próximo...")
                        continue
                    
                    # Se for outro erro (ex: rede), regista e avança
                    log.error(f"Claude API error: {e}")
                    return self._empty_result(str(e))
            
            # Se todos os modelos derem erro 404
            log.error("❌ CRÍTICO: Todos os modelos deram erro 404. Precisa ativar os modelos no site da Anthropic: Settings -> Workspaces -> Models")
            return self._empty_result("all_models_404")

    def _parse_response(self, raw: str, url: str) -> dict:
        try:
            clean = raw.strip()
            # TRUQUE: Evitar escrever três crases juntas para a interface não quebrar o ficheiro
            f_json = "`" * 3 + "json"
            f_code = "`" * 3
            
            if f_json in clean: 
                clean = clean.split(f_json)[1].split(f_code)[0]
            elif f_code in clean: 
                clean = clean.split(f_code)[1].split(f_code)[0]
            
            result = json.loads(clean.strip())
            if 'promises' not in result: 
                result['promises'] = []
            return result
        except Exception as e:
            log.error(f"JSON Parse Error: {e}")
            return self._empty_result(f"json_error: {e}")

    def _empty_result(self, reason: str) -> dict:
        return {
            'promises': [],
            'extraction_rejections': [{'reason': reason}],
            'extraction_metadata': {
                'total_considered': 0,
                'total_accepted': 0,
                'total_rejected': 1,
                'language_detected': 'unknown'
            }
        }

    def get_prompt_hash(self) -> str:
        import hashlib
        return hashlib.sha256(self._prompt_raw.encode('utf-8')).hexdigest()
