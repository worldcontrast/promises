"""
World Contrast — Promise Extractor Agent
File: agents/extraction/extractor.py

Sends raw page content to the Claude API and receives
structured political promises under the POCVA-01 Protocol.

This is the most critical file in the agent system.
The extraction prompt is loaded from:
  agents/extraction/prompts/extraction_prompt.txt

Any change to the prompt requires:
  - Two maintainer approvals via Pull Request
  - Documented rationale in PROMPT_CHANGELOG.md
  - Test run with before/after comparison on real data
"""

import json
import logging
from pathlib import Path

import anthropic

log = logging.getLogger('extractor')

PROMPT_PATH = Path(__file__).parent / 'prompts' / 'extraction_prompt.txt'


class PromiseExtractor:
    """
    Uses Claude API to extract political promises from raw page content
    under the POCVA-01 Protocol.

    Extraction rules (enforced by the prompt):
    - Promise Equation: [Actor] + [Future Action Verb] + [Measurable Target]
    - Verbatim from source — no paraphrasing
    - Reject attacks, opinions, vague statements
    - Log every rejection with reason (public audit trail)
    - Classify into one of 9 categories
    - Translate into 5 languages
    - Return confidence score per promise (min 0.75)
    - Return JSON only — no prose
    """

    def __init__(self, settings):
        self.settings = settings
        self.client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        self.model = 'claude-3-7-sonnet-20250219' # Updated to latest model

        self._prompt_raw = self._load_prompt_file()
        self._system_prompt = self._parse_system_prompt()
        log.info(f"Extractor ready — prompt hash: {self.get_prompt_hash()[:12]}...")

    # ── PROMPT LOADING ────────────────────────────────────────

    def _load_prompt_file(self) -> str:
        """Load the full prompt file. Raises clearly if missing."""
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
        """
        Extract the SYSTEM PROMPT section from the prompt file.
        The file uses section markers:
          ================
          SYSTEM PROMPT
          ================
          ... system content ...
          ================
          USER PROMPT TEMPLATE
          ================
        """
        content = self._prompt_raw

        if 'SYSTEM PROMPT' in content and 'USER PROMPT TEMPLATE' in content:
            start = content.index('SYSTEM PROMPT') + len('SYSTEM PROMPT')
            end = content.index('USER PROMPT TEMPLATE')
            system = content[start:end].strip()
            log.debug(f"System prompt parsed: {len(system)} chars")
            return system

        # Fallback: use the entire file as system prompt
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
        """
        Extract promises from raw page content under POCVA-01.

        Args:
            content:        Raw text content of the crawled page
            candidate_name: Full name of the candidate
            country:        ISO country code (e.g. 'BR')
            source_type:    Type of source (e.g. 'official_site', 'instagram')
            source_url:     Exact URL visited
            collection_date: ISO date string (YYYY-MM-DD)

        Returns:
            dict with:
              promises[]             — accepted promises (validated by Promise Equation)
              extraction_rejections[]— every rejected statement with reason
              extraction_metadata{}  — counters and language detected
        """
        if not content or len(content.strip()) < 50:
            log.warning(f"Content too short to extract from: {source_url}")
            return self._empty_result("content_too_short")

        # Truncate to ~100k tokens max (300k chars) to stay within context window
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
        """
        Build the user turn message.
        Injects candidate metadata into the content block.
        """
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
        """
        Parse and validate the Claude API JSON response.
        Handles markdown code block wrapping gracefully.
        """
        cleaned = raw_output

        # Strip markdown code blocks if Claude wrapped the JSON
        if '```json' in cleaned:
            cleaned = cleaned.split('```json')[1].split('```')[0]
        elif '```' in cleaned:
            cleaned = cleaned.split('```')[1].split('```')[0]

        cleaned = cleaned.strip()

        try:
            result = json.loads(cleaned)

            # Ensure required keys exist
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

            # Filter out promises below confidence threshold (< 0.75)
            # These should have been excluded by the prompt, but we enforce it here
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

    # ── HELPERS ───────────────────────────────────────────────

    def _empty_result(self, reason: str) -> dict:
        """Return a safe empty result with the failure reason logged."""
        return {
            'promises': [],
            'extraction_rejections': [],
            'extraction_metadata': {
                'total_considered': 0,
                'total_accepted':   0,
                'total_rejected':   0,
                'rejection_reasons': [reason],
                'language_detected': 'unknown',
            }
        }

    def get_prompt_hash(self) -> str:
        """
        Returns SHA-256 hash of the extraction prompt file.

        This hash is recorded in the audit trail alongside every
        extracted promise — proving which version of the protocol
        was active at the time of extraction.
        """
        import hashlib
        return hashlib.sha256(self._prompt_raw.encode('utf-8')).hexdigest()
