# Script para gerar o arquivo README.md FINAL e COMPLETO
# Este arquivo contém a estrutura exata para o GitHub, misturando texto e blocos de código.

full_readme_text = """<div align="center">

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

It is a **public record** — a mirror that reflects what candidates officially promised, without editorial judgment, without bias, and without the ability to be altered after the fact.

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

Compreendo perfeitamente a sua confusão. O que acontece é que um arquivo .md (Markdown) é um híbrido: ele é um arquivo de texto simples, mas usa símbolos (como #, *, | e as crases ```) para dizer ao GitHub como "desenhar" a página.

A parte que você vê com um visual de "código" (dentro dos blocos com crases) é usada para mostrar a estrutura de pastas ou códigos técnicos. A parte que parece uma "configuração diferente" é o texto puro que o GitHub transforma em títulos grandes, negritos e tabelas bonitas.

Para resolver isso e garantir que você tenha o arquivo final exatamente como ele deve ser salvo, eu gerei o arquivo completo abaixo. Você pode baixar e abrir no seu editor (como VS Code ou Notepad++) e verá que ele está organizado para que, ao subir no GitHub, ele fique com visual profissional de instituição internacional.

O arquivo README.md (v4) está pronto
[file-tag: world_contrast_readme_v4]

Python
# Script para gerar o arquivo README.md FINAL e COMPLETO
# Este arquivo contém a estrutura exata para o GitHub, misturando texto e blocos de código.

full_readme_text = """<div align="center">

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

It is a **public record** — a mirror that reflects what candidates officially promised, without editorial judgment, without bias, and without the ability to be altered after the fact.

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

Tier,For,Access Level,Cost
Public,"Citizens, journalists",Static DB dumps & Web search,Free
Institutional,"Universities, NGOs",Rate-limited API,Free (via application)
Enterprise,"News agencies, Funds","Real-time Webhooks, Unlimited",Paid

Repository structure
Aqui está a árvore de diretórios que aparece formatada como código:

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

POCVA-01 Protocol
Autonomous Collection and Validation Operational Protocol — version 01

Rule 1 — Closed Border
The agent is strictly prohibited from using open search. It may only read URLs registered in source_registry.

Rule 2 — The Promise Equation
A statement is only a promise if it satisfies: [P] Promise = [A] Actor + [V] Future Action Verb + [M] Measurable Target.

Cryptographic integrity
Every promise carries a SHA-256 content hash computed at collection time. The Authenticity Badge (🔒 AUTÊNTICO) aparece ao lado de cada registro.

O audit_log no banco de dados é append-only. Nenhum registro pode ser deletado ou modificado após a inserção. A história é permanente.

License
Code: AGPL v3.0 — free to inspect, modify, and distribute (requires derivatives to remain open-source).

Historical Data: CC BY 4.0 — free to share and adapt with attribution.

Brand: The name "World Contrast", the logo, and worldcontrast.org are not covered by the AGPL License.

<div align="center">

Compare. Contrast. Decide.

worldcontrast.org

</div>
