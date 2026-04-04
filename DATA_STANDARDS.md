# World Contrast — Data Standards

**Version 1.0 | This document is the canonical reference for all data decisions.**

Any dispute about whether a piece of content should be collected, classified, or displayed is resolved by this document. If this document does not cover a case, open a GitHub Issue — do not make an ad-hoc judgment.

---

## The fundamental rule

**We copy. We do not interpret.**

If a candidate stated it in an official source, we record it verbatim. If they did not state it, we record nothing. We never infer, extrapolate, or summarize promises.

---

## Official sources — what qualifies

### Tier 1 (highest authority)
Electoral tribunal filings — the candidate's officially registered program document. In most countries this is a legally required document submitted to the national electoral authority. This is the most authoritative source because it carries the candidate's legal signature.

- Brazil: TSE (tse.jus.br) — "Programa de Governo"
- USA: FEC (fec.gov) — candidate registration and financial disclosures
- Mexico: INE (ine.mx) — "Plataforma Electoral"
- France: Conseil Constitutionnel — official candidacy declaration
- Germany: Bundeswahlleiter — party programs registered with federal election authority
- India: Election Commission (eci.gov.in) — affidavit and declared program

### Tier 2
The candidate's official campaign website (registered domain, listed on electoral filing or tribunal record).

### Tier 3
Official, verified social media accounts — meaning accounts that are either:
a) Verified by the platform (official verification badge), OR
b) Explicitly listed on the candidate's Tier 1 or Tier 2 source, OR
c) Confirmed by two independent maintainers from public electoral sources

### Tier 4
Official press releases and statements published on Tier 2 or Tier 3 sources only.

### What does NOT qualify as an official source
- News articles or media reporting on candidate's promises (even quotes)
- Unofficial fan accounts or parody accounts
- Third-party aggregators or fact-checking sites
- Leaked documents or unofficial communications
- Statements attributed to campaign staff or spokespeople
- Posts by party officials about the candidate (unless the candidate is the party leader and the account is the official party account listed in their filing)

---

## What constitutes a "promise"

A promise must be:

1. **Forward-looking** — it describes something the candidate will do, create, implement, or achieve if elected
2. **Attributable** — it is stated by or on behalf of the candidate in an official source
3. **Specific enough** — it refers to a concrete action, policy, or target (not a general value)

### Examples: INCLUDE

| Statement | Why it qualifies |
|---|---|
| "We will reduce income tax for workers earning up to R$5,000/month" | Concrete, forward-looking, specific |
| "Our goal is zero deforestation in the Amazon by the end of our first term" | Concrete target with timeframe |
| "We will build 500 new schools in rural municipalities within 4 years" | Quantified commitment |
| "We commit to creating a national housing program for 1 million families" | Clear commitment with scale |
| "Our plan is to privatize Correios within the first 18 months" | Specific action, specific entity, timeframe |

### Examples: EXCLUDE

| Statement | Why it is rejected |
|---|---|
| "We believe education is the foundation of society" | Value statement, no commitment |
| "We will make Brazil great again" | No concrete policy content |
| "My opponent has failed to deliver on healthcare" | Attack on opponent |
| "We have always fought for workers' rights" | Historical claim, not future commitment |
| "The current administration has destroyed the economy" | Critique, no promise |
| "We will do whatever it takes" | Too vague to classify |

---

## Ambiguous cases

If a statement could be interpreted as a promise but is genuinely unclear, extract it verbatim and mark `ambiguous: true`. This triggers a data quality flag.

Ambiguous records are displayed on the platform with a visual indicator ("Promise text may be ambiguous — see original source") and link directly to the archived source.

Ambiguous records are never silently excluded. They are included with transparency.

---

## Category assignment rules

When a promise could belong to multiple categories, assign to the most specific applicable category.

**Decision tree for edge cases:**

- Healthcare funding → `health` (not `economy`)
- Police salaries → `safety` (not `economy`)
- Environmental taxes → `environment` (not `economy`)
- School construction → `education` (not `infrastructure`)
- Prison reform → `safety` (not `governance`)
- Electoral system reform → `governance`
- Anti-corruption measures → `governance`
- LGBTQ+ protections → `rights`
- Indigenous land rights → `rights` (not `governance`)
- Minimum wage increase → `economy`
- Social housing → `social` (not `infrastructure`)
- Public transport → `infrastructure` (not `social`)

If a promise is genuinely dual-category, set both `category` and `secondary_category`.

---

## Social media: specific rules

### Instagram and Facebook
- Collect from feed posts only (not Stories, which disappear)
- Collect from the official account only — never from reposts or tagged mentions
- A post by a supporter quoting the candidate does NOT qualify
- The candidate's own post quoting themselves DOES qualify

### YouTube
- Collect from official channel transcripts only (auto-generated or provided)
- Debates and interviews published on the candidate's own channel qualify
- Interviews on third-party channels do NOT qualify (we cannot verify the account)
- Transcripts must be auto-generated or officially provided — no human transcription by our agents

### TikTok
- Collect from official verified account only
- Text overlay content in videos is valid if clearly legible
- Spoken content in videos: collect only if an official transcript or caption is provided by the account

### X (Twitter)
- Collect from official account only
- Retweets and quoted tweets by the candidate of their own content qualify
- Quote-tweets of others do NOT qualify (the candidate is commenting on someone else's content)

---

## The zero-contact rule — in detail

**We never contact candidates, parties, campaign staff, or party members for any reason related to data.**

This means:
- No emails asking for a candidate's platform document
- No DMs asking to verify a social media account
- No press inquiries about campaign promises
- No requests to political parties for electoral filings (we retrieve them directly from the tribunal)

The only permitted "contact" is HTTP requests to publicly accessible web pages and APIs — the same interaction any citizen with a browser would make.

**Why this rule exists**: Any contact creates a relationship. A relationship creates the appearance of coordination. The appearance of coordination destroys credibility. We have zero contact so we have zero relationship so we have zero bias.

---

## Status tracking rules

Once a candidate is elected, a separate status-tracking phase begins. This is optional and dependent on available official government sources.

| Status | Meaning | Evidence required |
|---|---|---|
| `stated` | Promise found in official campaign source | Source URL + archive |
| `partial` | Ambiguous promise or mixed fulfillment evidence | Source URL of both original + evidence |
| `fulfilled` | Official government source confirms implementation | Government gazette or official announcement URL |
| `retracted` | Candidate publicly stated they will not fulfill | Official statement URL |
| `unavailable` | Original source is no longer accessible | Archive URL + note on unavailability |

Status changes from `stated` to any other status require a GitHub PR with source evidence. This applies to all candidates equally — we apply the same tracking standards regardless of party or outcome.

---

## Data corrections

If a promise was extracted incorrectly (wrong category, wrong text, wrong source), corrections are made through the GitHub PR process — never directly in the database.

Every correction creates an audit log entry that is publicly visible. There is no silent correction.

---

*This document is governed by the World Contrast Manifesto. In cases of conflict, the Manifesto prevails.*
