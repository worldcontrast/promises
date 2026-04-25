#!/usr/bin/env python3
"""
World Contrast — Discovery Scout (OSINT Agent)
File: agents/scout.py

Standalone script that discovers official candidate sources for any election
and writes a strictly-formatted JSON seed file for the main extraction pipeline.

Architecture
────────────
  CLI args
     │
     ▼
  DuckDuckGo HTML search  (no API key required)
  ┌──────────────────────────────────────────────┐
  │  Pass 1 — find candidates for the election   │
  │  Pass 2 — find official sources per candidate│
  └──────────────────────────────────────────────┘
     │  raw search snippets
     ▼
  Anthropic claude-sonnet-4-20250514
  ┌────────────────────────────────────────────────────┐
  │  SYSTEM PROMPT enforces:                           │
  │  • OFFICIAL SOURCES ONLY rule                      │
  │  • Electoral court filings > campaign sites >       │
  │    verified social media                           │
  │  • Hard reject: news, Wikipedia, blogs, fan pages  │
  │  Output: strict JSON, no markdown                  │
  └────────────────────────────────────────────────────┘
     │  validated JSON
     ▼
  data/countries/<country>-<slug>.json   (local file, no DB)

Usage
─────
  export ANTHROPIC_API_KEY="sk-ant-..."
  python agents/scout.py --country BR --election "Presidential 2026"

  # Optional: use Tavily for higher-quality search results
  export TAVILY_API_KEY="tvly-..."
  python agents/scout.py --country BR --election "Presidential 2026" --search tavily

  # Dry-run: print JSON to stdout without saving
  python agents/scout.py --country BR --election "Presidential 2026" --dry-run

Dependencies
────────────
  pip install httpx anthropic          # minimum
  pip install httpx anthropic tavily-python  # with Tavily
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import pathlib
import re
import sys
import unicodedata
from datetime import datetime, timezone
from typing import Any

import httpx

# ── Optional Tavily import (graceful degradation) ─────────────────────────────
try:
    from tavily import TavilyClient          # type: ignore
    HAS_TAVILY = True
except ImportError:
    HAS_TAVILY = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("scout")

# ── Constants ─────────────────────────────────────────────────────────────────

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_MODEL   = "claude-sonnet-4-20250514"
MAX_TOKENS        = 4096

DDG_URL  = "[https://html.duckduckgo.com/html/](https://html.duckduckgo.com/html/)"
DDG_HDRS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64; rv:124.0) "
        "Gecko/20100101 Firefox/124.0"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

OUTPUT_DIR = pathlib.Path("data/countries")

# ── System prompts ────────────────────────────────────────────────────────────

# Pass 1: extract candidate list from search results
SYSTEM_CANDIDATES = """\
You are an OSINT data extraction agent for World Contrast.

YOUR ONLY JOB IN THIS PASS:
Extract the list of confirmed candidates OR officially declared pre-candidates (pré-candidatos) for a specific political election from the web search snippets provided.

MANDATORY OUTPUT FORMAT:
Return ONLY a valid JSON array. No markdown. No preamble.
Example:
[
  {"fullName": "Luiz Inácio Lula da Silva", "party": "PT"},
  {"fullName": "Tarcísio de Freitas", "party": "Republicanos"}
]

STRICT RULES:
1. Include officially registered candidates AND officially declared "pre-candidates" backed by major political parties.
2. Because some elections are still in the pre-campaign phase, it is ACCEPTABLE to include major pre-candidates even if the electoral court (e.g., TSE) registration is not yet open.
3. Do NOT include purely speculative names, internet rumors, or people who have explicitly denied running.
4. Return an empty array [] ONLY if you cannot find any serious declared pre-candidates.
5. NEVER add commentary outside the JSON array.\
"""

# Pass 2: find official URLs for a single candidate
SYSTEM_SOURCES = """\
You are a strict OSINT sourcing agent for World Contrast, a cryptographically
sealed political promise registry. Your task is to identify ONLY OFFICIAL URLs
for a given political candidate.

