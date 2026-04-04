# World Contrast 🌍

**Comparing political campaigns — because the world is clearer when you see the difference.**

> "The truth emerges from contrast — not from repetition."

World Contrast is a non-profit, open-source platform that collects, organizes, and displays political campaign promises side-by-side. We copy only from official sources. We never contact candidates or parties. We never editorialize. We only compare.

---

## Table of Contents

- [What this project does](#what-this-project-does)
- [Architecture overview](#architecture-overview)
- [Repository structure](#repository-structure)
- [How the agent system works](#how-the-agent-system-works)
- [Data sources and collection rules](#data-sources-and-collection-rules)
- [The 9 categories](#the-9-categories)
- [Candidate page standard](#candidate-page-standard)
- [Tech stack](#tech-stack)
- [Running locally](#running-locally)
- [Deploying to production](#deploying-to-production)
- [API costs and sustainability](#api-costs-and-sustainability)
- [Contributing](#contributing)
- [Code of conduct for contributors](#code-of-conduct-for-contributors)
- [Manifesto](#manifesto)
- [License](#license)

---

## What this project does

1. **Collects** campaign promises from official candidate sources (electoral tribunal filings, official websites, official social media profiles) using automated agents — every 5 days during active campaigns.
2. **Extracts** promises using an AI pipeline that reads raw content and returns structured JSON — only factual commitments, never attacks or opinions.
3. **Classifies** each promise into one of 9 standard categories applied identically to every candidate in every country.
4. **Stores** every record with its source URL, archive URL, collection timestamp, and SHA-256 hash — making falsification impossible and verification instant.
5. **Displays** candidates side-by-side in a clean, neutral interface — identical layout for all, no visual hierarchy between candidates.

---

## Architecture overview

```
PUBLIC SOURCES (read-only)
Electoral tribunals · Official sites · Official social media · Official video channels
        ↓
COLLECTION AGENTS (Python · Playwright · runs every 5 days)
Web Crawler · PDF Parser · Social API Agent · Archive Agent
        ↓
EXTRACTION PIPELINE (Claude API · claude-sonnet-4-6)
Promise Extractor → Category Classifier → Translation Agent
        ↓
VALIDATION LAYER
Duplicate Detector · Sentiment Guard · Confidence Scorer · Provenance Ledger
        ↓
DATABASE (Supabase PostgreSQL · pgvector · S3 archive)
        ↓
PUBLIC INTERFACE
Next.js frontend (Vercel) · REST API · Audit Portal
```

---

## Repository structure

```
worldcontrast/
├── README.md                    ← this file
├── MANIFESTO.md                 ← the founding document
├── CONTRIBUTING.md              ← how to contribute
├── CODE_OF_CONDUCT.md           ← contributor rules (strict neutrality)
├── DATA_STANDARDS.md            ← rules for data collection and quality
│
├── agents/                      ← the collection and extraction system
│   ├── crawler/                 ← web crawler agent
│   │   ├── crawler.py
│   │   ├── pdf_parser.py
│   │   └── social_api.py
│   ├── extraction/              ← AI-powered promise extraction
│   │   ├── extractor.py         ← sends content to Claude API
│   │   ├── classifier.py        ← categorizes promises
│   │   ├── translator.py        ← translates to 6 UN languages
│   │   └── prompts/
│   │       ├── extraction_prompt.txt    ← THE critical prompt
│   │       └── classification_prompt.txt
│   ├── validation/              ← quality control
│   │   ├── deduplicator.py
│   │   ├── sentiment_guard.py
│   │   └── provenance.py
│   └── scheduler.py             ← runs the full pipeline every 5 days
│
├── backend/                     ← REST API
│   ├── api/
│   │   ├── candidates.py
│   │   ├── promises.py
│   │   ├── countries.py
│   │   └── audit.py
│   ├── db/
│   │   ├── schema.sql           ← full database schema
│   │   └── migrations/
│   └── main.py                  ← FastAPI entry point
│
├── frontend/                    ← Next.js web app
│   ├── app/
│   │   ├── page.tsx             ← landing page
│   │   ├── compare/[a]/[b]/     ← comparison screen
│   │   ├── candidate/[id]/      ← individual candidate page
│   │   ├── country/[code]/      ← country overview
│   │   └── audit/               ← public audit portal
│   ├── components/
│   └── public/
│
├── data/                        ← source registry (open data)
│   ├── countries/
│   │   ├── brazil.json          ← source URLs for Brazil
│   │   ├── usa.json
│   │   └── ...
│   └── tribunals.json           ← electoral tribunal URLs per country
│
├── docs/                        ← extended documentation
│   ├── AGENT_SYSTEM.md
│   ├── DATA_SOURCES.md
│   ├── API_REFERENCE.md
│   └── DEPLOYMENT.md
│
└── infrastructure/              ← deployment configuration
    ├── docker-compose.yml
    ├── Dockerfile.agents
    └── .github/
        └── workflows/
            ├── agent-run.yml    ← scheduled agent execution (every 5 days)
            ├── tests.yml
            └── deploy.yml
```

---

## How the agent system works

### Step 1 — Source registry

Every country has a JSON file in `/data/countries/` that lists the official sources for each candidate:

```json
{
  "country": "Brazil",
  "election": "Presidential 2026",
  "tribunal": "https://divulgacandcontas.tse.jus.br",
  "candidates": [
    {
      "id": "candidate-001",
      "name": "João da Silva",
      "party": "PPP",
      "official_site": "https://joaodasilva.com.br",
      "electoral_filing": "https://divulgacandcontas.tse.jus.br/...",
      "social": {
        "instagram": "https://instagram.com/joaodasilva.oficial",
        "facebook": "https://facebook.com/joaodasilvaoficial",
        "youtube": "https://youtube.com/@joaodasilva",
        "tiktok": "https://tiktok.com/@joaodasilva"
      }
    }
  ]
}
```

Only URLs listed in this registry are ever crawled. Adding a candidate requires a pull request with source verification.

### Step 2 — Collection (every 5 days)

The scheduler triggers the crawler for all active campaigns. The crawler:

1. Visits each source URL using Playwright (headless browser — no login, no forms, no interaction)
2. Downloads full HTML + visible text
3. Downloads any linked PDFs (manifestos, program documents)
4. Saves a full-page archive to S3 + submits to Wayback Machine
5. Computes SHA-256 hash of the archived content
6. Queues the raw content for extraction

### Step 3 — Extraction (Claude API)

The extractor sends batches of raw content to the Claude API using the extraction prompt (see `/agents/extraction/prompts/extraction_prompt.txt`). The API returns structured JSON:

```json
{
  "promises": [
    {
      "category": "economy",
      "text_original": "Vamos isentar quem ganha até cinco mil reais.",
      "text_en": "We will exempt from income tax those earning up to five thousand reais.",
      "verbatim": true,
      "source_url": "https://joaodasilva.com.br/propostas",
      "source_type": "official_site",
      "confidence": 0.97,
      "ambiguous": false
    }
  ]
}
```

### Step 4 — Validation

Every extracted promise passes through:
- **Sentiment Guard**: rejects any text containing personal attacks, insults, comparative statements about other candidates, or editorial framing
- **Duplicate Detector**: vector similarity check against existing database records
- **Confidence threshold**: records below 0.75 confidence are flagged for data quality review (not content review)

### Step 5 — Storage with provenance

Every record stored includes:
- `source_url` — the exact URL visited
- `archive_url` — the Wayback Machine URL of the archived page
- `collected_at` — ISO 8601 timestamp
- `content_hash` — SHA-256 of the archived page
- `agent_version` — version of the agent that collected it

This makes every record independently verifiable. Anyone can check the archive URL and confirm the promise was actually there.

---

## Data sources and collection rules

### Official source hierarchy (priority order)

1. **Electoral tribunal filing** — the candidate's official registered program (highest authority)
2. **Official campaign website** — candidate's registered domain
3. **Official social media** — verified/official accounts only (Instagram, Facebook, X, TikTok, YouTube)
4. **Official press releases** — from the candidate's official press team page only

### What we collect

- Concrete commitments ("we will", "we commit to", "our goal is")
- Quantified targets ("reduce X by Y%", "build N schools")
- Policy positions stated as plans ("we will implement", "we will create")

### What we never collect

- Attacks on other candidates
- General values statements without concrete commitment ("we believe in freedom")
- Descriptions of opponents' positions
- Quotes about past events that are not forward-looking promises
- Anything from unofficial accounts or fan pages

### Collection rules (hardcoded, not configurable)

- Never submit any form, login, or click any interactive element
- Never use API keys provided by candidates or parties
- Never accept data submissions from political actors
- Apply identical collection frequency to all candidates in the same election
- If a source is inaccessible, record as "unavailable" — never substitute another source
- All collection is passive read-only

---

## The 9 categories

Every promise is classified into exactly one of these categories. Applied identically to every candidate in every country:

| # | Category | Scope |
|---|---|---|
| 1 | Economy & Fiscal Policy | Taxes, employment, industry, trade, fiscal targets |
| 2 | Education & Culture | Schools, universities, literacy, arts, cultural policy |
| 3 | Health & Sanitation | Healthcare access, hospitals, public health programs |
| 4 | Public Safety & Justice | Police, prisons, judicial reform, crime reduction |
| 5 | Environment & Climate | Conservation, emissions, energy transition, natural resources |
| 6 | Social Assistance | Welfare programs, housing, food security, poverty reduction |
| 7 | Human Rights | Civil rights, gender equality, racial equity, minority protections |
| 8 | Infrastructure & Transport | Roads, rail, ports, urban mobility, digital infrastructure |
| 9 | Governance & Reform | Electoral reform, anti-corruption, public administration |

Multi-category promises receive a primary and secondary classification.

---

## Candidate page standard

Every candidate on World Contrast has a page with exactly the same structure — no exceptions:

```
/candidate/[id]

Header:
  - Full legal name (from electoral filing)
  - Party name (from electoral filing)
  - Election and country
  - Official sources listed (links only, no endorsement)
  - Last data collection timestamp

Body (one section per category):
  - Category name
  - Promises listed verbatim in original language
  - English translation
  - Source for each promise (URL + archive link + date)
  - Status: Stated / Partial (ambiguous) / No data found

Footer:
  - SHA-256 hash of the data record set
  - Link to full audit log for this candidate
```

**Symmetric coverage rule**: If a category has no data for a candidate, it displays "No promise found in official sources as of [date]" — never hidden, never omitted.

---

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Agents | Python 3.12 + Playwright | Reliable headless browser, excellent PDF support |
| AI extraction | Claude API (claude-sonnet-4-6) | Best-in-class instruction following, structured output |
| Scheduling | GitHub Actions (cron) | Free, transparent, auditable — every run is a public log |
| Backend API | FastAPI (Python) | Fast, async, automatic OpenAPI docs |
| Database | Supabase (PostgreSQL + pgvector) | Managed, free tier generous, built-in vector search |
| Archive store | AWS S3 + Wayback Machine API | Redundant, permanent |
| Frontend | Next.js 15 + TypeScript | App Router, i18n built-in, excellent performance |
| Deployment | Vercel (frontend) + Railway (backend) | Both have generous free tiers, global CDN |
| CDN | Cloudflare | Free, global, protects against scraping of our own site |

---

## Running locally

### Prerequisites

- Python 3.12+
- Node.js 20+
- A Supabase account (free)
- An Anthropic API key (platform.anthropic.com)

### Setup

```bash
# Clone the repository
git clone https://github.com/worldcontrast/worldcontrast.git
cd worldcontrast

# Backend + agents
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_KEY in .env

# Run the database schema
supabase db push

# Run one agent cycle manually (for testing)
cd ../agents
python scheduler.py --country brazil --dry-run

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_API_URL in .env.local
npm run dev
```

---

## Deploying to production

See `/docs/DEPLOYMENT.md` for full instructions. Summary:

1. **Backend**: Deploy to Railway with one click. Set environment variables in Railway dashboard.
2. **Frontend**: Connect GitHub repo to Vercel. Auto-deploys on every push to `main`.
3. **Agents**: GitHub Actions runs the scheduler every 5 days via cron (`.github/workflows/agent-run.yml`). Agent secrets (API keys) stored in GitHub repository secrets.
4. **Database**: Supabase is already hosted. Connect via environment variables.

Total infrastructure cost at launch: **$0–40/month** (Supabase free tier, Vercel free tier, Railway hobby plan, Anthropic API pay-per-use).

---

## API costs and sustainability

### Anthropic API cost estimate

The World Contrast agent uses **Claude Sonnet** with **Prompt Caching** and the **Batch API** (50% discount for async processing):

| Scenario | Candidates | Sources/candidate | Collections/month | Est. API cost/month |
|---|---|---|---|---|
| MVP (1 country) | 10 | 5 | 6 (every 5 days) | ~$3–8 |
| Regional (10 countries) | 100 | 5 | 6 | ~$25–60 |
| Global (50 countries) | 500 | 5 | 6 | ~$120–280 |

Why so low? Because:
- Most pages are cached after first read (90% discount on re-reads)
- The Batch API gives 50% off all extraction calls
- Each page only needs to be fully re-processed when its content changes

### You do NOT need Claude Pro or Max for this project

Those plans are for personal assistant use via chat. The agent system uses the **Anthropic API directly** — pay per token, no monthly seat fee. Create an account at **platform.anthropic.com**, add a credit card, and start with $20 in credits.

---

## Contributing

We welcome contributions. See `CONTRIBUTING.md` for full guidelines.

### High-value contributions

- **Country data files**: Add a new country's electoral sources in `/data/countries/`
- **Language support**: Add translation support for a new language
- **Source verification**: Verify and update official source URLs
- **Agent improvements**: Better PDF parsing, better social media extraction
- **Frontend**: Accessibility, performance, new visualizations

### Rules for all contributors

1. All code contributions must maintain strict political neutrality
2. No contributor may be a current or recent (< 2 years) employee, contractor, or volunteer of any political party, campaign, or government electoral body
3. Data contributions (adding candidate sources) require two independent verifications
4. No single contributor may modify both the extraction prompt AND the validation layer in the same PR

### Pull request process

1. Fork the repository
2. Create a branch: `feature/country-mexico` or `fix/pdf-parser-encoding`
3. Make your changes
4. Run the test suite: `pytest agents/tests/ && npm test`
5. Open a PR with a clear description of what changed and why
6. Two maintainer approvals required for merges to `main`

---

## Code of conduct for contributors

All contributors agree to:

- Maintain strict political neutrality in all contributions
- Never introduce code or data that favors or disadvantages any candidate, party, or political ideology
- Report any suspected bias in existing code or data immediately via GitHub Issues
- Never accept compensation from political actors for contributions to this project

Violations result in immediate removal and public disclosure.

---

## Manifesto

See `MANIFESTO.md` for the full founding document.

**Core declaration**: We provide the tools; you provide the judgment. Compare. Contrast. Decide.

*Because the world is clearer when you see the difference.*

---

## License

**Code**: MIT License — free to use, modify, and distribute.

**Data**: Creative Commons CC0 1.0 (Public Domain) — all collected promise data is free for any use, including commercial research.

**Manifesto**: All Rights Reserved — the founding document may be quoted but not modified.

---

*World Contrast is a non-profit initiative. We carry no advertising, accept no political funding, and have no commercial agenda.*
