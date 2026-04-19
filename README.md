<div align="center">

# World Contrast 🌍

### The world is clearer in contrast.

**An open, neutral, and cryptographically auditable infrastructure  
for comparing political campaign promises — in any country, in any language.**

[worldcontrast.org](https://worldcontrast.org) · [API Terms](./TERMS_API.md) · [License](./LICENSE) · [Manifesto](./MANIFESTO.md)

---

*""We are not the truth. We are the record."*

</div>

---

## What World Contrast is — and what it is not

World Contrast is **not** a media outlet.  
It is **not** an opinion platform.  
It is **not** a fact-checker.

It is a **public record** — a mirror that reflects what candidates officially promised, without editorial judgment, without bias, and without the ability to be altered after the fact.

We copy only from official sources. We never contact candidates or parties. We never editorialize. We only compare.

> **The engine is open. The historical record is public. The live infrastructure is governed.**  
> **Code:** AGPL v3.0 — free to inspect and fork, required to stay open.  
> **Data:** CC BY 4.0 — public domain for journalists and citizens.  
> **Live API:** Governed, auditable, and commercially maintained — see [TERMS_API.md](./TERMS_API.md).

---

## Table of Contents

- [Architecture overview](#architecture-overview)
- [Repository structure](#repository-structure)
- [How the agent system works](#how-the-agent-system-works)
- [POCVA-01 Protocol](#pocva-01-protocol)
- [Data sources and collection rules](#data-sources-and-collection-rules)
- [The 9 categories](#the-9-categories)
- [Candidate page standard](#candidate-page-standard)
- [Cryptographic integrity](#cryptographic-integrity)
- [Tech stack](#tech-stack)
- [Running locally](#running-locally)
- [The Tripartite Architecture: Code, Data, and Live API](#the-tripartite-architecture-code-data-and-live-api)
- [Contributing](#contributing)
- [Code of conduct for contributors](#code-of-conduct-for-contributors)
- [Manifesto](#manifesto)
- [License](#license)

---

## Architecture overview

```text
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
```

---

## Repository structure

```text
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
```

---

## How the agent system works

### Step 1 — Source registry

Every country has a JSON file in `/data/countries/` listing official sources for each candidate. Only URLs in this registry are ever crawled. Adding a source requires a pull request with independent verification.

### Step 2 — Collection (every 5 days via GitHub Actions)

The scheduler triggers the crawler for all active campaigns. Per candidate, per source:

1. Visits the URL using Playwright (headless — no login, no forms, no clicks)
2. Saves full page archive to S3 + submits to Wayback Machine
3. Computes SHA-256 hash of the archived content
4. Records the crawl in `crawled_pages` table with full provenance
5. Queues raw content for extraction

### Step 3 — Extraction under POCVA-01

The extractor sends content to the Claude API under the POCVA-01 system prompt.

### Step 4 — Validation + rejection logging

Every extracted promise passes through:

- **Promise Equation check:** must satisfy `[Actor] + [Future Action Verb] + [Measurable Target]`
- **Sentiment Guard:** rejects attacks, comparisons, or editorial framing
- **Duplicate Detector:** vector similarity check against existing records
- **Confidence threshold:** records below 0.75 are flagged for quality review

Every rejection — whether rhetorical, an attack, or below threshold — is logged in the `extraction_rejections` table with the original text and exact reason. This table is public.

### Step 5 — Storage with cryptographic provenance

Every saved promise includes the `source_url`, `archive_url`, `collected_at`, `content_hash` (SHA-256), and `agent_version`.

---

## POCVA-01 Protocol

**Autonomous Collection and Validation Operational Protocol — version 01**

This is the institutional and legal framework that governs every extraction decision. It is not configurable. It is not overridable.

### Rule 1 — Closed Border

The agent is strictly prohibited from using open search (Google, Bing, etc.) to find promises. It may only read URLs registered in `source_registry` with `active = true`.

### Rule 2 — The Promise Equation

A statement is only a promise if it satisfies:

```
[P] Promise = [A] Actor + [V] Future Action Verb + [M] Measurable Target
```

| Example | Result | Reason |
|---|---|---|
| "Vamos melhorar a saúde do nosso povo." | ❌ Rejected | No measurable target — rhetorical |
| "Vamos construir 500 hospitais públicos até 2028." | ✅ Accepted | Actor + Action + Metric |
| "O candidato X destruiu a economia." | ❌ Rejected | Attack on opponent — auto-reject |

### Rule 3 — Computational Symmetry

The scheduler processes candidates in symmetric batches. The same volume limit applies to every candidate in the same election.

### Rule 4 — Mandatory Rejection Logging

Every piece of content the agent reads and does not save as a promise must be logged in `extraction_rejections`.

### Rule 5 — Semantic Isolation System Prompt

The Claude API system prompt instructs the model to operate as a forensic data extractor, not a political analyst.

---

## Data sources and collection rules

### Official source hierarchy

1. Electoral tribunal filing (highest authority)
2. Official campaign website
3. Official verified social media (Instagram, Facebook, X, TikTok, YouTube)
4. Official press releases from the candidate's registered press page

### What we collect

Concrete commitments, quantified targets, and policy plans stated as forward-looking actions.

### What we never collect

Attacks on other candidates, general values statements, descriptions of opponents' positions, quotes about past events, or anything from unofficial/fan accounts.

---

## The 9 categories

Applied identically to every candidate in every country. No exceptions.

| # | Category | Scope |
|---|---|---|
| 1 | Economy & Fiscal Policy | Taxes, employment, industry, trade, fiscal targets |
| 2 | Education & Culture | Schools, universities, literacy, arts, cultural policy |
| 3 | Health & Sanitation | Healthcare access, hospitals, public health programs |
| 4 | Public Safety & Justice | Police, prisons, judicial reform, crime reduction |
| 5 | Environment & Climate | Conservation, emissions, energy transition |
| 6 | Social Assistance | Welfare, housing, food security, poverty reduction |
| 7 | Human Rights | Civil rights, gender equality, racial equity |
| 8 | Infrastructure & Transport | Roads, rail, ports, digital infrastructure |
| 9 | Governance & Reform | Electoral reform, anti-corruption, public administration |

---

## Candidate page standard

Every candidate has the same structure — no exceptions, no visual hierarchy between them:

```text
Header:   Full legal name · Party · Election · Official sources · Last collected
Body:     One section per category
          → Promise text (verbatim, original language)
          → Translation
          → Source URL + Archive link + Collection date
          → 🔒 Authenticity Badge (SHA-256 hash, click to verify)
Footer:   SHA-256 of full record set · Link to audit log
```

If a category has no data: *"No promise found in official sources as of [date]"* — never hidden.

---

## Cryptographic integrity

Every promise carries a SHA-256 content hash computed at collection time.

The Authenticity Badge (🔒 AUTÊNTICO) appears next to each promise in the frontend. Clicking it shows:

- Full SHA-256 hash
- Collection timestamp
- Original source URL
- Wayback Machine archive link
- How to independently verify

The `audit_log` table is append-only (enforced by database rules). No record can be deleted or modified after insertion. Every change generates a new record. The history is permanent.

---

## The Tripartite Architecture: Code, Data, and Live API

World Contrast operates under an **Open Core** model to guarantee absolute transparency while maintaining financial sustainability for our real-time infrastructure.

### 1. The Engine (Open Source)

The system architecture, the Next.js frontend, and the POCVA-01 AI extraction protocol are 100% Open Source. A digital public ledger cannot operate in a black box. Any citizen or engineer can audit our code to prove the absence of ideological bias.

**License:** AGPL v3.0

### 2. The Historical Record (Open Data)

The extracted political promises, cryptographic hashes, and historical data validated by our machine are Public Domain. Journalists, researchers, and NGOs are encouraged to download our database dumps for their investigations.

**License:** Creative Commons CC BY 4.0 (Requires attribution to World Contrast)

### 3. The Live Infrastructure (Enterprise API)

While the code is open and historical data is free, computational power and low-latency have a cost. Access to our Live API and real-time Webhooks — used by global News Agencies and Sovereign Risk Funds to receive cryptographic validations milliseconds after a speech — is strictly governed by commercial B2B agreements. Enterprise revenue subsidizes democratic access.

**License:** Closed/Commercial. See [TERMS_API.md](./TERMS_API.md)

| Tier | For | Access Level | Cost |
|---|---|---|---|
| Public | Citizens, journalists | Static DB dumps & Web search | Free |
| Institutional | Universities, NGOs | Rate-limited API | Free (via application) |
| Enterprise | News agencies, Funds | Real-time Webhooks, Unlimited | Paid |

---

## Contributing

We welcome contributions. See `CONTRIBUTING.md` for full guidelines.

### High-value contributions

- **Country data files** — add a new country's official sources in `/data/countries/`
- **Language support** — add translation for a new language
- **Source verification** — verify and update official source URLs
- **Agent improvements** — better PDF parsing, social media extraction
- **Frontend** — accessibility, performance, new visualizations

### Contributor rules

1. Strict political neutrality in all contributions
2. No current or recent (< 2 years) employee of any political party, campaign, or electoral body
3. Data contributions require two independent verifications
4. No single contributor may modify the extraction prompt AND validation layer in the same PR

### Pull request process

```text
fork → branch (feature/country-mexico or fix/pdf-parser) → PR → 2 approvals → merge
```

---

## Code of conduct for contributors

All contributors agree to:

- Maintain strict political neutrality in all contributions
- Never introduce code or data that favors any candidate, party, or ideology
- Report suspected bias immediately via GitHub Issues
- Never accept compensation from political actors for contributions

Violations result in immediate removal and public disclosure.

---

## Manifesto

See [MANIFESTO.md](./MANIFESTO.md) for the full founding document.

**Core declaration:** We provide the tools; you provide the judgment. Compare. Contrast. Decide.

---

## License

- **Code:** AGPL v3.0 — free to inspect, modify, and distribute (requires derivatives to remain open-source).
- **Historical Data:** CC BY 4.0 — free to share and adapt with attribution.
- **Brand:** The name "World Contrast", the logo, and `worldcontrast.org` are not covered by the AGPL License. Forks must not use the name, domain, or imply affiliation with the official project.

---

<div align="center">

World Contrast is a non-profit initiative.  
We carry no advertising. We accept no political funding. We have no commercial agenda.

**Compare. Contrast. Decide.**

[worldcontrast.org](https://worldcontrast.org)

</div>
