"""
World Contrast — Content Hasher
File: agents/crawler/hasher.py

Generates SHA-256 fingerprints of crawled content.
This hash is the "seal of authenticity" — it proves that the text
stored in the database is identical to what was on the candidate's
official page at the moment of collection.

Usage (inside WebCrawler.fetch):
    from agents.crawler.hasher import hash_content, hash_page
    page['content_hash'] = hash_content(raw_html)
"""

import hashlib
import json
from datetime import datetime, timezone


def hash_content(raw: str | bytes) -> str:
    """
    Returns the SHA-256 hex digest of raw page content.
    Always operates on UTF-8 bytes for consistency across platforms.

    Args:
        raw: raw HTML string or bytes from the HTTP response

    Returns:
        64-character lowercase hex string (SHA-256)
    """
    if isinstance(raw, str):
        raw = raw.encode('utf-8')
    return hashlib.sha256(raw).hexdigest()


def hash_page(page: dict) -> str:
    """
    Returns a deterministic SHA-256 of the page's meaningful fields.
    Use this when you want the hash to cover structured data
    (url + text + collected_at) rather than raw HTML.

    This is the hash stored in the `promises` table —
    it allows anyone to reconstruct and verify the exact data
    that was extracted on a specific date.

    Args:
        page: dict with keys: url, text, collected_at

    Returns:
        64-character lowercase hex string (SHA-256)
    """
    canonical = json.dumps({
        'url':          page.get('url', ''),
        'text':         page.get('text', ''),
        'collected_at': page.get('collected_at',
                            datetime.now(timezone.utc).isoformat()),
    }, ensure_ascii=False, sort_keys=True)

    return hashlib.sha256(canonical.encode('utf-8')).hexdigest()


def verify(original_raw: str | bytes, stored_hash: str) -> bool:
    """
    Verifies that a piece of content matches a stored hash.
    Use this for auditing: re-fetch a page and confirm it hasn't changed.

    Args:
        original_raw: current content of the page
        stored_hash:  the hash stored in the database at collection time

    Returns:
        True if content is identical to what was collected, False if tampered
    """
    return hash_content(original_raw) == stored_hash
