#!/usr/bin/env python3
"""
World Contrast — Discovery Scout (OSINT Agent)
File: agents/scout.py

Standalone script that discovers official candidate sources for any election
and writes a strictly-formatted JSON seed file for the main extraction pipeline.
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

OUTPUT_DIR = pathlib.Path("data/countries")

# ── System prompts ────────────────────────────────────────────────────────────

# Pass 1: extract candidate list from search results
SYSTEM_CANDIDATES = """\
You are an expert political analyst and OSINT data extraction agent for World Contrast.

YOUR JOB:
Extract the list of confirmed candidates OR officially declared pre-candidates for a specific political election from the web search snippets provided.

CRITICAL INSTRUCTION - THE "EXPERT" RULE:
You must use your broad internal knowledge of global politics to FACT-CHECK the search snippets. The internet is full of rumors, clickbait, and click-driven journalism. You must filter out the noise.

STRICT REJECTION RULES (DO NOT INCLUDE THESE):
1. INELIGIBLE POLITICIANS: Exclude anyone who is legally barred from running, disqualified by courts, or facing term limits (e.g., in Brazil, Jair Bolsonaro is legally ineligible).
2. WRONG OFFICE: Exclude politicians who are prominent in the news but are running for a DIFFERENT office (e.g., Senate, Congress, Mayor). Do not confuse family members (e.g., Eduardo Bolsonaro or Flávio Bolsonaro are not running for President).
3. RUMORS & SPECULATION: Exclude people who have explicitly denied running, or names thrown around purely as opinion pieces.

ACCEPTANCE RULES:
1. Include officially registered candidates AND officially declared "pre-candidates" backed by major political parties.
2. Return an empty array [] ONLY if you cannot find any serious declared pre-candidates.

MANDATORY OUTPUT FORMAT:
Return ONLY a valid JSON array. No markdown. No preamble.
Example:
[
  {"fullName": "Luiz Inácio Lula da Silva", "party": "PT"},
  {"fullName": "Tarcísio de Freitas", "party": "Republicanos"}
]
"""

# Pass 2: find official URLs for a single candidate
SYSTEM_SOURCES = """\
You are a strict OSINT sourcing agent for World Contrast, a cryptographically
sealed political promise registry. Your task is to identify ONLY OFFICIAL URLs
for a given political candidate.

OFFICIAL SOURCE HIERARCHY (in descending priority):
  1. Electoral court filing URL  (TSE in Brazil, CNE in Venezuela, etc.)
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

def _sync_ddg(query: str) -> list[dict]:
    """Runs the duckduckgo search synchronously securely."""
    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = []
            for r in ddgs.text(query):
                results.append(r)
                if len(results) >= 10:
                    break
            return results
    except Exception as e:
        log.warning(f"DDGS internal error: {e}")
        return []

async def search_duckduckgo(query: str, client: httpx.AsyncClient) -> str:
    """
    Search using the official duckduckgo-search package (bypasses blocks).
    """
    log.info(f"  [DDG] {query}")
    try:
        results = await asyncio.to_thread(_sync_ddg, query)
        
        lines: list[str] = []
        for i, r in enumerate(results):
            url = r.get("href", "")
            body = r.get("body", "")
            lines.append(f"[{i+1}] {url}  —  {body}")

        combined = "\n".join(lines)
        return combined[:4500]

    except Exception as exc:
        log.warning(f"  [DDG] Search failed for '{query}': {exc}")
        return ""

async def search_tavily(query: str, api_key: str) -> str:
    if not HAS_TAVILY:
        raise RuntimeError("Tavily not installed. Run: pip install tavily-python")
    log.info(f"  [TAVILY] {query}")
    client = TavilyClient(api_key=api_key)
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

async def call_llm(system: str, user_message: str, api_key: str, client: httpx.AsyncClient) -> str:
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
    resp = await client.post(ANTHROPIC_API_URL, json=payload, headers=headers, timeout=60)
    if resp.status_code != 200:
        raise RuntimeError(f"Anthropic API error {resp.status_code}: {resp.text[:300]}")
    data = resp.json()
    blocks = data.get("content", [])
    text_blocks = [b["text"] for b in blocks if b.get("type") == "text"]
    return "\n".join(text_blocks).strip()

# ═════════════════════════════════════════════════════════════════════════════
# JSON parsing helpers
# ═════════════════════════════════════════════════════════════════════════════

def extract_json(raw: str) -> Any:
    clean = re.sub(r"`{3}(?:json)?", "", raw)
    clean = clean.replace("`" * 3, "").strip()
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        pass
    for pattern in (r"\[.*\]", r"\{.*\}"):
        m = re.search(pattern, clean, re.DOTALL)
        if m:
            try:
                return json.loads(m.group())
            except json.JSONDecodeError:
                continue
    raise ValueError(f"No valid JSON found in LLM output:\n{raw[:400]}")

def validate_url(url: str | None) -> str | None:
    if not url or not isinstance(url, str):
        return None
    url = url.strip().rstrip("/")
    if not url.startswith(("http://", "https://")):
        return None
    REJECT_DOMAINS = (
        "wikipedia.org", "wikimedia.org", "g1.globo.com", "folha.uol.com.br", "uol.com.br",
        "bbc.com", "bbc.co.uk", "cnn.com", "reuters.com", "apnews.com",
        "politico.com", "allsides.com", "reddit.com", "twitter.com/search",
        "google.com", "bing.com", "duckduckgo.com", "youtube.com/results",
    )
    lower = url.lower()
    if any(d in lower for d in REJECT_DOMAINS):
        return None
    return url

