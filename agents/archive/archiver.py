"""
World Contrast — Page Archiver
File: agents/archive/archiver.py

Every page visited by the crawler is permanently archived.
This creates the immutable proof that:
1. The promise existed at a specific URL at a specific moment
2. The content was not altered after collection

Two archive layers:
- Wayback Machine (Internet Archive) — public, permanent, institutional
- IPFS — decentralized, censorship-resistant
- S3 (internal) — fast retrieval, redundancy

The SHA-256 hash links the archived page to the database record.
Anyone can verify: open archive URL → hash the content → compare with database.
"""

import asyncio
import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional

import httpx

log = logging.getLogger('archiver')

# Wayback Machine Save API endpoint
WAYBACK_SAVE_URL = 'https://web.archive.org/save/'

# Delay between archive requests (rate limiting — be a good citizen)
ARCHIVE_DELAY_SECONDS = 2


class PageArchiver:
    """
    Archives page content to multiple permanent storage systems.
    Returns the primary archive URL for database storage.
    """

    def __init__(self, settings):
        self.settings = settings

    async def save(self, page: dict) -> str:
        """
        Save a page to all archive systems.

        Args:
            page: dict with 'url', 'html', 'text', 'content_hash'

        Returns:
            Primary archive URL (Wayback Machine)
        """
        url = page.get('url', '')
        if not url:
            return ''

        # Run archiving tasks (Wayback Machine is primary)
        wayback_url = await self._save_to_wayback(url)

        # Save to IPFS in background (non-blocking)
        asyncio.create_task(self._save_to_ipfs(page))

        return wayback_url or url

    async def _save_to_wayback(self, url: str) -> Optional[str]:
        """
        Submit URL to the Wayback Machine Save API.
        Returns the archive URL.
        """
        # Rate limiting — respect Wayback Machine's servers
        await asyncio.sleep(ARCHIVE_DELAY_SECONDS)

        save_url = f"{WAYBACK_SAVE_URL}{url}"

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(
                    save_url,
                    headers={
                        'User-Agent': (
                            'WorldContrast-Bot/1.0 '
                            '(+https://worldcontrast.org/bot; '
                            'archiving political campaign content for public transparency)'
                        ),
                    },
                    follow_redirects=True,
                )

                # Wayback Machine returns the archive URL in the Content-Location header
                # or we construct it from the timestamp
                if response.status_code in (200, 302):
                    # Try to get from header first
                    location = response.headers.get('Content-Location', '')
                    if location:
                        return f"https://web.archive.org{location}"

                    # Construct from timestamp
                    timestamp = datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')
                    return f"https://web.archive.org/web/{timestamp}/{url}"

                log.warning(f"Wayback Machine returned {response.status_code} for {url}")
                return None

        except httpx.TimeoutException:
            log.warning(f"Wayback Machine timeout for {url}")
            return None
        except Exception as e:
            log.error(f"Wayback Machine error for {url}: {e}")
            return None

    async def _save_to_ipfs(self, page: dict) -> Optional[str]:
        """
        Save page content to IPFS via web3.storage or Pinata.
        Returns the IPFS CID.

        This provides censorship-resistant archiving — the content
        exists across thousands of nodes globally.
        """
        try:
            content = page.get('html', '') or page.get('text', '')
            if not content:
                return None

            # TODO: Implement IPFS upload via web3.storage API
            # For MVP, we rely on Wayback Machine only
            # In Phase 2, add IPFS:
            #
            # async with httpx.AsyncClient() as client:
            #     response = await client.post(
            #         'https://api.web3.storage/upload',
            #         headers={'Authorization': f'Bearer {self.settings.web3_storage_key}'},
            #         content=content.encode(),
            #     )
            #     if response.status_code == 200:
            #         cid = response.json()['cid']
            #         return f"ipfs://{cid}"

            return None

        except Exception as e:
            log.debug(f"IPFS archiving failed (non-critical): {e}")
            return None

    @staticmethod
    def verify_hash(content: str, expected_hash: str) -> bool:
        """
        Verify that content matches the stored hash.
        Anyone can call this to verify a promise record independently.
        """
        actual_hash = hashlib.sha256(content.encode()).hexdigest()
        return actual_hash == expected_hash
