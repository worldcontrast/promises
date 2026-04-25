#!/usr/bin/env python3
"""
World Contrast — Global Monitor (The All-Seeing Eye)
File: agents/global_monitor.py

This agent autonomously searches the web for upcoming global elections,
builds a dynamic list of target countries, and triggers the Scout agent
for each one automatically.
"""

import sys
import os
import asyncio
import logging
import argparse
from datetime import datetime

# Ensures we can import from the agents folder
sys.path.insert(0, os.getcwd())

import httpx

# We reuse the powerful tools we already built in the Scout!
from agents.scout import (
    Scout,
    call_llm,
    extract_json,
    search_duckduckgo,
    search_tavily,
    HAS_TAVILY,
    ANTHROPIC_API_URL,
    ANTHROPIC_MODEL,
    MAX_TOKENS,
    RETRY_BACKOFF,
    MAX_RETRIES
)

# Initialize logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  [GLOBAL] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("global_monitor")

SYSTEM_MONITOR = """\
You are the World Contrast Global Operations Commander.
Your task is to identify national-level elections (Presidential, General, Parliamentary, Federal) 
happening around the world in the current and upcoming year based on the search snippets.

Extract the most prominent active or upcoming elections. 
Return ONLY a JSON array of objects. Do not use markdown fences.
Each object must have:
 - "country": The ISO-3166 2-letter country code (e.g., "US", "UK", "BR").
 - "election": The standard name and year (e.g., "Presidential 2024", "General 2024").

Example:
[
  {"country": "US", "election": "Presidential 2024"},
  {"country": "UK", "election": "General 2024"}
]
"""

async def run_global_monitor(api_key: str, search_backend: str, tavily_key: str | None, dry_run: bool):
    year = datetime.now().year
    
    # 1. Search the web for global election calendars
    log.info(f"Searching for global election calendars for {year} and {year+1}...")
    queries = [
        f"major national elections calendar {year} {year+1} worldwide",
        f"list of upcoming presidential and general elections {year} {year+1} global"
    ]

    async with httpx.AsyncClient(follow_redirects=True, trust_env=False) as http:
        snippets_list = []
        for q in queries:
            if search_backend == "tavily" and tavily_key:
                snippets_list.append(await search_tavily(q, tavily_key))
            else:
                snippets_list.append(await search_duckduckgo(q, http))
        
        combined_snippets = "\n\n".join(snippets_list)[:6000]

        # 2. Ask Claude to map the globe
        log.info("Analyzing global political landscape using AI...")
        user_msg = (
            f"Current year: {year}\n\n"
            f"Search snippets:\n{combined_snippets}\n\n"
            f"Extract up to 10 major global elections currently in progress or upcoming. "
            f"Return the JSON array."
        )

        try:
            raw = await call_llm(SYSTEM_MONITOR, user_msg, api_key, http)
            elections = extract_json(raw)
            if not isinstance(elections, list):
                raise ValueError("LLM did not return a list.")
        except Exception as exc:
            log.error(f"Failed to extract global elections: {exc}")
            sys.exit(1)

        log.info(f"Target Acquired: {len(elections)} global elections detected.")
        for el in elections:
            log.info(f" 🎯 {el.get('country')} — {el.get('election')}")

        # 3. Trigger the Scout for each discovered election
        if dry_run:
            log.info("DRY RUN: Skipping actual Scout execution.")
            return

        for el in elections:
            country = el.get("country")
            election = el.get("election")
            
            if not country or not election:
                continue

            log.info(f"\n🚀 DEPLOYING SCOUT TO: {country} ({election})")
            scout = Scout(
                country=country,
                election=election,
                api_key=api_key,
                search_backend=search_backend,
                tavily_key=tavily_key,
                dry_run=False,
                allow_scheduled=True
            )
            
            try:
                await scout.run()
                # Pause slightly to respect rate limits between massive country sweeps
                await asyncio.sleep(5) 
            except Exception as e:
                log.error(f"Scout failed for {country}: {e}")

def main():
    parser = argparse.ArgumentParser(description="World Contrast — Global Election Monitor")
    parser.add_argument("--search", choices=["duckduckgo", "tavily"], default="duckduckgo")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip(" \r\n\t'\"")
    if not api_key:
        log.error("ANTHROPIC_API_KEY not set.")
        sys.exit(1)

    tavily_key = None
    if args.search == "tavily":
        tavily_key = os.environ.get("TAVILY_API_KEY", "").strip()

    asyncio.run(run_global_monitor(
        api_key=api_key,
        search_backend=args.search,
        tavily_key=tavily_key,
        dry_run=args.dry_run
    ))

if __name__ == "__main__":
    main()
