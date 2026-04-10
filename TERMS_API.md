# WorldContrast — API Terms of Use

**Last Updated:** April 2026  
**Version:** 1.0  
**Official platform:** https://worldcontrast.org  
**Repository:** https://github.com/worldcontrast/promises

---

## 1. Overview

The WorldContrast API provides access to a centralized, governed, and
auditable database of political campaign promises collected from official
sources across multiple countries.

The database operates under the **POCVA-01 Protocol** (Autonomous
Collection and Validation Operational Protocol), which ensures that every
record was extracted by a neutral, rule-based algorithm — never by human
editorial judgment.

By accessing or using this API, you agree to comply with these Terms.

---

## 2. What Is Open and What Is Not

| Component | Status | License |
|---|---|---|
| Source code (this repository) | **Open** | MIT License |
| Collection algorithm | **Open** | MIT License |
| Extraction protocol (POCVA-01) | **Open** | MIT License |
| Official database | **Controlled** | These Terms |
| API access | **Controlled** | These Terms |
| WorldContrast name and brand | **Protected** | All rights reserved |

The separation is intentional. Transparency in *how* data is collected
builds trust. Governance of *what* is collected ensures integrity.

---

## 3. Purpose and Integrity

The WorldContrast database is designed to function as a global,
historical, and cryptographically auditable record of political promises.

To preserve its neutrality and reliability:

- All data is collected exclusively by the official WorldContrast agent
- Every record carries a SHA-256 content hash and a Wayback Machine
  archive link as proof of existence
- Data may not be altered, overwritten, or misrepresented after collection
- Provenance, timestamps, and rejection logs are permanent and public

---

## 4. Mandatory Use of Official Data Source

Any application or system that:

- uses WorldContrast software **and**
- presents itself as compatible with or powered by WorldContrast

**MUST** use the official WorldContrast API as its primary data source.

It **MUST NOT**:

- substitute, replicate, or fork the database as an "official" version
- present independently collected data under the WorldContrast name
- remove or alter provenance metadata, hashes, or rejection records

---

## 5. API Access Tiers

| Tier | Use case | Rate limit | Cost |
|---|---|---|---|
| **Public** | Journalists, researchers, citizens | 100 req/day | Free |
| **Institutional** | Universities, NGOs, newsrooms | 10,000 req/day | Free (application required) |
| **Commercial** | Platforms, aggregators, media | Unlimited | Paid (contact us) |

WorldContrast reserves the right to issue, limit, suspend, or revoke
API keys at any time, particularly in cases of abuse, misrepresentation,
or violation of these Terms.

---

## 6. Independent Instances

You may create independent instances of the WorldContrast software,
provided that:

- They **do not** represent themselves as the official WorldContrast
  database or a trusted mirror of it
- They **clearly disclose** that data originates from an independent
  or modified source
- They **do not** use the WorldContrast name, logo, or identity
  without explicit written permission

---

## 7. Attribution

Any public use of WorldContrast data must include clear attribution:

> *"Data provided by WorldContrast — worldcontrast.org"*

Where applicable, a link to the original promise record on the official
platform must be included.

---

## 8. POCVA-01 Protocol Compliance

Applications using WorldContrast data acknowledge that:

- Every promise in the database was extracted under the POCVA-01 Protocol
- Extraction follows the Promise Equation:
  **[Actor] + [Future Action Verb] + [Measurable Target]**
- Statements that did not meet this standard were logged in the public
  `extraction_rejections` table with the reason for rejection
- No human editorial judgment was applied in the inclusion or
  exclusion of any statement

This protocol is the legal and institutional shield of WorldContrast.
Any allegation of bias or censorship can be verified against the
public rejection log.

---

## 9. Data Protection and Compliance

Users of this API must comply with all applicable data protection laws,
including but not limited to:

- **GDPR** — General Data Protection Regulation (European Union)
- **LGPD** — Lei Geral de Proteção de Dados (Brazil)

WorldContrast does not guarantee legal compliance for third-party
implementations. Each user is responsible for their own legal context.

---

## 10. No Warranty

The API and data are provided "as is", without warranty of any kind.
WorldContrast does not guarantee completeness, accuracy, or availability
at any given time.

---

## 11. Limitation of Liability

WorldContrast shall not be held liable for:

- Decisions made based on data retrieved from this API
- Misuse or misinterpretation of the data
- Any damages resulting from API usage or unavailability

---

## 12. Jurisdiction

These Terms are governed by the laws of Brazil (LGPD) and, where
applicable, the European Union (GDPR). Any disputes shall be resolved
in the appropriate courts of the jurisdiction where WorldContrast
operates.

---

## 13. Changes to Terms

WorldContrast reserves the right to modify these Terms at any time.
Changes will be announced in this repository and on the official
platform. Continued use of the API after changes constitutes acceptance
of the updated Terms.

---

## 14. Contact

For API access requests, institutional partnerships, or legal inquiries:

**https://worldcontrast.org/contact**  
**GitHub:** https://github.com/worldcontrast/promises

---

*The engine is open. The record is ours.*  
*— WorldContrast*
