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
                resp = await client.post(
                    ANTHROPIC_API_URL,
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
    clean = re.sub(r"
http://googleusercontent.com/immersive_entry_chip/0

6. Clique no botão verde **Commit changes**.

### O que vai acontecer agora?
Ao fazer isto, você instalou o cérebro atualizado no robô. Se voltar ao separador **Actions** e clicar novamente no botão **Run workflow** para o *Scout — Discovery Agent*, o erro vai desaparecer e a pesquisa OSINT vai finalmente arrancar com sucesso! Pode avançar.
