<div align="center">

World Contrast 🌍

The world is clearer in contrast.

An open, neutral, and cryptographically auditable infrastructure

for comparing political campaign promises — in any country, in any language.

worldcontrast.org · API Terms · License · Manifesto

"The truth emerges from contrast — not from repetition."

</div>

What World Contrast is — and what it is not

World Contrast is not a media outlet.

It is not an opinion platform.

It is not a fact-checker.

It is a public record — a mirror that reflects what candidates officially promised, without editorial judgment, without bias, and without the ability to be altered after the fact.

We copy only from official sources. We never contact candidates or parties. We never editorialize. We only compare.

The engine is open. The historical record is public. The live infrastructure is governed. > Code: AGPL v3.0 — free to inspect and fork, required to stay open.

Data: CC BY 4.0 — public domain for journalists and citizens.

Live API: Governed, auditable, and commercially maintained — see TERMS_API.md.

Table of Contents

Architecture overview

Repository structure

How the agent system works

POCVA-01 Protocol

Data sources and collection rules

The 9 categories

Candidate page standard

Cryptographic integrity

Tech stack

Running locally

Deploying to production

API costs and sustainability

The Tripartite Architecture: Code, Data, and Live API

Contributing

Code of conduct for contributors

Manifesto

License

Architecture overview

PUBLIC SOURCES (read-only)
Electoral tribunals · Official sites · Official social media · Official video channels
        ↓
COLLECTION AGENTS (Python · Playwright · runs every 5 days)
Web Crawler · PDF Parser · Social API Agent · Archive Agent
        ↓
EXTRACTION PIPELINE — POCVA-01 PROTOCOL (Claude API · claude-sonnet-4-6)
Promise Extractor → Category Classifier → Translation Agent
        ↓
VALIDATION LAYER
Duplicate Detector · Sentiment Guard · Confidence Scorer · Rejection Logger
        ↓
DATABASE (Supabase PostgreSQL · pgvector · SHA-256 + Wayback Machine)
        ↓
PUBLIC INTERFACE
Next.js frontend (Vercel) · REST API · Audit Portal · Authenticity Badge


Repository structure

worldcontrast/
├── README.md                    ← this file
├── LICENSE                      ← AGPL v3.0 (code) + CC BY 4.0 (data) + API Terms
├── TERMS_API.md                 ← API and data governance terms
├── MANIFESTO.md                 ← the founding document
├── CONTRIBUTING.md              ← how to contribute
├── CODE_OF_CONDUCT.md           ← contributor rules (strict neutrality)
├── DATA_STANDARDS.md            ← rules for data collection and quality
│
├── agents/                      ← the collection and extraction system
│   ├── crawler/
│   │   ├── crawler.py           ← headless browser + HTTP fetcher
│   │   ├── hasher.py            ← SHA-256 content fingerprinting
│   │   ├── pdf_parser.py
│   │   └── social_api.py
│   ├── extraction/
│   │   ├── extractor.py         ← sends content to Claude API (POCVA-01)
│   │   ├── classifier.py        ← categorizes promises into 9 categories
│   │   ├── translator.py        ← translates to 6 UN languages
│   │   └── prompts/
│   │       ├── extraction_prompt.txt     ← THE critical system prompt
│   │       └── classification_prompt.txt
│   ├── validation/
│   │   ├── validator.py         ← Promise Equation enforcement
│   │   ├── deduplicator.py
│   │   └── sentiment_guard.py
│   ├── archive/
│   │   └── archiver.py          ← Wayback Machine submission
│   ├── scheduler.py             ← orchestrates the full pipeline
│   └── requirements.txt
│
├── backend/
│   ├── api/
│   │   ├── candidates.py
│   │   ├── promises.py
│   │   ├── countries.py
│   │   └── audit.py
│   ├── db/
│   │   ├── schema.sql           ← full database schema (PostgreSQL 15+)
│   │   └── audit_triggers.sql   ← append-only audit log + RLS policies
│   └── main.py
│
├── frontend/
│   └── src/
│       ├── app/
│       │   └── [locale]/
│       │       ├── page.tsx              ← country vitrine
│       │       └── compare/[electionId]/
│       │           └── page.tsx          ← side-by-side comparison
│       └── components/
│           └── AuthenticityBadge.tsx     ← 🔒 SHA-256 seal per promise
│
├── data/
│   ├── countries/
│   │   ├── brazil.json          ← official source URLs for Brazil 2026
│   │   └── ...
│   └── tribunals.json
│
└── .github/
    └── workflows/
        ├── agent-run.yml        ← scheduled collection (every 5 days)
        ├── tests.yml
        └── deploy.yml