OFFICIAL SOURCE HIERARCHY (in descending priority):
  1. Electoral court filing URL  (TSE in Brazil, CNE in Venezuela, etc.)
     — The URL where the candidate's official government plan is published.
  2. Official campaign website   (registered by the candidate's own party)
  3. Verified social media       (blue-tick / verified accounts ONLY):
       — Instagram: [instagram.com/](https://instagram.com/)<handle>
       — X/Twitter: [x.com/](https://x.com/)<handle> or [twitter.com/](https://twitter.com/)<handle>
       — YouTube:   [youtube.com/](https://youtube.com/)@<handle>
       — Facebook:  [facebook.com/](https://facebook.com/)<official-page>
       — TikTok:    [tiktok.com/](https://tiktok.com/)@<handle>

HARD REJECTION RULES — never return these:
  ✗ News articles (g1.globo.com, folha.uol.com.br, bbc.com, etc.)
  ✗ Wikipedia or any wiki
  ✗ Opinion blogs or political commentary sites
  ✗ Fan pages, parody accounts, or unofficial profiles
  ✗ Aggregator sites (allsides.com, politico.com candidate pages)
  ✗ URLs with 404 or redirect chains you are unsure about
  ✗ Any URL you cannot confidently attribute to the candidate directly

ANTI-SPOOFING RULES:
  • If the social media URL does not contain the candidate's last name,
    party abbreviation, or a well-known campaign handle, omit it.
  • When in doubt, return null for that field — never guess.

MANDATORY OUTPUT FORMAT:
Return ONLY a valid JSON object. No markdown. No explanation. No preamble.
Required schema:
{
  "electoral_filing": "<url or null>",
  "official_site":    "<url or null>",
  "instagram":        "<url or null>",
  "twitter":          "<url or null>",
  "youtube":          "<url or null>",
  "facebook":         "<url or null>",
  "tiktok":           "<url or null>"
}

NEVER return a URL you are not confident is official and current.\
"""


# ═════════════════════════════════════════════════════════════════════════════
# Search backends
# ═════════════════════════════════════════════════════════════════════════════

async def search_duckduckgo(query: str, client: httpx.AsyncClient) -> str:
    """
    Scrape DuckDuckGo HTML search (no API key required).
    Returns concatenated snippet text, capped at ~4000 chars.
    """
    log.info(f"  [DDG] {query}")
    try:
        resp = await client.post(
            DDG_URL,
            data={"q": query, "kl": "us-en"},
            headers=DDG_HDRS,
            timeout=15,
            follow_redirects=True,
        )
        resp.raise_for_status()
        html = resp.text

        # Extract result snippets via simple regex — no BeautifulSoup dep
        # DDG wraps snippets in <a class="result__snippet">
        snippets = re.findall(
            r'class="result__snippet"[^>]*>(.*?)</a>',
            html,
            re.DOTALL,
        )
        # Also grab result URLs
        urls = re.findall(
            r'class="result__url"[^>]*>(.*?)</span>',
            html,
        )

        lines: list[str] = []
        for i, snip in enumerate(snippets[:12]):
            clean = re.sub(r"<[^>]+>", "", snip).strip()
            clean = re.sub(r"\s+", " ", clean)
            url   = urls[i].strip() if i < len(urls) else ""
            lines.append(f"[{i+1}] {url}  —  {clean}")

        combined = "\n".join(lines)
        return combined[:4500]

    except Exception as exc:
        log.warning(f"  [DDG] Search failed for '{query}': {exc}")
        return ""


async def search_tavily(query: str, api_key: str) -> str:
    """
    Use Tavily Search API for higher-quality results.
    Returns formatted snippet text.
    """
    if not HAS_TAVILY:
        raise RuntimeError(
            "Tavily not installed. Run: pip install tavily-python"
        )
    log.info(f"  [TAVILY] {query}")
    client = TavilyClient(api_key=api_key)
    # Tavily is sync — run in thread pool
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: client.search(
            query,
            search_depth="advanced",
            max_results=8,
            include_raw_content=False,
        ),
    )
    lines: list[str] = []
    for i, r in enumerate(result.get("results", [])):
        lines.append(f"[{i+1}] {r.get('url','')}  —  {r.get('content','')[:300]}")
    return "\n".join(lines)[:4500]


# ═════════════════════════════════════════════════════════════════════════════
# LLM caller
# ═════════════════════════════════════════════════════════════════════════════

async def call_llm(
    system: str,
    user_message: str,
    api_key: str,
    client: httpx.AsyncClient,
) -> str:
    """
    Call Anthropic Messages API directly (no SDK dependency).
    Returns the raw text content of the first content block.
    """
    payload = {
        "model":      ANTHROPIC_MODEL,
        "max_tokens": MAX_TOKENS,
        "system":     system,
        "messages":   [{"role": "user", "content": user_message}],
    }
    headers = {
        "x-api-key":         api_key,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
    }

    resp = await client.post(
        ANTHROPIC_API_URL,
        json=payload,
        headers=headers,
        timeout=60,
    )

    if resp.status_code != 200:
        raise RuntimeError(
            f"Anthropic API error {resp.status_code}: {resp.text[:300]}"
        )

    data = resp.json()
    blocks = data.get("content", [])
    text_blocks = [b["text"] for b in blocks if b.get("type") == "text"]
    return "\n".join(text_blocks).strip()


# ═════════════════════════════════════════════════════════════════════════════
# JSON parsing helpers
# ═════════════════════════════════════════════════════════════════════════════

def extract_json(raw: str) -> Any:
    """
    Extract and parse JSON from LLM output.
    Strips markdown code fences if present.
    Raises ValueError if no valid JSON found.
    """
    # CORREÇÃO PARA BUG DE CÓPIA: Removendo marcações sem usar crases repetidas
    clean = re.sub(r"`{3}(?:json)?", "", raw)
    clean = clean.replace("`" * 3, "").strip()

    # Try full string first
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        pass

    # Try extracting the first JSON array or object
    for pattern in (r"\[.*\]", r"\{.*\}"):
        m = re.search(pattern, clean, re.DOTALL)
        if m:
            try:
                return json.loads(m.group())
            except json.JSONDecodeError:
                continue

    raise ValueError(f"No valid JSON found in LLM output:\n{raw[:400]}")


def validate_url(url: str | None) -> str | None:
    """
    Basic URL sanity check.
    Returns None if the URL looks malformed or is clearly unofficial.
    """
    if not url or not isinstance(url, str):
        return None
    url = url.strip().rstrip("/")
    if not url.startswith(("http://", "https://")):
        return None
    # Reject known non-official domains that slip through
    REJECT_DOMAINS = (
        "wikipedia.org", "wikimedia.org",
        "g1.globo.com", "folha.uol.com.br", "uol.com.br",
        "bbc.com", "bbc.co.uk", "cnn.com",
        "reuters.com", "apnews.com",
        "politico.com", "allsides.com",
        "reddit.com", "[twitter.com/search](https://twitter.com/search)",
        "google.com", "bing.com", "duckduckgo.com",
        "[youtube.com/results](https://youtube.com/results)",
    )
    lower = url.lower()
    if any(d in lower for d in REJECT_DOMAINS):
        log.debug(f"  [VALIDATE] Rejected non-official URL: {url}")
        return None
    return url


# ═════════════════════════════════════════════════════════════════════════════
# Slug helpers
# ═════════════════════════════════════════════════════════════════════════════

def slugify(text: str) -> str:
    """Convert 'Presidential 2026' → 'presidential-2026'."""
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_]+", "-", text)


# ═════════════════════════════════════════════════════════════════════════════
# Core Scout
# ═════════════════════════════════════════════════════════════════════════════

class Scout:
    """
    OSINT Discovery Agent.

    Two-pass LLM workflow:
      Pass 1 — Discover candidates for the election.
      Pass 2 — Per candidate: find official source URLs.
    """

    def __init__(
        self,
        country: str,
        election: str,
        api_key: str,
        search_backend: str = "duckduckgo",
        tavily_key: str | None = None,
        dry_run: bool = False,
    ) -> None:
        self.country  = country.upper().strip()
        self.election = election.strip()
        self.api_key  = api_key
        self.search_backend = search_backend
        self.tavily_key     = tavily_key
        self.dry_run        = dry_run

        slug = slugify(f"{self.country} {self.election}")
        self.output_path = OUTPUT_DIR / f"{slug}.json"

    async def run(self) -> dict:
        """Execute the full scout workflow. Returns the final JSON dict."""
        async with httpx.AsyncClient(follow_redirects=True) as http:

            # ── Pass 1: Discover candidates ───────────────────────────────
            log.info(f"PASS 1 — Discovering candidates for: {self.country} / {self.election}")
            candidates = await self._discover_candidates(http)

            if not candidates:
                log.error("No candidates found. Check your search results or try a different query.")
                sys.exit(1)

            log.info(f"  Found {len(candidates)} candidate(s): "
                     f"{', '.join(c['fullName'] for c in candidates)}")

            # ── Pass 2: Find official sources per candidate ───────────────
            log.info("PASS 2 — Discovering official sources per candidate")
            enriched: list[dict] = []
            for cand in candidates:
                log.info(f"  Sourcing: {cand['fullName']} ({cand.get('party', '?')})")
                sources = await self._discover_sources(cand, http)
                enriched.append({
                    "fullName": cand["fullName"],
                    "party":    cand.get("party", ""),
                    "sources":  sources,
                })

            # ── Build output ──────────────────────────────────────────────
            output = {
                "country":    self.country,
                "election":   self.election,
                "generated":  datetime.now(timezone.utc).isoformat(),
                "scout_version": "1.0.0",
                "candidates": enriched,
            }

            if self.dry_run:
                log.info("DRY RUN — printing JSON to stdout")
                print(json.dumps(output, ensure_ascii=False, indent=2))
            else:
                self._save(output)

            return output

    # ── Pass 1 ────────────────────────────────────────────────────────────────

    async def _discover_candidates(self, http: httpx.AsyncClient) -> list[dict]:
        """
        Search for candidates and parse the list via LLM.
        Retries with a broader query if the first attempt returns nothing.
        """
        queries = [
            f"{self.election} {self.country} candidates official registered 2026",
            f"eleição {self.country} {self.election} candidatos registrados TSE 2026",
            f"{self.country} election {self.election} confirmed candidates ballot",
        ]

        for i, query in enumerate(queries):
            snippets = await self._search(query, http)
            if not snippets:
                continue

            user_msg = (
                f"Election: {self.election}\n"
                f"Country: {self.country}\n\n"
                f"Web search results:\n{snippets}\n\n"
                f"Extract the confirmed candidates from these results."
            )

            try:
                raw = await call_llm(SYSTEM_CANDIDATES, user_msg, self.api_key, http)
                candidates = extract_json(raw)
                if isinstance(candidates, list) and candidates:
                    return candidates
                log.warning(f"  Pass 1 attempt {i+1}: LLM returned empty list, retrying…")
            except (ValueError, Exception) as exc:
                log.warning(f"  Pass 1 attempt {i+1} failed: {exc}")

        return []

    # ── Pass 2 ────────────────────────────────────────────────────────────────

    async def _discover_sources(
        self,
        candidate: dict,
        http: httpx.AsyncClient,
    ) -> dict:
        """
        For a single candidate, run targeted searches and extract official URLs.
        """
        name   = candidate["fullName"]
        party  = candidate.get("party", "")

        # Multiple targeted queries for different source types
        queries = [
            f'"{name}" {party} {self.country} site oficial candidatura TSE inscricao',
            f'"{name}" {party} instagram verified official account',
            f'"{name}" {party} site campanha eleitoral oficial 2026',
        ]

        all_snippets: list[str] = []
        for q in queries:
            snip = await self._search(q, http)
            if snip:
                all_snippets.append(snip)

        combined_snippets = "\n\n---\n\n".join(all_snippets)[:6000]

        if not combined_snippets:
            log.warning(f"  No search results for {name}. Returning empty sources.")
            return self._empty_sources()

        user_msg = (
            f"Candidate: {name}\n"
            f"Party: {party}\n"
            f"Country: {self.country}\n"
            f"Election: {self.election}\n\n"
            f"Web search results:\n{combined_snippets}\n\n"
            f"Find ONLY official source URLs for this candidate. "
            f"Return null for any field you cannot confirm."
        )

        try:
            raw     = await call_llm(SYSTEM_SOURCES, user_msg, self.api_key, http)
            sources = extract_json(raw)
            if not isinstance(sources, dict):
                raise ValueError("LLM did not return a JSON object")
            return self._sanitise_sources(sources)
        except Exception as exc:
            log.warning(f"  Source extraction failed for {name}: {exc}")
            return self._empty_sources()

    # ── Search dispatcher ─────────────────────────────────────────────────────

    async def _search(self, query: str, http: httpx.AsyncClient) -> str:
        if self.search_backend == "tavily" and self.tavily_key:
            return await search_tavily(query, self.tavily_key)
        return await search_duckduckgo(query, http)

    # ── Sanitisation ──────────────────────────────────────────────────────────

    def _sanitise_sources(self, raw: dict) -> dict:
        """
        Validate every URL returned by the LLM.
        Strip any that fail the official-source check.
        """
        keys = [
            "electoral_filing", "official_site",
            "instagram", "twitter", "youtube", "facebook", "tiktok",
        ]
        result: dict = {}
        for k in keys:
            url = validate_url(raw.get(k))
            result[k] = url  # None means absent / rejected
        return result

    @staticmethod
    def _empty_sources() -> dict:
        return {
            "electoral_filing": None,
            "official_site":    None,
            "instagram":        None,
            "twitter":          None,
            "youtube":          None,
            "facebook":         None,
            "tiktok":           None,
        }

    # ── File output ───────────────────────────────────────────────────────────

    def _save(self, data: dict) -> None:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        with open(self.output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        log.info(f"✓ Saved: {self.output_path}")
        # Print summary
        total_urls = sum(
            1
            for c in data["candidates"]
            for v in c["sources"].values()
            if v is not None
        )
        log.info(
            f"  {len(data['candidates'])} candidate(s) · "
            f"{total_urls} verified URLs"
        )


# ═════════════════════════════════════════════════════════════════════════════
# CLI
# ═════════════════════════════════════════════════════════════════════════════

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="World Contrast — Discovery Scout (OSINT Agent)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python agents/scout.py --country BR --election "Presidential 2026"
  python agents/scout.py --country AR --election "Presidential 2027" --search tavily
  python agents/scout.py --country US --election "Senate Georgia 2026" --dry-run

Environment variables:
  ANTHROPIC_API_KEY   (required)
  TAVILY_API_KEY      (required only with --search tavily)
        """,
    )
    p.add_argument(
        "--country", required=True,
        help="ISO-3166 country code (e.g. BR, US, AR, FR)",
    )
    p.add_argument(
        "--election", required=True,
        help='Election name (e.g. "Presidential 2026")',
    )
    p.add_argument(
        "--search",
        choices=["duckduckgo", "tavily"],
        default="duckduckgo",
        help="Search backend (default: duckduckgo — no API key needed)",
    )
    p.add_argument(
        "--output-dir",
        default="data/countries",
        help="Output directory (default: data/countries)",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Print JSON to stdout without saving",
    )
    p.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable DEBUG logging",
    )
    return p.parse_args()


async def main() -> None:
    args = parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Override output directory if specified
    global OUTPUT_DIR
    OUTPUT_DIR = pathlib.Path(args.output_dir)

    # Validate environment
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        log.error(
            "ANTHROPIC_API_KEY not set. "
            "Run: export ANTHROPIC_API_KEY='sk-ant-...'"
        )
        sys.exit(1)

    tavily_key: str | None = None
    if args.search == "tavily":
        tavily_key = os.environ.get("TAVILY_API_KEY", "").strip()
        if not tavily_key:
            log.error(
                "TAVILY_API_KEY not set but --search tavily was requested. "
                "Run: export TAVILY_API_KEY='tvly-...'"
            )
            sys.exit(1)
        if not HAS_TAVILY:
            log.error("Tavily not installed. Run: pip install tavily-python")
            sys.exit(1)

    scout = Scout(
        country=args.country,
        election=args.election,
        api_key=api_key,
        search_backend=args.search,
        tavily_key=tavily_key,
        dry_run=args.dry_run,
    )

    log.info(
        f"Scout starting — "
        f"country={scout.country} | "
        f"election={scout.election!r} | "
        f"search={args.search} | "
        f"output={scout.output_path}"
    )
    await scout.run()


if __name__ == "__main__":
    asyncio.run(main())
