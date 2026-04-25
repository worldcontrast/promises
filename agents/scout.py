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

DDG_URL  = "https://html.duckduckgo.com/html/"
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
       — Instagram: instagram.com/<handle>
       — X/Twitter: x.com/<handle> or twitter.com/<handle>
       — YouTube:   youtube.com/@<handle>
       — Facebook:  facebook.com/<official-page>
       — TikTok:    tiktok.com/@<handle>

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
    # Remove ```json ... ``` or ``` ... ``` fences
    clean = re.sub(r"
http://googleusercontent.com/immersive_entry_chip/0

Depois de fazer o *Commit changes*, pode correr lá pra aba **Actions** e dar o play na eleição de 2026. O cão de guarda agora sabe que deve deixar os pré-candidatos passarem! Me avise se deu tudo certo.