How the agent system works

Step 1 — Source registry

Every country has a JSON file in /data/countries/ listing official sources for each candidate. Only URLs in this registry are ever crawled. Adding a source requires a pull request with independent verification.

{
  "country": "Brazil",
  "country_code": "BR",
  "election": "Presidential 2026",
  "tribunal": {
    "name": "Tribunal Superior Electoral",
    "url": "[https://www.tse.jus.br](https://www.tse.jus.br)"
  },
  "candidates": [
    {
      "id": "candidate-001",
      "fullName": "João da Silva",
      "party": "PPP",
      "electoralNumber": "13",
      "sources": {
        "electoralFiling": "[https://divulgacandcontas.tse.jus.br/](https://divulgacandcontas.tse.jus.br/)...",
        "officialSite": "[https://joaodasilva.com.br](https://joaodasilva.com.br)",
        "instagram": "[https://instagram.com/joaodasilva.oficial](https://instagram.com/joaodasilva.oficial)"
      }
    }
  ]
}


Step 2 — Collection (every 5 days via GitHub Actions)

The scheduler triggers the crawler for all active campaigns. Per candidate, per source:

Visits the URL using Playwright (headless — no login, no forms, no clicks)

Saves full page archive to S3 + submits to Wayback Machine

Computes SHA-256 hash of the archived content

Records the crawl in crawled_pages table with full provenance

Queues raw content for extraction

Step 3 — Extraction under POCVA-01

The extractor sends content to the Claude API under the POCVA-01 system prompt (see below). Returns structured JSON:

{
  "promises": [
    {
      "category": "economy",
      "text_original": "Vamos isentar quem ganha até cinco mil reais.",
      "text_en": "We will exempt from income tax those earning up to five thousand reais.",
      "verbatim": true,
      "confidence": 0.97,
      "ambiguous": false
    }
  ],
  "extraction_metadata": {
    "total_considered": 14,
    "total_accepted": 3,
    "total_rejected": 11
  }
}


Step 4 — Validation + rejection logging

Every extracted promise passes through:

Promise Equation check: must satisfy [Actor] + [Future Action Verb] + [Measurable Target]

Sentiment Guard: rejects attacks, comparisons, or editorial framing

Duplicate Detector: vector similarity check against existing records

Confidence threshold: records below 0.75 are flagged for quality review

Every rejection — whether rhetorical, an attack, or below threshold — is logged in the extraction_rejections table with the original text and exact reason. This table is public.

Step 5 — Storage with cryptographic provenance

Every saved promise includes:

Field

Value

source_url

exact URL visited

archive_url

Wayback Machine permalink

collected_at

ISO 8601 timestamp

content_hash

SHA-256 of the archived page

agent_version

version of the agent that collected it

POCVA-01 Protocol

Autonomous Collection and Validation Operational Protocol — version 01

This is the institutional and legal framework that governs every extraction decision. It is not configurable. It is not overridable.

Rule 1 — Closed Border

The agent is strictly prohibited from using open search (Google, Bing, etc.) to find promises. It may only read URLs registered in source_registry with active = true.

Eligible source types: electoral_filing, official_site, instagram, facebook, twitter, youtube, tiktok, press_release — from verified official accounts only.

Rule 2 — The Promise Equation

A statement is only a promise if it satisfies:

[P] Promise = [A] Actor + [V] Future Action Verb + [M] Measurable Target


Example

Result

Reason

"Vamos melhorar a saúde do nosso povo."

❌ Rejected

No measurable target — rhetorical

"Vamos construir 500 hospitais públicos até 2028."

✅ Accepted

Actor + Action + Metric (500 hospitals, deadline 2028)

"O candidato X destruiu a economia."

❌ Rejected

Attack on opponent — auto-reject

Rule 3 — Computational Symmetry

The scheduler processes candidates in symmetric batches. The same volume limit (N bytes or N pages per cycle) applies to every candidate in the same election. If Candidate A publishes 500 pages and Candidate B publishes 10, the system collects both fully and displays: "100% of 10 official sources analyzed" — the asymmetry belongs to the candidate, not to World Contrast.

