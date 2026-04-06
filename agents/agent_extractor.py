"""
World Contrast — Promise Extractor Agent
File: agents/extraction/extractor.py

Sends raw page content to the Claude API and receives
structured political promises in return.

This is the most critical file in the agent system.
The extraction prompt is loaded from:
  agents/extraction/prompts/extraction_prompt.txt

Any change to the prompt requires:
  - Two maintainer approvals via Pull Request
  - Documented rationale in PROMPT_CHANGELOG.md
  - Test run with before/after comparison
"""

import json
import logging
from pathlib import Path
from typing import Optional

import anthropic

log = logging.getLogger('extractor')

# Load the extraction prompt from file
# This keeps the critical prompt version-controlled and auditable
PROMPT_PATH = Path(__file__).parent / 'prompts' / 'extraction_prompt.txt'


class PromiseExtractor:
    """
    Uses Claude API to extract political promises from raw page content.

    Extraction rules (enforced by the prompt):
    - Only forward-looking commitments
    - Verbatim from source — no paraphrasing
    - Reject attacks, opinions, vague statements
    - Classify into one of 9 categories
    - Return confidence score per promise
    - Return JSON only — no prose
    """

    def __init__(self, settings):
        self.settings = settings
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.model = 'claude-sonnet-4-6'  # Best instruction-following, structured output
        self.prompt_template = self._load_prompt()

    def _load_prompt(self) -> str:
        """Load the extraction prompt from the version-controlled file."""
        if not PROMPT_PATH.exists():
            raise FileNotFoundError(
                f"Extraction prompt not found at {PROMPT_PATH}. "
                "This file is required. See agents/extraction/prompts/"
            )
        return PROMPT_PATH.read_text(encoding='utf-8')

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
        Extract promises from raw page content.

        Args:
            content: The raw text content of the page
            candidate_name: Full name of the candidate
            country: Country code (e.g. 'BR')
            source_type: Type of source (e.g. 'official_site', 'instagram')
            source_url: The exact URL visited
            collection_date: ISO date string

        Returns:
            dict with 'promises' list and 'extraction_metadata'
        """
        if not content or len(content.strip()) < 50:
            log.warning(f"Content too short to extract from: {source_url}")
            return self._empty_result("content_too_short")

        # Truncate very long content to avoid token limits
        # Claude Sonnet has 200k context — we use 100k max for content
        max_chars = 300_000  # ~100k tokens
        if len(content) > max_chars:
            log.info(f"Truncating content from {len(content)} to {max_chars} chars")
            content = content[:max_chars]

        # Build the user message from the template
        user_message = self._build_user_message(
            content=content,
            candidate_name=candidate_name,
            country=country,
            source_type=source_type,
            source_url=source_url,
            collection_date=collection_date,
        )

        log.info(f"Calling Claude API for: {candidate_name} / {source_type}")

        try:
            # Use Batch API for async processing (50% cost discount)
            # For real-time/manual runs, use the standard API
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=self._get_system_prompt(),
                messages=[
                    {'role': 'user', 'content': user_message}
                ],
            )

            raw_output = response.content[0].text.strip()

            # Parse the JSON response
            result = self._parse_response(raw_output, source_url)

            log.info(
                f"Extracted {len(result.get('promises', []))} promises, "
                f"rejected {result.get('extraction_metadata', {}).get('total_rejected', 0)}"
            )

            return result

        except anthropic.APIError as e:
            log.error(f"Claude API error for {source_url}: {e}")
            return self._empty_result(f"api_error:{str(e)}")

        except Exception as e:
            log.error(f"Unexpected error extracting from {source_url}: {e}")
            return self._empty_result(f"unexpected_error:{str(e)}")

    def _get_system_prompt(self) -> str:
        """
        Returns the system prompt section of the extraction prompt.
        The prompt file contains both SYSTEM and USER sections.
        """
        content = self.prompt_template
        # Extract just the system prompt section
        if 'SYSTEM PROMPT' in content and 'USER PROMPT TEMPLATE' in content:
            start = content.index('SYSTEM PROMPT') + len('SYSTEM PROMPT')
            end = content.index('USER PROMPT TEMPLATE')
            return content[start:end].strip()
        return content

    def _build_user_message(
        self,
        content: str,
        candidate_name: str,
        country: str,
        source_type: str,
        source_url: str,
        collection_date: str,
    ) -> str:
        """Build the user message by filling in the prompt template."""
        return f"""Extract all political promises from the following official campaign content.

Candidate: {candidate_name}
Country: {country}
Source type: {source_type}
Source URL: {source_url}
Collection date: {collection_date}

---BEGIN CONTENT---
{content}
---END CONTENT---

Return only JSON as specified. Do not include any text outside the JSON object."""

    def _parse_response(self, raw_output: str, source_url: str) -> dict:
        """
        Parse the Claude API JSON response.
        Handles common formatting issues (markdown code blocks, etc.)
        """
        # Strip markdown code blocks if present
        cleaned = raw_output
        if '```json' in cleaned:
            cleaned = cleaned.split('```json')[1].split('```')[0]
        elif '```' in cleaned:
            cleaned = cleaned.split('```')[1].split('```')[0]

        cleaned = cleaned.strip()

        try:
            result = json.loads(cleaned)

            # Validate expected structure
            if 'promises' not in result:
                log.warning(f"Response missing 'promises' key for {source_url}")
                result['promises'] = []

            if 'extraction_metadata' not in result:
                result['extraction_metadata'] = {
                    'total_promises_found': len(result.get('promises', [])),
                    'total_rejected': 0,
                    'rejection_reasons': [],
                }

            return result

        except json.JSONDecodeError as e:
            log.error(f"Failed to parse JSON response for {source_url}: {e}")
            log.debug(f"Raw output was: {raw_output[:500]}")
            return self._empty_result(f"json_parse_error:{str(e)}")

    def _empty_result(self, reason: str) -> dict:
        """Return an empty result with metadata explaining why."""
        return {
            'promises': [],
            'extraction_metadata': {
                'total_promises_found': 0,
                'total_rejected': 0,
                'rejection_reasons': [reason],
            }
        }

    def get_prompt_hash(self) -> str:
        """
        Returns the SHA-256 hash of the extraction prompt.
        Used for audit trail — every extracted promise records
        which version of the prompt was used.
        """
        import hashlib
        return hashlib.sha256(self.prompt_template.encode()).hexdigest()
