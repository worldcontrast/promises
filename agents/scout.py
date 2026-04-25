#!/usr/bin/env python3
"""
World Contrast — Discovery Scout v2.0
File: agents/scout.py

CHANGES FROM v1
───────────────
1. Rate-limiting  — asyncio.Semaphore on all Anthropic API calls + exponential
   back-off on HTTP 429.  Prevents cloud-function bans.

2. Source Triangulation — social-media handles are only accepted when they are
   explicitly cross-referenced by TWO independent signals in the search results.

3. Scheduled-election scaffolding — can emit `status: "scheduled"` records for
   elections where candidates are not yet declared.

4. Markdown Bug Fix — safe string parsing for JSON blocks.
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
from typing import Any, Literal

import httpx

# ── Optional Tavily ───────────────────────────────────────────────────────────
try:
    from tavily import TavilyClient   # type: ignore
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
MAX_TOKENS        = 2048

_ANTHROPIC_SEM: asyncio.Semaphore | None = None

MAX_RETRIES   = 4
RETRY_BACKOFF = [1, 2, 4, 8]

OUTPUT_DIR = pathlib.Path("data/countries")

SCHEDULED_PLACEHOLDER = "__SCHEDULED__"

_REJECT_DOMAINS: frozenset[str] = frozenset({
    "wikipedia.org", "wikimedia.org",
    "g1.globo.com", "folha.uol.com.br", "uol.com.br",
    "bbc.com", "bbc.co.uk", "cnn.com",
    "reuters.com", "apnews.com",
    "politico.com", "allsides.com",
    "reddit.com", "twitter.com/search",
    "google.com", "bing.com", "duckduckgo.com",
    "youtube.com/results",
})

_CORROBORATION_SOURCES: frozenset[str] = frozenset({
    "tse.jus.br", "cne.gob.ve", "inec.gob.ec", "fec.gov",
    "electoralcommission.org.uk", "conseil-constitutionnel.fr",
    "bbc.com", "reuters.com", "apnews.com", "nytimes.com",
    "theguardian.com", "lemonde.fr", "elcorreo.com",
    "folha.uol.com.br", "estadao.com.br", "valor.com.br",
    "g1.globo.com",
})

# ═════════════════════════════════════════════════════════════════════════════
# System prompts
# ═════════════════════════════════════════════════════════════════════════════

SYSTEM_CANDIDATES = """\
You are an expert political analyst and OSINT data-extraction agent for
World Contrast, a cryptographically sealed political-promise registry.

TASK
Extract the list of officially declared candidates or pre-candidates for the
requested election from the search snippets provided.

EXPERT FACT-CHECK RULES (apply your internal political knowledge):
1. INELIGIBLE: Exclude anyone legally barred (court disqualification, term
   limits, age requirements). In Brazil 2026, Jair Bolsonaro is legally
   ineligible and MUST NOT appear.
2. WRONG OFFICE: Exclude politicians who are prominent but running for a
   different office or seat.
3. RUMOURS: Exclude names that appear only in speculative opinion pieces or
   that the person has publicly denied.
4. NO CANDIDATES YET: If the election is real but it is too early for
   official declarations, return the special string "SCHEDULED" (without
   quotes, not a JSON array).

ACCEPTANCE RULES:
• Include officially registered candidates AND officially declared
  pre-candidates backed by major political parties.
• Return an empty array [] ONLY if no serious declared pre-candidates exist
  AND the election is currently underway (not just scheduled for the future).

OUTPUT FORMAT (choose exactly one):
A) A valid JSON array:
   [{"fullName": "...", "party": "..."}]
B) The exact string SCHEDULED (no quotes, no markdown, no other text)
   — use this when the election is confirmed but candidates are not yet declared.

No markdown fences. No preamble. No explanation outside the JSON.\
"""

SYSTEM_SOURCES = """\
You are a strict OSINT sourcing agent for World Contrast. Your task is to
identify ONLY OFFICIAL, VERIFIED URLs for a political candidate.

OFFICIAL SOURCE HIERARCHY:
  1. Electoral court filing (TSE/BR, CNE/VE, FEC/US, etc.)
  2. Official campaign website (party-registered domain)
  3. Verified social-media accounts (blue-tick / government-verified only)

TRIANGULATION RULE — MANDATORY FOR SOCIAL MEDIA:
A social-media handle is ONLY valid if it satisfies BOTH conditions:
  a) It appears in the search snippets, AND
  b) At least one of the following is also present in the same snippets:
       — The candidate's official campaign website references the handle, OR
       — An official electoral court record references the handle, OR
       — Two or more credible press outlets independently name the exact same handle.
If only a single source mentions a handle without corroboration → return null.

