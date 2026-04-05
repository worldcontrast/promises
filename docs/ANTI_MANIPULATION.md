# World Contrast — Anti-Manipulation Architecture
# File: ANTI_MANIPULATION.md
# Version: 1.0 | April 4, 2026
#
# This document describes the technical and operational architecture
# designed to make data manipulation or fraud structurally impossible —
# not just difficult, not just detectable, but structurally impossible.
#
# The goal: a system where even the founders cannot manipulate the data
# without the entire world knowing.

---

## The core principle

**Trust no one. Verify everything. Record everywhere.**

A database protected by a password is only as trustworthy as the person who holds the password.
A database protected by cryptography is only as trustworthy as the cryptographic system.
A database protected by a distributed, decentralized, public ledger is trustworthy by design —
because no single entity, including the creators of World Contrast, can alter it without
leaving a permanent, publicly visible trace.

This is not a feature. This is the foundation.

---

## The three-layer anti-manipulation stack

### Layer 1 — Immutable capture (the moment of truth)

When an agent visits an official source, it does not just read text.
It creates a permanent, multi-format record of exactly what was publicly visible
at that exact moment in time.

**What is captured:**

```
For every source visit:
├── Full-page screenshot (PNG) — visual proof of what was visible
├── Raw HTML archive — complete page structure
├── Extracted text — for processing
├── PDF (if source is a document) — original format preserved
├── HTTP headers — server metadata and response codes
├── Timestamp — ISO 8601 with millisecond precision, UTC
└── Agent fingerprint — which version of which agent made the collection
```

**SHA-256 hash chain:**

Every captured file is hashed individually.
Then all hashes from a single collection run are combined into a
**Merkle root hash** — a single cryptographic fingerprint that represents
the entire collection. If any single byte in any single file changes,
the Merkle root changes. This makes partial tampering detectable.

```
screenshot.png       → hash_1
page.html            → hash_2
extracted_text.txt   → hash_3
metadata.json        → hash_4
                          ↓
              Merkle root: HASH(hash_1 + hash_2 + hash_3 + hash_4)
```

---

### Layer 2 — Blockchain registration (the permanent public record)

The Merkle root hash from every collection run is written to a public blockchain
within 60 seconds of collection completion.

**Why blockchain and not just a database:**

A database entry can be changed by whoever controls the database.
A blockchain entry cannot be changed by anyone — including the person who wrote it.
Once written, it exists permanently across thousands of nodes worldwide.

**Which blockchain:**

We use multiple chains simultaneously for redundancy:

| Chain | Why | Cost per record |
|---|---|---|
| Ethereum (via Attestation) | Most widely trusted, permanent | ~$0.01–0.10 |
| IPFS + Filecoin | Decentralized file storage | Near zero |
| Internet Archive | Human-readable, institutional | Free |
| OpenTimestamps | Bitcoin-anchored timestamps | Free |

A record that exists on all four simultaneously cannot be suppressed by any single
jurisdiction, government, or actor — because they would need to simultaneously control
Bitcoin, Ethereum, the Internet Archive, and IPFS.

**What gets written to blockchain:**

```json
{
  "worldcontrast_record": {
    "version": "1.0",
    "collection_run_id": "run-0042",
    "country": "BR",
    "election": "presidential-2026",
    "source_url": "https://tse.jus.br/...",
    "candidate_id": "candidate-001",
    "collected_at": "2026-04-04T14:32:00.000Z",
    "merkle_root": "a3f2c1d4e5b6...",
    "agent_version": "1.2.0",
    "agent_hash": "b7e91d..."
  }
}
```

**Public verification:**

Anyone in the world can take any promise record from World Contrast,
find its blockchain transaction, and verify independently that the hash matches.
No account required. No trust in World Contrast required.

---

### Layer 3 — Multi-agent consensus (the cross-validation network)

A single agent can be compromised. A network of independent agents cannot.

**How it works:**

For every official source, a minimum of 3 independent agents — running in different
geographic locations, on different infrastructure providers — visit the same URL
within the same 24-hour window and independently compute the hash of what they find.

```
Agent A (São Paulo, AWS)     → hash_A
Agent B (Frankfurt, Hetzner) → hash_B
Agent C (Singapore, GCP)     → hash_C

If hash_A = hash_B = hash_C → CONSENSUS → record is written
If any hash diverges         → ANOMALY   → human review triggered + public alert
```

**What divergence means:**

If Agent A sees different content than Agent B on the same official page,
one of three things happened:
1. The candidate updated their page between visits (logged as "source changed")
2. Geo-targeted content is being served (logged as "geographic variance — investigation")
3. Something is wrong with an agent (logged as "agent anomaly — quarantine")

In all cases, the divergence is published publicly. Nothing is silent.

**Open agent network:**

Over time, the agent network becomes open. Any trusted institution —
a university, a journalism organization, an NGO — can run a World Contrast
verification agent. They register their agent's public key, run the collection
software, and their hashes join the consensus pool.

The more independent agents participate, the more structurally impossible
manipulation becomes.

---

## Visual proof — screenshot validation

