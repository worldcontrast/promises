# Contributing to World Contrast

Thank you for your interest in contributing to a neutral, cryptographically auditable record of political promises.

Before contributing, please read this document in full. Contributions that do not meet these standards will be declined — not because we doubt your intentions, but because the institutional integrity of this project depends on a process that is verifiable and defensible.

---

## Table of Contents

- [What we need most](#what-we-need-most)
- [Who can contribute](#who-can-contribute)
- [Who cannot contribute](#who-cannot-contribute)
- [How to contribute](#how-to-contribute)
- [Country data files](#country-data-files)
- [Source verification standards](#source-verification-standards)
- [Code contributions](#code-contributions)
- [The separation of concerns rule](#the-separation-of-concerns-rule)
- [Pull request process](#pull-request-process)
- [What we will never accept](#what-we-will-never-accept)

---

## What we need most

Listed in order of institutional impact:

1. **Country data files** — add a new election to `/data/countries/`
2. **Source verification** — verify and update official candidate URLs
3. **Language support** — add or improve translations for a new locale
4. **Agent improvements** — better PDF parsing, social media text extraction
5. **Frontend** — accessibility, performance, mobile experience
6. **Documentation** — corrections, translations, clarity improvements

---

## Who can contribute

Anyone who:

- Has no current affiliation with any political party, campaign, or government electoral body
- Has had no such affiliation in the last **2 years**
- Can commit to strict political neutrality for the duration of their contribution
- Understands that their contribution will be publicly attributed in the git history

---

## Who cannot contribute

The following individuals are **permanently ineligible** to contribute to World Contrast:

- Current employees, contractors, or volunteers of any political party or campaign
- Current or former employees of any government electoral authority (in the last 2 years)
- Anyone who has received compensation from a political actor in the last 2 years
- Anyone with a financial interest in the electoral outcome of any election in our database

If you are unsure whether you qualify, open an Issue and ask before investing time in a contribution. We will give you a direct answer.

---

## How to contribute

```text
1. Fork the repository
2. Create a branch with a descriptive name:
   feature/country-argentina-2027
   fix/pdf-parser-encoding-utf8
   data/brazil-2026-update-sources
3. Make your changes
4. Run the test suite (see below)
5. Open a Pull Request with a clear description
6. Wait for 2 maintainer approvals
7. Merge
```

---

## Country data files

Adding a new election is the highest-impact contribution you can make.

### File location

```text
data/countries/[country-code]-[year].json
```

Example: `data/countries/argentina-2027.json`

### Required structure

```json
{
  "id": "argentina-2027",
  "country": "AR",
  "countryName": {
    "en": "Argentina",
    "pt": "Argentina",
    "es": "Argentina"
  },
  "flag": "🇦🇷",
  "electionName": {
    "en": "Presidential Election 2027",
    "pt": "Eleição Presidencial 2027",
    "es": "Elección Presidencial 2027"
  },
  "electionDate": "2027-10-24",
  "electionType": "presidential",
  "status": "scheduled",
  "lastUpdated": "2026-04-10",
  "tribunal": {
    "name": "Cámara Nacional Electoral",
    "url": "https://www.electoral.gob.ar"
  },
  "candidates": []
}
```

### Candidate source format

```json
{
  "id": "candidate-001",
  "fullName": "Full Legal Name As Filed",
  "displayName": "Common Name",
  "party": "Party Abbreviation",
  "partyFullName": "Full Party Name",
  "electoralNumber": "00",
  "initials": "FL",
  "color": "#000000",
  "photoUrl": "/assets/candidates/candidate-001.jpg",
  "sources": {
    "electoralFiling": "https://tribunal.gov/filing/candidate-001",
    "officialSite": "https://candidatewebsite.com",
    "instagram": "https://instagram.com/officialaccount",
    "facebook": "https://facebook.com/officialpage",
    "twitter": "https://twitter.com/officialhandle",
    "youtube": "https://youtube.com/@officialchannel",
    "tiktok": "https://tiktok.com/@officialaccount"
  }
}
```

---

## Source verification standards

Every URL submitted in a country data file must meet **all** of the following criteria:

| Criterion | Requirement |
|---|---|
| **Officiality** | Must be the candidate's own official source, not a news article about them |
| **Verification** | Social media accounts must be verified (blue check) or officially registered with the electoral tribunal |
| **Accessibility** | URL must be publicly accessible without login |
| **Stability** | URL must resolve at the time of PR submission |
| **Primary source** | No aggregators, no fan pages, no unofficial mirrors |

**Ineligible sources** — the following will never be accepted:

- News articles or editorials about the candidate
- Fan pages or parody accounts
- Unofficial party websites
- URLs that require authentication
- Social media posts (only official profile pages, not individual posts)

Data contributions require **two independent verifications** — your PR must reference a second contributor who has independently confirmed each URL.

---

## Code contributions

### Before you start

- Open an Issue describing what you intend to change
- Wait for a maintainer to confirm the approach before writing code
- This prevents wasted effort and ensures alignment

### Testing

```bash
# Run the full test suite
pytest agents/tests/ -v

# Run frontend tests
cd frontend && npm test

# Run a dry-run agent cycle (no DB writes)
python agents/scheduler.py --country BR --dry-run
```

All tests must pass before a PR will be reviewed.

### Code style

- Python: follow PEP 8, use type hints throughout
- TypeScript: strict mode, no `any` types in new code
- All new functions must have docstrings / JSDoc comments

---

## The separation of concerns rule

**No single contributor may modify both the extraction prompt and the validation layer in the same Pull Request.**

These two components are the core institutional safeguards of World Contrast:

- `agents/extraction/prompts/extraction_prompt.txt` — defines what qualifies as a promise
- `agents/validation/validator.py` — enforces the Promise Equation

Any PR that touches both files simultaneously will be automatically declined, regardless of content. This is not a technical rule — it is a governance rule. It ensures that no single actor can change both what is accepted and how it is validated in one unreviewed action.

Changes to the extraction prompt also require:

1. Documented rationale in the PR description
2. Two maintainer approvals (not one)
3. A before/after test run with real data showing the impact
4. An entry in `PROMPT_CHANGELOG.md`

---

## Pull request process

```text
1. Title format:    [type]: brief description
   Examples:        feat: add Argentina 2027 election data
                    fix: correct Brazil tribunal URL
                    docs: improve CONTRIBUTING.md clarity

2. Description must include:
   - What changed and why
   - How you verified the change
   - Test results (paste the relevant output)
   - For data PRs: confirmation of two independent source verifications

3. Checklist (all must be checked before review):
   □ I have no affiliation with any political party in the last 2 years
   □ All URLs in my data file are publicly accessible
   □ Tests pass locally
   □ I have not modified both extraction prompt and validator in this PR
   □ I have not received compensation from any political actor

4. Review: 2 approvals required to merge
5. Merge: squash merge, maintainer performs
```

---

## What we will never accept

The following contributions will be declined immediately and permanently:

- Any code or data that advantages or disadvantages a specific candidate
- Changes to the extraction algorithm that reduce the rejection rate without documented justification
- Sources that are not official primary sources
- Contributions from individuals with undisclosed political affiliations
- Any modification that removes or weakens the audit trail
- Changes to the `audit_log` append-only enforcement
- Anything that makes the system less transparent or less verifiable

---

<div align="center">

*"We provide the tools. You provide the judgment."*

Questions? Open an Issue or reach us at [worldcontrast.org/contact](https://worldcontrast.org/contact)

</div>
