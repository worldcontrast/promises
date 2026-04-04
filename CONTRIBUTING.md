# Contributing to World Contrast

Thank you for your interest in contributing to World Contrast. This project exists to serve citizens around the world with transparent, neutral political information. Every contribution must uphold that mission without compromise.

---

## Before you contribute

### Eligibility

You may NOT contribute to this project if you are currently, or have been within the last 24 months:
- An employee, contractor, or paid consultant of any political party
- A member of any candidate's campaign staff or advisory team
- An elected official or government appointee in any jurisdiction
- A registered lobbyist in any jurisdiction

If you have any doubt, open an issue and ask before contributing.

### Declaration

By submitting a pull request, you declare that you meet the eligibility criteria above and that your contribution is made independently, without instruction or compensation from any political actor.

---

## How to contribute

### 1. Add a new country or election

The highest-value contribution is expanding coverage to new countries.

Create a file in `/data/countries/[country-code].json` following this template:

```json
{
  "country_code": "MX",
  "country_name_en": "Mexico",
  "country_name_local": "México",
  "tribunal": {
    "name": "Instituto Nacional Electoral",
    "url": "https://www.ine.mx",
    "filings_url": "https://candidaturas.ine.mx"
  },
  "elections": [
    {
      "id": "mx-presidential-2024",
      "name": "Presidential Election 2024",
      "type": "presidential",
      "election_date": "2024-06-02",
      "campaign_start": "2024-03-01",
      "candidates": [
        {
          "id": "claudia-sheinbaum-mx",
          "full_legal_name": "Claudia Sheinbaum Pardo",
          "display_name": "Claudia Sheinbaum",
          "party_name": "Morena",
          "electoral_number": "1",
          "electoral_filing_url": "https://candidaturas.ine.mx/...",
          "official_site_url": "https://claudiasheinbaum.com",
          "instagram_url": "https://instagram.com/claudia_shein",
          "facebook_url": "https://facebook.com/claudiasheinbaum",
          "youtube_url": "https://youtube.com/@claudiasheinbaum",
          "twitter_url": "https://twitter.com/claudiashein",
          "tiktok_url": null
        }
      ]
    }
  ]
}
```

**Verification requirement**: All source URLs must be verified as official before merging. Include in your PR:
- Screenshot of the electoral tribunal page confirming this candidate's registration
- Screenshot confirming the social media accounts are official (verified badge or stated on official site)

Two maintainers must independently verify before merge.

### 2. Improve agent code

- Better PDF extraction for electoral filings
- Improved social media content extraction
- New language support for translation
- Performance optimizations
- Test coverage improvements

### 3. Frontend improvements

- Accessibility (WCAG 2.1 AA compliance is a goal)
- Performance
- New language UI translations (i18n strings in `/frontend/messages/`)
- Mobile experience improvements
- Data visualization improvements

### 4. Report a data quality issue

If you find an incorrect, missing, or wrongly categorized promise, open a GitHub Issue with:
- The candidate ID
- The promise ID (if applicable)
- The correct source URL
- A screenshot of the official source

Do not report issues by contacting candidates or parties. All corrections go through GitHub.

---

## What we will never merge

- Code that applies different collection logic to different candidates
- Code that adds any editorial framing to promise display
- Promises sourced from unofficial accounts, fan pages, or secondary reporting
- Any feature that would allow candidates or parties to submit, edit, or remove their data
- Analytics or tracking code of any kind
- Advertising infrastructure

---

## The extraction prompt is protected

The file `/agents/extraction/prompts/extraction_prompt.txt` is the most critical file in the project. It defines what gets collected and what gets rejected.

Changes to this file require:
1. An Issue opened for discussion (minimum 7-day comment period)
2. Two maintainer approvals
3. A documented rationale in `PROMPT_CHANGELOG.md`
4. A test run on a sample dataset with before/after comparison

No exceptions.

---

## Commit message format

```
type(scope): short description

Types: feat | fix | data | docs | test | refactor | chore
Scopes: agents | frontend | backend | data | schema | prompt | infra

Examples:
feat(data): add Mexico 2024 presidential election sources
fix(agents): handle PDF encoding errors for French documents
data(brazil): update TSE filing URLs for 2026 election
docs: clarify collection rules for YouTube transcripts
```

---

## Questions?

Open a GitHub Discussion — not an Issue (Issues are for bugs and data problems, Discussions are for questions and ideas).

*Thank you for helping make political information more transparent, neutral, and accessible.*
