-- ============================================================
-- World Contrast — Complete Database Schema
-- File: /backend/db/schema.sql
-- Database: PostgreSQL 15+ (Supabase)
-- ============================================================

-- Enable vector extension for semantic deduplication
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- COUNTRIES
-- ============================================================
CREATE TABLE countries (
    code            CHAR(2) PRIMARY KEY,          -- ISO 3166-1 alpha-2
    name_en         TEXT NOT NULL,
    name_local      TEXT,
    tribunal_name   TEXT,                         -- e.g. "Tribunal Superior Electoral"
    tribunal_url    TEXT,                         -- official electoral court URL
    active          BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ELECTIONS
-- ============================================================
CREATE TABLE elections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_code    CHAR(2) REFERENCES countries(code),
    name            TEXT NOT NULL,               -- e.g. "Presidential Election 2026"
    election_type   TEXT NOT NULL,               -- presidential | legislative | municipal | regional
    election_date   DATE,
    campaign_start  DATE,
    campaign_end    DATE,
    active          BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CANDIDATES
-- ============================================================
CREATE TABLE candidates (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id         UUID REFERENCES elections(id),
    full_legal_name     TEXT NOT NULL,           -- from electoral filing
    display_name        TEXT NOT NULL,
    party_name          TEXT,
    party_abbreviation  TEXT,
    electoral_number    TEXT,                    -- official registration number at tribunal
    electoral_filing_url TEXT,                  -- direct link to tribunal filing

    -- Official source URLs
    official_site_url   TEXT,
    instagram_url       TEXT,
    facebook_url        TEXT,
    twitter_url         TEXT,
    youtube_url         TEXT,
    tiktok_url          TEXT,

    -- Metadata
    verified            BOOLEAN DEFAULT false,   -- sources verified by human maintainer
    verified_by         TEXT,                    -- GitHub username of verifier
    verified_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_candidates_election ON candidates(election_id);

-- ============================================================
-- SOURCE REGISTRY
-- ============================================================
-- Every URL ever crawled, with its current status
CREATE TABLE source_registry (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id    UUID REFERENCES candidates(id),
    url             TEXT NOT NULL,
    source_type     TEXT NOT NULL CHECK (source_type IN (
                        'electoral_filing',
                        'official_site',
                        'instagram',
                        'facebook',
                        'twitter',
                        'youtube',
                        'tiktok',
                        'press_release'
                    )),
    active          BOOLEAN DEFAULT true,
    last_crawled_at TIMESTAMPTZ,
    last_status     INTEGER,                    -- HTTP status code
    added_by        TEXT,                       -- GitHub username
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COLLECTION RUNS
-- ============================================================
-- Every time the agent runs, one record is created
CREATE TABLE collection_runs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    started_at      TIMESTAMPTZ DEFAULT now(),
    completed_at    TIMESTAMPTZ,
    status          TEXT CHECK (status IN ('running', 'completed', 'failed')),
    candidates_processed INTEGER DEFAULT 0,
    sources_crawled INTEGER DEFAULT 0,
    promises_extracted INTEGER DEFAULT 0,
    promises_rejected INTEGER DEFAULT 0,
    agent_version   TEXT NOT NULL,
    trigger         TEXT CHECK (trigger IN ('scheduled', 'manual', 'ci'))
);

-- ============================================================
-- CRAWLED PAGES (the archive)
-- ============================================================
CREATE TABLE crawled_pages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id          UUID REFERENCES collection_runs(id),
    source_id       UUID REFERENCES source_registry(id),
    candidate_id    UUID REFERENCES candidates(id),

    -- The actual URL visited
    url             TEXT NOT NULL,

    -- Archive (immutable proof)
    archive_url     TEXT,                       -- Wayback Machine URL
    s3_key          TEXT,                       -- our own S3 archive key
    content_hash    TEXT NOT NULL,              -- SHA-256 of raw content

    -- Metadata
    collected_at    TIMESTAMPTZ DEFAULT now(),
    http_status     INTEGER,
    content_type    TEXT,
    content_length  INTEGER,
    error           TEXT                        -- if crawl failed
);

CREATE INDEX idx_crawled_candidate ON crawled_pages(candidate_id);
CREATE INDEX idx_crawled_run ON crawled_pages(run_id);

-- ============================================================
-- PROMISES (the core table)
-- ============================================================
CREATE TABLE promises (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id        UUID REFERENCES candidates(id) NOT NULL,
    crawled_page_id     UUID REFERENCES crawled_pages(id) NOT NULL,

    -- The promise content
    category            TEXT NOT NULL CHECK (category IN (
                            'economy', 'education', 'health', 'safety',
                            'environment', 'social', 'rights', 'infrastructure', 'governance'
                        )),
    secondary_category  TEXT CHECK (secondary_category IN (
                            'economy', 'education', 'health', 'safety',
                            'environment', 'social', 'rights', 'infrastructure', 'governance'
                        )),

    -- Original text (verbatim)
    text_original       TEXT NOT NULL,
    quote               TEXT,                   -- NEW: Citação exata (Anti-Alucinação)
    language_original   CHAR(2) NOT NULL,       -- ISO 639-1 language code

    -- Translations (auto-generated, human-reviewable)
    text_en             TEXT,
    text_es             TEXT,
    text_fr             TEXT,
    text_ar             TEXT,
    text_zh             TEXT,
    text_pt             TEXT,

    -- Source provenance (the audit trail)
    source_url          TEXT NOT NULL,          -- exact URL where found
    archive_url         TEXT,                   -- Wayback Machine URL
    content_hash        TEXT NOT NULL,          -- SHA-256 of the page at collection time
    collected_at        TIMESTAMPTZ NOT NULL,

    -- Quality signals
    verbatim            BOOLEAN DEFAULT true,
    ambiguous           BOOLEAN DEFAULT false,
    confidence          NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
    agent_version       TEXT NOT NULL,

    -- HITL (Human-in-the-Loop) Routing & Review
    flagged_for_review  BOOLEAN DEFAULT FALSE,  -- NEW: Trava de envio para o Telegram
    flag_reason         TEXT,                   -- NEW: Motivo do flag (Confidence ou Exact Match)

    -- Status tracking
    status              TEXT DEFAULT 'stated' CHECK (status IN (
                            'stated',           -- promise exists in official source
                            'partial',          -- ambiguous or partially fulfilled
                            'fulfilled',        -- explicitly confirmed fulfilled
                            'retracted',        -- candidate publicly walked it back
                            'unavailable'       -- source no longer accessible
                        )),
    status_updated_at   TIMESTAMPTZ,
    status_source_url   TEXT,                   -- proof URL for status change

    -- Deduplication
    embedding           vector(1536),           -- for semantic duplicate detection
    canonical_id        UUID,                   -- if this is a duplicate, points to canonical record

    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_promises_candidate ON promises(candidate_id);
CREATE INDEX idx_promises_category ON promises(category);
CREATE INDEX idx_promises_status ON promises(status);
CREATE INDEX idx_promises_embedding ON promises USING ivfflat (embedding vector_cosine_ops);

-- ============================================================
-- AUDIT LOG (append-only, never updated)
-- ============================================================
-- Every change to any promise or candidate record is logged here
CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    table_name      TEXT NOT NULL,
    record_id       UUID NOT NULL,
    action          TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_by      TEXT NOT NULL,              -- 'agent-v1.2' or 'maintainer:username'
    changed_at      TIMESTAMPTZ DEFAULT now(),
    old_values      JSONB,
    new_values      JSONB,
    reason          TEXT                        -- required for human changes
);

-- Make audit log truly append-only: no UPDATE or DELETE allowed
CREATE RULE audit_log_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE RULE audit_log_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;

-- ============================================================
-- EXTRACTION REJECTIONS LOG
-- ============================================================
-- Every piece of content the agent considered but rejected
-- Full transparency on what was excluded and why
CREATE TABLE extraction_rejections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crawled_page_id UUID REFERENCES crawled_pages(id),
    candidate_id    UUID REFERENCES candidates(id),
    rejected_text   TEXT NOT NULL,
    rejection_reason TEXT NOT NULL,             -- e.g. "attack on opponent", "vague statement"
    collected_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COLLECTION STATS (materialized view for performance)
-- ============================================================
CREATE MATERIALIZED VIEW candidate_stats AS
SELECT
    c.id AS candidate_id,
    c.display_name,
    e.country_code,
    e.name AS election_name,
    COUNT(p.id) AS total_promises,
    COUNT(p.id) FILTER (WHERE p.category = 'economy') AS promises_economy,
    COUNT(p.id) FILTER (WHERE p.category = 'education') AS promises_education,
    COUNT(p.id) FILTER (WHERE p.category = 'health') AS promises_health,
    COUNT(p.id) FILTER (WHERE p.category = 'safety') AS promises_safety,
    COUNT(p.id) FILTER (WHERE p.category = 'environment') AS promises_environment,
    COUNT(p.id) FILTER (WHERE p.category = 'social') AS promises_social,
    COUNT(p.id) FILTER (WHERE p.category = 'rights') AS promises_rights,
    COUNT(p.id) FILTER (WHERE p.category = 'infrastructure') AS promises_infrastructure,
    COUNT(p.id) FILTER (WHERE p.category = 'governance') AS promises_governance,
    MAX(p.collected_at) AS last_updated
FROM candidates c
JOIN elections e ON c.election_id = e.id
LEFT JOIN promises p ON p.candidate_id = c.id AND p.canonical_id IS NULL
GROUP BY c.id, c.display_name, e.country_code, e.name;

CREATE UNIQUE INDEX ON candidate_stats(candidate_id);

-- ============================================================
-- SAMPLE DATA (for development)
-- ============================================================

INSERT INTO countries (code, name_en, name_local, tribunal_name, tribunal_url) VALUES
('BR', 'Brazil', 'Brasil', 'Tribunal Superior Electoral', 'https://www.tse.jus.br'),
('US', 'United States', 'United States', 'Federal Election Commission', 'https://www.fec.gov'),
('DE', 'Germany', 'Deutschland', 'Bundeswahlleiter', 'https://www.bundeswahlleiter.de'),
('FR', 'France', 'France', 'Conseil Constitutionnel', 'https://www.conseil-constitutionnel.fr'),
('MX', 'Mexico', 'México', 'Instituto Nacional Electoral', 'https://www.ine.mx');
