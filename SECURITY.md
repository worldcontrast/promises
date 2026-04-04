# Security Policy — World Contrast

**Version 1.0 | This document is public, permanent, and irrevocable.**

---

## Our commitment

World Contrast is a non-profit, politically neutral platform. This document describes how we handle security vulnerabilities, legal pressure, and political interference — publicly and transparently.

We publish this document because **transparency is our only protection.**

---

## Reporting a security vulnerability

If you find a technical vulnerability (SQL injection, data exposure, authentication bypass, etc.):

1. **Do not open a public GitHub Issue** — this could expose users before the fix is deployed.
2. Send an email to: **security@worldcontrast.org**
3. Include: description of the vulnerability, steps to reproduce, potential impact.
4. We will acknowledge within 48 hours and publish a fix within 7 days.
5. After the fix is deployed, we will publish a public post-mortem in this repository.

We do not offer bug bounties at this time, but we will credit all responsible disclosures publicly.

---

## Reporting biased data or neutrality violations

If you believe a promise has been incorrectly extracted, categorized, or is missing:

1. Open a **GitHub Issue** with the label `data-quality`
2. Include: candidate ID, promise ID (if applicable), the correct source URL, and a screenshot of the official source
3. Every correction goes through a pull request with two maintainer approvals
4. Every correction is logged in the public audit trail — there are no silent changes

---

## Warrant Canary — political and legal pressure policy

**This section is updated on the 1st of every month.**
**If this section disappears or stops being updated, assume we are under legal pressure.**

*Last updated: April 4, 2026*

As of the date above, World Contrast:

- ✓ Has NOT received any government order to remove or modify data
- ✓ Has NOT received any legal threat from any candidate, party, or political actor
- ✓ Has NOT been contacted by any intelligence agency or law enforcement regarding our data
- ✓ Has NOT been pressured by any funder, partner, or third party to favor or disfavor any candidate
- ✓ Has NOT modified any collected promise data under political pressure

**If we receive a legal demand to remove data:**
We will publish the full request (or as much as legally permitted) as a GitHub Issue before taking any action. We will not silently comply. If we are legally prohibited from publishing the request, we will update this section with the words "we cannot comment on this matter" — which is itself a signal to the community.

**If we receive a court order we cannot resist:**
We will publish a notice that data was modified under legal compulsion, identify which records were affected, and preserve the original data in our cryptographic archive to the extent legally permitted.

---

## Fork policy — protecting against malicious copies

The original World Contrast repository was created on April 4, 2026 at:
`https://github.com/worldcontrast/promises`

**How to verify you are using the original:**
- The founding commit timestamp is publicly visible on GitHub
- The domain `worldcontrast.org` points to our official deployment
- Our Wayback Machine archive: `https://web.archive.org` (search worldcontrast)

Forks of this repository are permitted under the MIT License. However:
- Forks may NOT use the name "World Contrast" or "worldcontrast.org" without written permission
- Forks may NOT imply they are the official or original project
- Forks used to spread political disinformation will be reported to GitHub and relevant authorities

---

## Integrity verification

Every promise record in our database includes:
- `source_url` — the exact official URL where the promise was found
- `archive_url` — the permanent Wayback Machine archive of that page
- `content_hash` — SHA-256 hash of the page at collection time
- `collected_at` — ISO 8601 timestamp

**Anyone can verify any record:**
1. Take the `archive_url` from any promise record
2. Open it in any browser — it shows the exact page as it was when we collected it
3. Compare with the `content_hash` to confirm nothing was altered

This verification is possible without trusting us. That is intentional.

---

## Governance and maintainer accountability

- All changes to the `main` branch require a pull request
- All pull requests require 2 maintainer approvals
- Changes to critical files (extraction prompt, schema, data standards) require founder approval
- The full git history is public — every change, by every person, at every time, is permanently recorded
- Maintainers who violate the neutrality policy are removed and the violation is published

---

## Contact

- Security issues: security@worldcontrast.org
- General: hello@worldcontrast.org
- Press: press@worldcontrast.org

*World Contrast is committed to operating with radical transparency. If you ever doubt our neutrality, the tools to verify it are public and free.*