Rule 4 — Mandatory Rejection Logging

Every piece of content the agent reads and does not save as a promise must be logged in extraction_rejections with:

the original text

the rejection reason (Rhetorical abstraction, Attack on opponent, Below confidence threshold, No measurable target)

the timestamp and source URL

This is the legal and institutional shield of World Contrast. If any party alleges censorship, the public rejection log provides exact, timestamped, machine-generated proof of every decision.

Rule 5 — Semantic Isolation System Prompt

The Claude API system prompt instructs the model to operate as a forensic data extractor, not a political analyst. The exact prompt lives in /agents/extraction/prompts/extraction_prompt.txt. It may not be modified without a two-maintainer PR review.

Data sources and collection rules

Official source hierarchy

Electoral tribunal filing (highest authority)

Official campaign website

Official verified social media (Instagram, Facebook, X, TikTok, YouTube)

Official press releases from the candidate's registered press page

What we collect

Concrete commitments: "we will", "we commit to", "our goal is"

Quantified targets: "reduce X by Y%", "build N schools by year Z"

Policy plans stated as forward-looking actions

What we never collect

Attacks on other candidates

General values statements without concrete commitment

Descriptions of opponents' positions

Quotes about past events (not forward-looking)

Anything from unofficial or fan accounts

Hardcoded collection constraints

Never submit any form, login, or click any interactive element

Never use API keys provided by candidates or parties

Never accept data submissions from political actors

Apply identical collection frequency to all candidates in the same election

If a source is inaccessible, record as unavailable — never substitute another source

The 9 categories

Applied identically to every candidate in every country. No exceptions.

#

Category

Scope

1

Economy & Fiscal Policy

Taxes, employment, industry, trade, fiscal targets

2

Education & Culture

Schools, universities, literacy, arts, cultural policy

3

Health & Sanitation

Healthcare access, hospitals, public health programs

4

Public Safety & Justice

Police, prisons, judicial reform, crime reduction

5

Environment & Climate

Conservation, emissions, energy transition

6

Social Assistance

Welfare, housing, food security, poverty reduction

7

Human Rights

Civil rights, gender equality, racial equity

8

Infrastructure & Transport

Roads, rail, ports, digital infrastructure

9

Governance & Reform

Electoral reform, anti-corruption, public administration

Candidate page standard

Every candidate has the same structure — no exceptions, no visual hierarchy between them:

Header:   Full legal name · Party · Election · Official sources · Last collected
Body:     One section per category
          → Promise text (verbatim, original language)
          → Translation
          → Source URL + Archive link + Collection date
          → 🔒 Authenticity Badge (SHA-256 hash, click to verify)
Footer:   SHA-256 of full record set · Link to audit log


If a category has no data: "No promise found in official sources as of [date]" — never hidden.

Cryptographic integrity

Every promise carries a SHA-256 content hash computed at collection time.

The Authenticity Badge (🔒 AUTÊNTICO) appears next to each promise in the frontend. Clicking it shows:

Full SHA-256 hash

Collection timestamp

Original source URL

Wayback Machine archive link

How to independently verify

This means any journalist, researcher, or citizen can verify: "This text is exactly what was on the official page on this date."

The audit_log table is append-only (enforced by database rules). No record can be deleted or modified after insertion. Every change generates a new record. The history is permanent.

Tech stack

Layer

Technology

Why

Agents

Python 3.11 + Playwright

Reliable headless browser, excellent PDF support

AI extraction

Claude API (claude-sonnet-4-6)

Best instruction following, structured output

Scheduling

GitHub Actions (cron)

Free, transparent — every run is a public log

Database

Supabase (PostgreSQL 15 + pgvector)

Managed, vector search, Row Level Security

Archive

AWS S3 + Wayback Machine API

Redundant, permanent

Frontend

Next.js 15 + TypeScript + next-intl

App Router, i18n (6 languages), Vercel deployment

Deployment

Vercel (frontend)

Global CDN, auto-deploy on push

Running locally

Prerequisites

Python 3.11+

Node.js 20+

Supabase account (free tier sufficient)

Anthropic API key (platform.anthropic.com)

Setup