Beyond hashes and blockchains, World Contrast maintains a visual record.

Every collection run produces a full-page screenshot of every official source visited.
These screenshots are:

1. Stored in immutable archive (IPFS + S3 with object lock)
2. Hashed and registered on blockchain alongside the text hash
3. Publicly accessible via the Audit Portal

**Why screenshots matter:**

A hash proves that text was not changed after collection.
A screenshot proves what was actually visible to a human eye at that moment.

If a candidate's website showed a promise in large text on the homepage,
the screenshot shows exactly that — the visual context, the formatting,
the prominence. This prevents the argument that text was "taken out of context."

**Automated visual diff:**

Between collection runs, an automated visual comparison tool detects
changes in the official source pages and flags them:

```
Run 0041 screenshot vs Run 0042 screenshot:
→ Hero section: CHANGED (new promise added)
→ Policy page: UNCHANGED
→ Social media post: DELETED (flagged — original preserved in archive)
```

Deleted content is particularly important. If a candidate removes a promise
from their official website, World Contrast detects and records the deletion —
and the original content remains permanently archived.

**You cannot un-promise.**

---

## Shared global database — federated, not centralized

All operators of World Contrast nodes share access to a federated database.
No single node holds the authoritative copy. All nodes hold identical copies
verified by consensus.

**Database architecture:**

```
WorldContrast Network
├── Node Brazil (primary — worldcontrast.org)
├── Node Europe (mirror — eu.worldcontrast.org)
├── Node Asia (mirror — asia.worldcontrast.org)
├── Node [University partner]
├── Node [NGO partner]
└── Node [Any trusted institution]

Every node:
├── Holds complete copy of all data
├── Independently verifies new records before accepting
├── Publishes its own blockchain attestations
└── Alerts the network if its data diverges from consensus
```

**Replication protocol:**

Any organization that wants to replicate World Contrast does not start fresh.
They connect to the network, sync the full historical database, and begin
contributing their own verification hashes.

This means:
- If worldcontrast.org goes offline, the data survives on every other node
- If any node is pressured by a government to delete data, the data survives elsewhere
- If any node is hacked and data is altered, the consensus detects it immediately

---

## Anti-manipulation guarantees — what is structurally impossible

| Attack | Why it cannot succeed |
|---|---|
| Alter a collected promise after the fact | The blockchain hash would not match — detectable by anyone |
| Delete a promise from the database | Other nodes hold copies — deletion triggers network alert |
| Inject a fake promise | Multi-agent consensus would not include a promise that only one agent "saw" |
| Pressure World Contrast to remove a record | Warrant Canary + federated network — removal attempt is public |
| Run a fake "World Contrast" with altered data | Trademark protection + blockchain provenance back to Apr 4, 2026 |
| Geo-target different content to our agents | Multi-location agents detect geographic variance and flag it publicly |
| Delete content from official source after collection | Immutable archive preserves original + blockchain records the deletion event |

---

## The promise that cannot be made by any other platform

**We are building a system where the founders themselves cannot manipulate the data.**

Once a record is written to the blockchain and distributed across the federated network,
Rafael Stedile — the founder — cannot alter it. No court order can erase it from every
node simultaneously. No government can suppress it globally.

This is not arrogance. This is architecture.

The design goal is a platform that is trustworthy not because you trust the people
who built it, but because the system makes trust unnecessary.

---

## Implementation roadmap

### Phase 1 — MVP (now)
- SHA-256 hashing of all collected content
- Wayback Machine archiving
- Public audit log in GitHub

### Phase 2 — Blockchain integration (months 2–4)
- OpenTimestamps (Bitcoin-anchored, free)
- IPFS storage for screenshots and full-page archives
- Public blockchain transaction IDs in every promise record

### Phase 3 — Multi-agent consensus (months 4–8)
- Deploy 3 agents in different geographic regions
- Automated divergence detection and public alerting
- Agent registration system for institutional partners

### Phase 4 — Federated network (months 8–18)
- Open node protocol
- University and NGO partner nodes
- Full federated database with consensus verification

### Phase 5 — Open agent network (year 2+)
- Any trusted institution can run a verification agent
- Consensus pool grows with every new participant
- Structural manipulation becomes mathematically implausible

---

## Cost of the anti-manipulation stack

| Component | Phase | Monthly cost |
|---|---|---|
| OpenTimestamps (Bitcoin) | Phase 2 | $0 |
| IPFS/Filecoin storage | Phase 2 | ~$5–20 |
| Ethereum attestations | Phase 2 | ~$10–50 |
| Second agent location | Phase 3 | ~$10–20 |
| Third agent location | Phase 3 | ~$10–20 |
| **Total at Phase 3** | | **~$35–110/month** |

The cost of making political data manipulation structurally impossible:
**less than a dinner for two.**

---

*This architecture document is itself subject to the same principles it describes.*
*It is version-controlled, publicly visible, and its history is permanent.*
*Any change to this document is recorded forever in the Git history.*

*World Contrast — Because the world is clearer when you see the difference.*
*github.com/worldcontrast/promises · worldcontrast.org*