HARD REJECTION RULES:
  ✗ Wrong office / wrong year filings
  ✗ News articles as source URLs
  ✗ Wikipedia, wikis, fan pages, parody accounts
  ✗ Any URL you cannot attribute with high confidence directly to the candidate

NO-GUESSING RULE:
  • NEVER construct a URL by guessing. The handle MUST be explicitly stated.
  • When in doubt, return null.

OUTPUT FORMAT:
Return ONLY a valid JSON object. No markdown. No preamble.
{
  "electoral_filing": "<url or null>",
  "official_site":    "<url or null>",
  "instagram":        "<url or null>",
  "twitter":          "<url or null>",
  "youtube":          "<url or null>",
  "facebook":         "<url or null>",
  "tiktok":           "<url or null>"
}\
"""

SYSTEM_VERIFY = """\
You are a critical fact-checker for World Contrast. You will be given a
candidate, a proposed social-media URL, and search-result snippets.

TASK: Decide whether the proposed URL is genuinely the candidate's official
account based on the snippets.

RETURN EXACTLY ONE OF:
  CONFIRMED  — at least two independent credible signals in the snippets
               corroborate this handle as belonging to this candidate.
  REJECTED   — only one source mentions it, or the evidence is ambiguous.

No markdown. No preamble. No explanation. Just CONFIRMED or REJECTED.\
"""

# ═════════════════════════════════════════════════════════════════════════════
# LLM caller
# ═════════════════════════════════════════════════════════════════════════════

async def call_llm(
    system: str,
    user_message: str,
    api_key: str,
    client: httpx.AsyncClient,
) -> str:
    global _ANTHROPIC_SEM
    if _ANTHROPIC_SEM is None:
        _ANTHROPIC_SEM = asyncio.Semaphore(4)

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

    async with _ANTHROPIC_SEM:
        for attempt, wait_s in enumerate(RETRY_BACKOFF):
            try:
                # FIX: Limpeza cirúrgica para remover eventuais espaços invisíveis do copy-paste
                clean_url = ANTHROPIC_API_URL.strip(" \r\n\t\u200b\ufeff")
                resp = await client.post(
                    clean_url,
                    json=payload,
                    headers=headers,
                    timeout=60,
                )
                if resp.status_code in (429, 529):
                    log.warning(
                        f"  [LLM] Rate-limited (HTTP {resp.status_code}), "
                        f"retry {attempt+1}/{MAX_RETRIES} in {wait_s}s…"
                    )
                    await asyncio.sleep(wait_s)
                    continue
                if resp.status_code != 200:
                    raise RuntimeError(
                        f"Anthropic API error {resp.status_code}: "
                        f"{resp.text[:300]}"
                    )
                data   = resp.json()
                blocks = data.get("content", [])
                return "\n".join(
                    b["text"] for b in blocks if b.get("type") == "text"
                ).strip()
            except httpx.TimeoutException:
                if attempt == MAX_RETRIES - 1:
                    raise
                log.warning(f"  [LLM] Timeout, retry {attempt+1}…")
                await asyncio.sleep(wait_s)

    raise RuntimeError("All Anthropic API retries exhausted")

# ═════════════════════════════════════════════════════════════════════════════
# Helpers
# ═════════════════════════════════════════════════════════════════════════════

def extract_json(raw: str) -> Any:
    # SAFE STRING PARSING: Uses multipliers instead of literal backticks
    # to avoid breaking markdown parsers in chat interfaces.
    clean = re.sub(r"`{3}(?:json)?", "", raw)
    clean = clean.replace("`" * 3, "").strip()

    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        pass

    for pattern in (r"\[[\s\S]*\]", r"\{[\s\S]*\}"):
        m = re.search(pattern, clean)
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
    lower = url.lower()
    if any(d in lower for d in _REJECT_DOMAINS):
        return None
    return url

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_]+", "-", text)

def _sync_ddg(query: str) -> list[dict]:
    try:
        from duckduckgo_search import DDGS   # type: ignore
        with DDGS() as ddgs:
            results: list[dict] = []
            for r in ddgs.text(query):
                results.append(r)
                if len(results) >= 10:
                    break
            return results
    except Exception as exc:
        log.warning(f"DDGS error: {exc}")
        return []

async def search_duckduckgo(query: str, _client: httpx.AsyncClient) -> str:
    log.info(f"  [DDG] {query}")
    results = await asyncio.to_thread(_sync_ddg, query)
    lines = [
        f"[{i+1}] {r.get('href', '')}  —  {r.get('body', '')}"
        for i, r in enumerate(results)
    ]
    return "\n".join(lines)[:4500]

async def search_tavily(query: str, api_key: str) -> str:
    if not HAS_TAVILY:
        raise RuntimeError("Tavily not installed. Run: pip install tavily-python")
    log.info(f"  [TAVILY] {query}")
    tv = TavilyClient(api_key=api_key)
    result = await asyncio.to_thread(
        lambda: tv.search(
            query,
            search_depth="advanced",
            max_results=8,
            include_raw_content=False,
        )
    )
    lines = [
        f"[{i+1}] {r.get('url','')}  —  {r.get('content','')[:300]}"
        for i, r in enumerate(result.get("results", []))
    ]
    return "\n".join(lines)[:4500]

# ═════════════════════════════════════════════════════════════════════════════
# Scout
# ═════════════════════════════════════════════════════════════════════════════

class Scout:
    def __init__(
        self,
        country: str,
        election: str,
        api_key: str,
        search_backend: str = "duckduckgo",
        tavily_key: str | None = None,
        dry_run: bool = False,
        allow_scheduled: bool = True,
    ) -> None:
        self.country         = country.upper().strip()
        self.election        = election.strip()
        self.api_key         = api_key
        self.search_backend  = search_backend
        self.tavily_key      = tavily_key
        self.dry_run         = dry_run
        self.allow_scheduled = allow_scheduled

        slug             = slugify(f"{self.country} {self.election}")
        self.output_path = OUTPUT_DIR / f"{slug}.json"

    async def run(self) -> dict:
        # FIX: trust_env=False blinda o robô contra proxies defeituosos do GitHub Actions
        async with httpx.AsyncClient(follow_redirects=True, trust_env=False) as http:
            log.info(f"PASS 1 — Discovering candidates: {self.country} / {self.election}")
            candidates_or_sentinel = await self._discover_candidates(http)

            if candidates_or_sentinel == SCHEDULED_PLACEHOLDER:
                return self._emit_scheduled()

            candidates = candidates_or_sentinel
            if not candidates:
                log.error("No candidates found and election is not scheduled.")
                sys.exit(1)

            log.info(f"  Found {len(candidates)} candidate(s): " + ", ".join(c["fullName"] for c in candidates))

            log.info("PASS 2 — Discovering and verifying official sources")
            enriched: list[dict] = []
            for cand in candidates:
                log.info(f"  [{cand['fullName']}]")
                sources = await self._discover_sources(cand, http)
                enriched.append({
                    "fullName": cand["fullName"],
                    "party":    cand.get("party", ""),
                    "sources":  sources,
                })

            output = self._build_output(enriched, status="live")

            if self.dry_run:
                log.info("DRY RUN — printing to stdout")
                print(json.dumps(output, ensure_ascii=False, indent=2))
            else:
                self._save(output)

            return output

    async def _discover_candidates(self, http: httpx.AsyncClient) -> list[dict] | str:
        queries = [
            f"{self.election} {self.country} candidates official pre-candidates 2026 registered",
            f"eleição {self.country} {self.election} pré-candidatos declarados TSE 2026",
            f"{self.country} {self.election} confirmed candidates ballot declared",
        ]

        for i, query in enumerate(queries):
            snippets = await self._search(query, http)
            if not snippets:
                continue

            user_msg = (
                f"Election: {self.election}\n"
                f"Country: {self.country}\n\n"
                f"Web search results:\n{snippets}\n\n"
                f"Extract confirmed candidates. "
                f"If the election is scheduled but no candidates are declared "
                f"yet, return the word SCHEDULED."
            )

            try:
                raw = await call_llm(SYSTEM_CANDIDATES, user_msg, self.api_key, http)
                if raw.strip().upper() == "SCHEDULED":
                    log.info("  LLM: election is SCHEDULED, no candidates yet.")
                    return SCHEDULED_PLACEHOLDER

                cands = extract_json(raw)
                if isinstance(cands, list) and cands:
                    return cands
                log.warning(f"  Pass 1 attempt {i+1}: empty list, retrying…")
            except (ValueError, RuntimeError) as exc:
                log.warning(f"  Pass 1 attempt {i+1} failed: {exc}")
        return []

    async def _discover_sources(self, candidate: dict, http: httpx.AsyncClient) -> dict:
        name  = candidate["fullName"]
        party = candidate.get("party", "")
        queries = [
            f'"{name}" {party} {self.country} site oficial candidatura TSE inscrição',
            f'"{name}" {party} perfil oficial instagram twitter verificado',
            f'"{name}" {party} campanha eleitoral site oficial 2026',
        ]

        snippets_parts: list[str] = []
        for q in queries:
            s = await self._search(q, http)
            if s:
                snippets_parts.append(s)

        combined = "\n\n---\n\n".join(snippets_parts)[:6000]

        if not combined:
            return self._empty_sources()

        user_msg = (
            f"Candidate: {name}\n"
            f"Party: {party}\n"
            f"Country: {self.country}\n"
            f"Election: {self.election}\n\n"
            f"Web search results:\n{combined}\n\n"
            f"Find ONLY official source URLs. Apply the TRIANGULATION RULE for social media."
        )

        try:
            raw     = await call_llm(SYSTEM_SOURCES, user_msg, self.api_key, http)
            sources = extract_json(raw)
            if not isinstance(sources, dict):
                raise ValueError("LLM did not return a JSON object")

            sanitised = self._sanitise_sources(sources)

            social_keys = ["instagram", "twitter", "youtube", "facebook", "tiktok"]
            for key in social_keys:
                url = sanitised.get(key)
                if url:
                    ok = await self._verify_social(name, url, combined, http)
                    if not ok:
                        log.info(f"  [VERIFY] {key} {url} → REJECTED")
                        sanitised[key] = None

            return sanitised
        except Exception as exc:
            log.warning(f"  Source extraction failed for {name}: {exc}")
            return self._empty_sources()

    async def _verify_social(self, name: str, url: str, snippets: str, http: httpx.AsyncClient) -> bool:
        user_msg = (
            f"Candidate: {name}\n"
            f"Proposed URL: {url}\n\n"
            f"Search snippets:\n{snippets[:3000]}\n\n"
            f"Is this URL confirmed by at least two independent credible signals in the snippets? Reply CONFIRMED or REJECTED only."
        )
        try:
            verdict = await call_llm(SYSTEM_VERIFY, user_msg, self.api_key, http)
            return verdict.strip().upper().startswith("CONFIRMED")
        except Exception:
            return False

    def _emit_scheduled(self) -> dict:
        output = self._build_output([], status="scheduled")
        log.info(f"  Election is SCHEDULED — emitting empty scaffold")
        if self.dry_run:
            print(json.dumps(output, ensure_ascii=False, indent=2))
        else:
            self._save(output)
        return output

    def _build_output(self, candidates: list[dict], status: Literal["live", "scheduled"]) -> dict:
        return {
            "country":       self.country,
            "election":      self.election,
            "status":        status,
            "generated":     datetime.now(timezone.utc).isoformat(),
            "scout_version": "2.0.0",
            "candidates":    candidates,
        }

    async def _search(self, query: str, http: httpx.AsyncClient) -> str:
        if self.search_backend == "tavily" and self.tavily_key:
            return await search_tavily(query, self.tavily_key)
        return await search_duckduckgo(query, http)

    def _sanitise_sources(self, raw: dict) -> dict:
        keys = ["electoral_filing", "official_site", "instagram", "twitter", "youtube", "facebook", "tiktok"]
        return {k: validate_url(raw.get(k)) for k in keys}

    @staticmethod
    def _empty_sources() -> dict:
        return {"electoral_filing": None, "official_site": None, "instagram": None, "twitter": None, "youtube": None, "facebook": None, "tiktok": None}

    def _save(self, data: dict) -> None:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        with open(self.output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        log.info(f"✓ Saved: {self.output_path}")

# ═════════════════════════════════════════════════════════════════════════════
# CLI
# ═════════════════════════════════════════════════════════════════════════════

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="World Contrast — Discovery Scout v2.0")
    p.add_argument("--country",    required=True, help="ISO-3166 country code")
    p.add_argument("--election",   required=True, help='Election name, e.g. "Presidential 2026"')
    p.add_argument("--search",     choices=["duckduckgo", "tavily"], default="duckduckgo")
    p.add_argument("--output-dir", default="data/countries")
    p.add_argument("--dry-run",    action="store_true", help="Print JSON without saving")
    p.add_argument("--scheduled",  action="store_true", help="Allow output of status=scheduled")
    p.add_argument("--verbose", "-v", action="store_true")
    return p.parse_args()

async def main() -> None:
    args = parse_args()
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    global OUTPUT_DIR
    OUTPUT_DIR = pathlib.Path(args.output_dir)

    global _ANTHROPIC_SEM
    _ANTHROPIC_SEM = asyncio.Semaphore(4)

    # FIX: Limpeza agressiva de aspas e quebras de linha na API Key
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip(" \r\n\t'\"")
    if not api_key:
        log.error("ANTHROPIC_API_KEY not set.")
        sys.exit(1)

    tavily_key: str | None = None
    if args.search == "tavily":
        tavily_key = os.environ.get("TAVILY_API_KEY", "").strip()

    scout = Scout(
        country=args.country,
        election=args.election,
        api_key=api_key,
        search_backend=args.search,
        tavily_key=tavily_key,
        dry_run=args.dry_run,
        allow_scheduled=args.scheduled,
    )
    await scout.run()

if __name__ == "__main__":
    asyncio.run(main())
