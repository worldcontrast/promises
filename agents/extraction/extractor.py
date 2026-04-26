"""
World Contrast — Promise Extractor Agent
File: agents/extraction/extractor.py
"""

import json
import logging
import asyncio
import anthropic
from pathlib import Path

log = logging.getLogger('extractor')
PROMPT_PATH = Path(__file__).parent / 'prompts' / 'extraction_prompt.txt'

class PromiseExtractor:
    def __init__(self, settings):
        self.settings = settings
        
        # BLINDAGEM DE REDE: Mais tentativas e timeout alargado (120s)
        self.client = anthropic.AsyncAnthropic(
            api_key=settings.anthropic_api_key,
            max_retries=5,
            timeout=120.0
        )
        
        # O modelo mais rápido para evitar timeouts
        self.model = 'claude-3-haiku-20240307' 
        
        # O SEMÁFORO: Apenas 2 candidatos processados ao mesmo tempo
        # Isto evita que a Anthropic bloqueie a sua conta Tier 1
        self.semaphore = asyncio.Semaphore(2)

        self._prompt_raw = self._load_prompt_file()
        self._system_prompt = self._parse_system_prompt()
        log.info(f"Extractor ready — prompt hash: {self.get_prompt_hash()[:12]}...")

    def _load_prompt_file(self) -> str:
        if not PROMPT_PATH.exists():
            return ""
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

        # O robô entra na fila. Se já houver 2 a processar, ele espera educadamente.
        async with self.semaphore:
            log.info(f"Calling Claude [{self.model}] — {candidate_name}")

            try:
                response = await self.client.messages.create(
                    model=self.model,
                    max_tokens=4096,
                    system=self._system_prompt,
                    messages=[{'role': 'user', 'content': user_message}],
                )
                return self._parse_response(response.content[0].text, source_url)
            except Exception as e:
                log.error(f"Claude API error: {e}")
                return self._empty_result(str(e))

    def _parse_response(self, raw: str, url: str) -> dict:
        try:
            clean = raw.strip()
            if "```json" in clean: 
                clean = clean.split("```json")[1].split("```")[0]
            elif "```" in clean: 
                clean = clean.split("```")[1].split("```")[0]
            
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
