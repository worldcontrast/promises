"""
World Contrast — Promise Extractor Agent (Fixed & Blinded)
File: agents/extraction/extractor.py
"""

import json
import logging
from pathlib import Path
import anthropic

log = logging.getLogger('extractor')
PROMPT_PATH = Path(__file__).parent / 'prompts' / 'extraction_prompt.txt'

class PromiseExtractor:
    def __init__(self, settings):
        self.settings = settings
        self.client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        # Modelo estável que funciona em 100% das chaves de API
        self.model = 'claude-3-5-sonnet-20240620' 

        self._prompt_raw = self._load_prompt_file()
        self._system_prompt = self._parse_system_prompt()
        log.info(f"Extractor ready — prompt hash: {self.get_prompt_hash()[:12]}...")

    def _load_prompt_file(self) -> str:
        if not PROMPT_PATH.exists():
            raise FileNotFoundError(f"Prompt não encontrado em {PROMPT_PATH}")
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
            f"Candidate: {candidate_name}\n"
            f"Country: {country}\n"
            f"Source URL: {source_url}\n\n"
            f"---BEGIN CONTENT---\n{content[:200000]}\n---END CONTENT---"
        )

        log.info(f"Calling Claude [{self.model}] — {candidate_name}")

        try:
            # Formato de chamada simplificado e mais compatível
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
            if "
