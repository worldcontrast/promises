"""
World Contrast — Web Crawler Agent
File: agents/crawler/crawler.py

Visits official source URLs using Playwright (headless browser).

STRICT RULES (hardcoded, non-configurable):
- Never submits any form
- Never clicks any interactive element
- Never logs in to any service
- Never uses cookies from previous sessions
- Never accepts API keys from candidates
- Reads only publicly visible content
- Identical treatment for all candidates
"""

import asyncio
import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional

from playwright.async_api import async_playwright, Page, Browser

log = logging.getLogger('crawler')

# Source types that require browser rendering (JavaScript-heavy)
BROWSER_REQUIRED = {'instagram', 'facebook', 'tiktok', 'twitter'}

# Source types that can be fetched with simple HTTP
HTTP_ONLY = {'electoral_filing', 'official_site', 'press_release'}

# Maximum content size (5MB) — prevents memory issues
MAX_CONTENT_BYTES = 5 * 1024 * 1024

# Request timeout (30 seconds)
TIMEOUT_MS = 30_000


class WebCrawler:
    """
    Passive web crawler that reads only public content.
    Uses Playwright for JavaScript-rendered pages.
    Uses httpx for simple HTTP pages (faster, lighter).
    """

    def __init__(self, settings):
        self.settings = settings
        self._browser: Optional[Browser] = None

    async def fetch(self, url: str, source_type: str) -> Optional[dict]:
        """
        Fetch a URL and return its content with metadata.

        Returns:
            dict with keys: url, text, html, content_hash,
                           collected_at, http_status, source_type
            None if fetch failed
        """
        log.info(f"Fetching [{source_type}]: {url}")

        try:
            if source_type in BROWSER_REQUIRED:
                return await self._fetch_with_browser(url, source_type)
            else:
                return await self._fetch_with_http(url, source_type)

        except Exception as e:
            log.error(f"Fetch failed for {url}: {e}")
            return None

    async def _fetch_with_http(self, url: str, source_type: str) -> Optional[dict]:
        """
        Simple HTTP fetch for static pages.
        Used for: electoral filings, official sites, press releases.
        """
        import httpx

        headers = {
            'User-Agent': (
                'WorldContrast-Bot/1.0 '
                '(+https://worldcontrast.org/bot; '
                'neutral-transparency-platform; '
                'contact: bot@worldcontrast.org)'
            ),
            'Accept': 'text/html,application/pdf,*/*',
            'Accept-Language': 'en,*',
        }

        async with httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers=headers,
        ) as client:
            response = await client.get(url)

            if response.status_code != 200:
                log.warning(f"HTTP {response.status_code} for {url}")
                return None

            content = response.content
            if len(content) > MAX_CONTENT_BYTES:
                log.warning(f"Content too large ({len(content)} bytes), truncating")
                content = content[:MAX_CONTENT_BYTES]

            content_type = response.headers.get('content-type', '')

            # Handle PDFs (electoral filings are often PDFs)
            if 'pdf' in content_type or url.lower().endswith('.pdf'):
                text = await self._extract_pdf_text(content)
            else:
                text = self._extract_text_from_html(response.text)

            content_hash = hashlib.sha256(content).hexdigest()

            return {
                'url': str(response.url),
                'html': response.text if 'html' in content_type else '',
                'text': text,
                'content_hash': content_hash,
                'collected_at': datetime.now(timezone.utc).isoformat(),
                'http_status': response.status_code,
                'content_type': content_type,
                'content_length': len(content),
                'source_type': source_type,
            }

    async def _fetch_with_browser(self, url: str, source_type: str) -> Optional[dict]:
        """
        Browser-based fetch for JavaScript-heavy pages.
        Used for: Instagram, Facebook, TikTok, Twitter.

        STRICT: No login, no cookies, no interaction beyond page load.
        """
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-extensions',
                    '--disable-plugins',
                    # Block all storage to ensure no persistent state
                    '--disable-web-storage',
                ],
            )

            context = await browser.new_context(
                # Identify as our bot — transparent, not deceptive
                user_agent=(
                    'WorldContrast-Bot/1.0 '
                    '(+https://worldcontrast.org/bot; '
                    'neutral-transparency-platform)'
                ),
                # No cookies — we are not logged in
                storage_state=None,
                # Standard viewport
                viewport={'width': 1280, 'height': 900},
                # Disable JavaScript for pages that don't need it
                # (only enable where required for rendering)
                java_script_enabled=True,
            )

            # Block unnecessary resources (images, fonts, media)
            # We only need text content
            await context.route(
                '**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,mp4,mp3}',
                lambda route: route.abort()
            )

            page = await context.new_page()

            try:
                response = await page.goto(
                    url,
                    wait_until='domcontentloaded',
                    timeout=TIMEOUT_MS,
                )

                if not response:
                    return None

                # Wait for content to render
                await asyncio.sleep(2)

                # Extract visible text only
                text = await page.evaluate('''() => {
                    // Remove script, style, nav, footer elements
                    const remove = document.querySelectorAll(
                        "script, style, nav, footer, header, iframe, noscript"
                    );
                    remove.forEach(el => el.remove());

                    // Get visible text
                    return document.body?.innerText || document.body?.textContent || "";
                }''')

                html = await page.content()
                content_hash = hashlib.sha256(text.encode()).hexdigest()

                return {
                    'url': page.url,
                    'html': html,
                    'text': text,
                    'content_hash': content_hash,
                    'collected_at': datetime.now(timezone.utc).isoformat(),
                    'http_status': response.status,
                    'content_type': response.headers.get('content-type', ''),
                    'content_length': len(text),
                    'source_type': source_type,
                }

            finally:
                await page.close()
                await context.close()
                await browser.close()

    async def _extract_pdf_text(self, pdf_bytes: bytes) -> str:
        """
        Extract text from PDF electoral filings.
        Uses pdfplumber for accurate text extraction with layout preservation.
        """
        try:
            import io
            import pdfplumber

            text_parts = []
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)

            return '\n\n'.join(text_parts)

        except Exception as e:
            log.warning(f"PDF extraction failed, trying OCR fallback: {e}")
            return await self._ocr_fallback(pdf_bytes)

    async def _ocr_fallback(self, pdf_bytes: bytes) -> str:
        """
        OCR fallback for scanned PDFs.
        Uses pytesseract when pdfplumber finds no text (scanned documents).
        """
        try:
            import io
            import pytesseract
            from pdf2image import convert_from_bytes

            images = convert_from_bytes(pdf_bytes, dpi=200)
            texts = []
            for img in images:
                text = pytesseract.image_to_string(img, lang='por+eng+spa+fra')
                texts.append(text)

            return '\n\n'.join(texts)

        except Exception as e:
            log.error(f"OCR fallback also failed: {e}")
            return ""

    def _extract_text_from_html(self, html: str) -> str:
        """
        Extract clean text from HTML.
        Removes navigation, scripts, ads, and other noise.
        """
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(html, 'html.parser')

        # Remove non-content elements
        for tag in soup.find_all([
            'script', 'style', 'nav', 'header', 'footer',
            'iframe', 'noscript', 'aside', 'form',
        ]):
            tag.decompose()

        # Get text with whitespace normalization
        text = soup.get_text(separator='\n', strip=True)

        # Collapse multiple blank lines
        import re
        text = re.sub(r'\n{3,}', '\n\n', text)

        return text.strip()