# ═════════════════════════════════════════════════════════════════════════════
# Slug helpers
# ═════════════════════════════════════════════════════════════════════════════

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_]+", "-", text)

# ═════════════════════════════════════════════════════════════════════════════
# Core Scout
# ═════════════════════════════════════════════════════════════════════════════

class Scout:
    def __init__(self, country: str, election: str, api_key: str, search_backend: str = "duckduckgo", tavily_key: str | None = None, dry_run: bool = False) -> None:
        self.country  = country.upper().strip()
        self.election = election.strip()
        self.api_key  = api_key
        self.search_backend = search_backend
        self.tavily_key     = tavily_key
        self.dry_run        = dry_run
        slug = slugify(f"{self.country} {self.election}")
        self.output_path = OUTPUT_DIR / f"{slug}.json"

    async def run(self) -> dict:
        async with httpx.AsyncClient(follow_redirects=True) as http:
            log.info(f"PASS 1 — Discovering candidates for: {self.country} / {self.election}")
            candidates = await self._discover_candidates(http)
            if not candidates:
                log.error("No candidates found. Check your search results or try a different query.")
                sys.exit(1)
            
            log.info(f"  Found {len(candidates)} candidate(s): {', '.join(c['fullName'] for c in candidates)}")
            
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

    async def _discover_candidates(self, http: httpx.AsyncClient) -> list[dict]:
        queries = [
            f"{self.election} {self.country} candidates official registered 2026",
            f"eleição {self.country} {self.election} candidatos registrados TSE 2026",
            f"{self.country} election {self.election} confirmed candidates ballot",
        ]
        for i, query in enumerate(queries):
            snippets = await self._search(query, http)
            if not snippets:
                continue
            user_msg = f"Election: {self.election}\nCountry: {self.country}\n\nWeb search results:\n{snippets}\n\nExtract the confirmed candidates from these results."
            try:
                raw = await call_llm(SYSTEM_CANDIDATES, user_msg, self.api_key, http)
                candidates = extract_json(raw)
                if isinstance(candidates, list) and candidates:
                    return candidates
                log.warning(f"  Pass 1 attempt {i+1}: LLM returned empty list, retrying…")
            except (ValueError, Exception) as exc:
                log.warning(f"  Pass 1 attempt {i+1} failed: {exc}")
        return []

    async def _discover_sources(self, candidate: dict, http: httpx.AsyncClient) -> dict:
        name   = candidate["fullName"]
        party  = candidate.get("party", "")
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
        
        user_msg = f"Candidate: {name}\nParty: {party}\nCountry: {self.country}\nElection: {self.election}\n\nWeb search results:\n{combined_snippets}\n\nFind ONLY official source URLs for this candidate. Return null for any field you cannot confirm."
        try:
            raw     = await call_llm(SYSTEM_SOURCES, user_msg, self.api_key, http)
            sources = extract_json(raw)
            if not isinstance(sources, dict):
                raise ValueError("LLM did not return a JSON object")
            return self._sanitise_sources(sources)
        except Exception as exc:
            log.warning(f"  Source extraction failed for {name}: {exc}")
            return self._empty_sources()

    async def _search(self, query: str, http: httpx.AsyncClient) -> str:
        if self.search_backend == "tavily" and self.tavily_key:
            return await search_tavily(query, self.tavily_key)
        return await search_duckduckgo(query, http)

    def _sanitise_sources(self, raw: dict) -> dict:
        keys = ["electoral_filing", "official_site", "instagram", "twitter", "youtube", "facebook", "tiktok"]
        result: dict = {}
        for k in keys:
            url = validate_url(raw.get(k))
            result[k] = url 
        return result

    @staticmethod
    def _empty_sources() -> dict:
        return {"electoral_filing": None, "official_site": None, "instagram": None, "twitter": None, "youtube": None, "facebook": None, "tiktok": None}

    def _save(self, data: dict) -> None:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        with open(self.output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        log.info(f"✓ Saved: {self.output_path}")

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="World Contrast — Discovery Scout (OSINT Agent)")
    p.add_argument("--country", required=True)
    p.add_argument("--election", required=True)
    p.add_argument("--search", choices=["duckduckgo", "tavily"], default="duckduckgo")
    p.add_argument("--output-dir", default="data/countries")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--verbose", "-v", action="store_true")
    return p.parse_args()

async def main() -> None:
    args = parse_args()
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    global OUTPUT_DIR
    OUTPUT_DIR = pathlib.Path(args.output_dir)
    
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        log.error("ANTHROPIC_API_KEY not set.")
        sys.exit(1)

    tavily_key: str | None = None
    if args.search == "tavily":
        tavily_key = os.environ.get("TAVILY_API_KEY", "").strip()
        if not HAS_TAVILY:
            log.error("Tavily not installed.")
            sys.exit(1)

    scout = Scout(
        country=args.country,
        election=args.election,
        api_key=api_key,
        search_backend=args.search,
        tavily_key=tavily_key,
        dry_run=args.dry_run,
    )
    await scout.run()

if __name__ == "__main__":
    asyncio.run(main())
