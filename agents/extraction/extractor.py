"""
World Contrast — Promise Extractor Agent
File: agents/extraction/extractor.py

Sends raw page content to the Claude API and receives
structured political promises under the POCVA-01 Protocol.

This is the most critical file in the agent system.
The extraction prompt is loaded from:
  agents/extraction/prompts/extraction_prompt.txt
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
        # Downgrade de segurança para o modelo mais fiável e testado
        self.model = 'claude-3-5-sonnet-20241022' 

        self._prompt_raw = self._load_prompt_file()
        self._system_prompt = self._parse_system_prompt()
        log.info(f"Extractor ready — prompt hash: {self.get_prompt_hash()[:12]}...")

    # ── PROMPT LOADING ────────────────────────────────────────

    def _load_prompt_file(self) -> str:
        if not PROMPT_PATH.exists():
            raise FileNotFoundError(
                f"POCVA-01 extraction prompt not found at {PROMPT_PATH}.\n"
                "This file is required for the agent to operate.\n"
                "See: agents/extraction/prompts/extraction_prompt.txt"
            )
        content = PROMPT_PATH.read_text(encoding='utf-8')
        log.info(f"Loaded extraction prompt: {len(content)} chars from {PROMPT_PATH}")
        return content

    def _parse_system_prompt(self) -> str:
        content = self._prompt_raw

        if 'SYSTEM PROMPT' in content and 'USER PROMPT TEMPLATE' in content:
            start = content.index('SYSTEM PROMPT') + len('SYSTEM PROMPT')
            end = content.index('USER PROMPT TEMPLATE')
            system = content[start:end].strip()
            log.debug(f"System prompt parsed: {len(system)} chars")
            return system

        log.warning("Could not find section markers in prompt file — using full file as system prompt")
        return content

    # ── MAIN EXTRACTION ───────────────────────────────────────

    async def extract(
        self,
        content: str,
        candidate_name: str,
        country: str,
        source_type: str,
        source_url: str,
        collection_date: str,
    ) -> dict:
        if not content or len(content.strip()) < 50:
            log.warning(f"Content too short to extract from: {source_url}")
            return self._empty_result("content_too_short")

        max_chars = 300_000
        if len(content) > max_chars:
            log.info(f"Truncating content: {len(content)} → {max_chars} chars")
            content = content[:max_chars]

        user_message = self._build_user_message(
            content=content,
            candidate_name=candidate_name,
            country=country,
            source_type=source_type,
            source_url=source_url,
            collection_date=collection_date,
        )

        log.info(f"Calling Claude API [{self.model}] — {candidate_name} / {source_type}")

        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=[
                    {
                        "type": "text",
                        "text": self._system_prompt,
                        "cache_control": {"type": "ephemeral"}
                    }
                ],
                messages=[
                    {'role': 'user', 'content': user_message}
                ],
            )

            raw_output = response.content[0].text.strip()
            result = self._parse_response(raw_output, source_url)

            accepted = len(result.get('promises', []))
            rejected = result.get('extraction_metadata', {}).get('total_rejected', 0)
            log.info(f"Extraction complete — accepted: {accepted}, rejected: {rejected}")

            return result

        except anthropic.APIError as e:
            log.error(f"Claude API error for {source_url}: {e}")
            return self._empty_result(f"api_error:{str(e)}")
        except Exception as e:
            log.error(f"Unexpected extraction error for {source_url}: {e}")
            return self._empty_result(f"unexpected_error:{str(e)}")

    # ── USER MESSAGE ──────────────────────────────────────────

    def _build_user_message(
        self,
        content: str,
        candidate_name: str,
        country: str,
        source_type: str,
        source_url: str,
        collection_date: str,
    ) -> str:
        return (
            f"Extract all political promises from the following official campaign content.\n\n"
            f"Candidate: {candidate_name}\n"
            f"Country: {country}\n"
            f"Source type: {source_type}\n"
            f"Source URL: {source_url}\n"
            f"Collection date: {collection_date}\n\n"
            f"---BEGIN CONTENT---\n"
            f"{content}\n"
            f"---END CONTENT---\n\n"
            f"Return ONLY a JSON object as specified. "
            f"Do not include any text, explanation, or markdown outside the JSON."
        )

    # ── RESPONSE PARSING ──────────────────────────────────────

    def _parse_response(self, raw_output: str, source_url: str) -> dict:
        cleaned = raw_output

        if '```json' in cleaned:
            cleaned = cleaned.split('```json')[1].split('```')[0]
        elif '```' in cleaned:
            cleaned = cleaned.split('```')[1].split('```')[0]

        cleaned = cleaned.strip()

        try:
            result = json.loads(cleaned)

            if 'promises' not in result:
                log.warning(f"Response missing 'promises' key for {source_url}")
                result['promises'] = []

            if 'extraction_rejections' not in result:
                result['extraction_rejections'] = []

            if 'extraction_metadata' not in result:
                result['extraction_metadata'] = {
                    'total_considered': len(result.get('promises', [])),
                    'total_accepted':   len(result.get('promises', [])),
                    'total_rejected':   0,
                    'language_detected': 'unknown',
                }

            before = len(result['promises'])
            result['promises'] = [
                p for p in result['promises']
                if p.get('confidence', 0) >= 0.75
            ]
            filtered = before - len(result['promises'])
            if filtered > 0:
                log.info(f"Filtered {filtered} promises below confidence threshold (< 0.75)")
                result['extraction_metadata']['total_rejected'] = (
                    result['extraction_metadata'].get('total_rejected', 0) + filtered
                )

            return result

        except json.JSONDecodeError as e:
            log.error(f"Failed to parse JSON response for {source_url}: {e}")
            log.debug(f"Raw output (first 500 chars): {raw_output[:500]}")
            return self._empty_result(f"json_parse_error:{str(e)}")

    def get_prompt_hash(self) -> str:
        import hashlib
        return hashlib.sha256(self._prompt_raw.encode('utf-8')).hexdigest()
