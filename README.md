<div align="center">

# World Contrast 🌍

### The world is clearer in contrast.

**An open, neutral, and cryptographically auditable infrastructure  
for comparing political campaign promises — in any country, in any language.**

[worldcontrast.org](https://worldcontrast.org) · [API Terms](./TERMS_API.md) · [License](./LICENSE) · [Manifesto](./MANIFESTO.md)

---

*"The truth emerges from contrast — not from repetition."*

</div>

---

## What World Contrast is — and what it is not

World Contrast is **not** a media outlet.  
It is **not** an opinion platform.  
It is **not** a fact-checker.

It is a **public record** — just reflects what candidates officially promised, without editorial judgment, without bias, and without the ability to be altered after the fact.

We copy only from official sources. We never contact candidates or parties. We never editorialize. We only compare.

> **The engine is open. The historical record is public. The live infrastructure is governed.**
> **Code:** AGPL v3.0 — free to inspect and fork, required to stay open.  
> **Data:** CC BY 4.0 — public domain for journalists and citizens.  
> **Live API:** Governed, auditable, and commercially maintained — see [TERMS_API.md](./TERMS_API.md).

---

## Architecture overview

Este trecho abaixo aparece como "código" para facilitar a leitura técnica da estrutura:

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
The Tripartite Architecture: Code, Data, and Live APIWorld Contrast operates under an Open Core model to guarantee absolute transparency while maintaining financial sustainability for our real-time infrastructure.1. The Engine (Open Source)The system architecture, the Next.js frontend, and the POCVA-01 AI extraction protocol are 100% Open Source. A digital public ledger cannot operate in a black box. Any citizen or engineer can audit our code to prove the absence of ideological bias.License: AGPL v3.02. The Historical Record (Open Data)The extracted political promises, cryptographic hashes, and historical data validated by our machine are Public Domain. Journalists, researchers, and NGOs are encouraged to download our database dumps for their investigations.License: Creative Commons CC BY 4.0 (Requires attribution to World Contrast)3. The Live Infrastructure (Enterprise API)While the code is open and historical data is free, computational power and low-latency have a cost. Access to our Live API and real-time Webhooks — used by global News Agencies and Sovereign Risk Funds to receive cryptographic validations milliseconds after a speech — is strictly governed by commercial B2B agreements. Enterprise revenue subsidizes democratic access.License: Closed/Commercial. See TERMS_API.mdTierForAccess LevelCostPublicCitizens, journalistsStatic DB dumps & Web searchFreeInstitutionalUniversities, NGOsRate-limited APIFree (via application)EnterpriseNews agencies, FundsReal-time Webhooks, UnlimitedPaidRepository structureAqui está a árvore de diretórios que aparece formatada como código:Plaintextworldcontrast/
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
│   ├── extraction/
│   │   ├── extractor.py         ← sends content to Claude API (POCVA-01)
│   │   ├── classifier.py        ← categorizes promises into 9 categories
│   │   └── prompts/
│   │       ├── extraction_prompt.txt     ← THE critical system prompt
│
├── backend/
│   ├── api/
│   ├── db/
│   │   ├── schema.sql           ← full database schema (PostgreSQL 15+)
│   │   └── audit_triggers.sql   ← append-only audit log + RLS policies
│
├── frontend/
│   └── src/
│       ├── app/
│       └── components/
│           └── AuthenticityBadge.tsx     ← 🔒 SHA-256 seal per promise
POCVA-01 ProtocolAutonomous Collection and Validation Operational Protocol — version 01Rule 1 — Closed BorderThe agent is strictly prohibited from using open search. It may only read URLs registered in source_registry.Rule 2 — The Promise EquationA statement is only a promise if it satisfies: [P] Promise = [A] Actor + [V] Future Action Verb + [M] Measurable Target.Cryptographic integrityEvery promise carries a SHA-256 content hash computed at collection time. The Authenticity Badge (🔒 AUTÊNTICO) aparece ao lado de cada registro.O audit_log no banco de dados é append-only. Nenhum registro pode ser deletado ou modificado após a inserção. A história é permanente.LicenseCode: AGPL v3.0 — free to inspect, modify, and distribute (requires derivatives to remain open-source).Historical Data: CC BY 4.0 — free to share and adapt with attribution.Brand: The name "World Contrast", the logo, and worldcontrast.org are not covered by the AGPL License.<div align="center">Compare. Contrast. Decide.worldcontrast.org</div>