git clone [https://github.com/worldcontrast/promises.git](https://github.com/worldcontrast/promises.git)
cd promises

# Agents
pip install -r agents/requirements.txt
playwright install chromium

# Copy and fill environment variables
cp .env.example .env
# ANTHROPIC_API_KEY=...
# SUPABASE_URL=...
# SUPABASE_KEY=...

# Run database schema (Supabase SQL Editor)
# backend/db/schema.sql → run once
# backend/db/audit_triggers.sql → run once

# Test the agent without writing to DB
python agents/scheduler.py --country BR --dry-run

# Frontend
cd frontend
npm install
npm run dev


Deploying to production

Frontend → Connect repo to Vercel. Auto-deploys on push to main.

Agents → GitHub Actions runs agent-run.yml every 5 days via cron. Secrets stored in GitHub repository secrets (ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_KEY).

Database → Supabase is fully managed. No server to maintain.

Total infrastructure cost at launch: $0–40/month.

API costs and sustainability

The agent uses Claude Sonnet with Prompt Caching (90% discount on re-reads) and the Batch API (50% off async processing).

Scale

Candidates

Est. cost/month

MVP (1 country, Brazil 2026)

10

~$3–8

Regional (10 countries)

100

~$25–60

Global (50 countries)

500

~$120–280

You do not need Claude Pro or Max for this. Use the API directly at platform.anthropic.com — pay per token, no monthly seat fee.

The Tripartite Architecture: Code, Data, and Live API

World Contrast operates under an Open Core model to guarantee absolute transparency while maintaining financial sustainability for our real-time infrastructure.

1. The Engine (Open Source)

The system architecture, the Next.js frontend, and the POCVA-01 AI extraction protocol are 100% Open Source. A digital public ledger cannot operate in a black box. Any citizen or engineer can audit our code to prove the absence of ideological bias.

License: AGPL v3.0

2. The Historical Record (Open Data)

The extracted political promises, cryptographic hashes, and historical data validated by our machine are Public Domain. Journalists, researchers, and NGOs are encouraged to download our database dumps for their investigations.

License: Creative Commons CC BY 4.0 (Requires attribution to World Contrast)

3. The Live Infrastructure (Enterprise API)

While the code is open and historical data is free, computational power and low-latency have a cost. Access to our Live API and real-time Webhooks — used by global News Agencies and Sovereign Risk Funds to receive cryptographic validations milliseconds after a speech — is strictly governed by commercial B2B agreements. Enterprise revenue subsidizes democratic access.

License: Closed/Commercial. See TERMS_API.md

Tier

For

Access Level

Cost

Public

Citizens, journalists

Static DB dumps & Web search

Free

Institutional

Universities, NGOs

Rate-limited API

Free (via application)

Enterprise

News agencies, Funds

Real-time Webhooks, Unlimited

Paid

Contributing

We welcome contributions. See CONTRIBUTING.md for full guidelines.

High-value contributions

Country data files — add a new country's official sources in /data/countries/

Language support — add translation for a new language

Source verification — verify and update official source URLs

Agent improvements — better PDF parsing, social media extraction

Frontend — accessibility, performance, new visualizations

Contributor rules

Strict political neutrality in all contributions

No current or recent (< 2 years) employee of any political party, campaign, or electoral body

Data contributions require two independent verifications

No single contributor may modify the extraction prompt AND validation layer in the same PR

Pull request process

fork → branch (feature/country-mexico or fix/pdf-parser) → PR → 2 approvals → merge


Code of conduct for contributors

All contributors agree to:

Maintain strict political neutrality in all contributions

Never introduce code or data that favors any candidate, party, or ideology

Report suspected bias immediately via GitHub Issues

Never accept compensation from political actors for contributions

Violations result in immediate removal and public disclosure.

Manifesto

See MANIFESTO.md for the full founding document.

Core declaration: We provide the tools; you provide the judgment. Compare. Contrast. Decide.

License

Code: AGPL v3.0 — free to inspect, modify, and distribute (requires derivatives to remain open-source).

Historical Data: CC BY 4.0 — free to share and adapt with attribution.

Brand: The name "World Contrast", the logo, and worldcontrast.org are not covered by the AGPL License. Forks must not use the name, domain, or imply affiliation with the official project.

<div align="center">

World Contrast is a non-profit initiative. We carry no advertising. We accept no political funding. We have no commercial agenda.

Compare. Contrast. Decide.

worldcontrast.org

</div>
