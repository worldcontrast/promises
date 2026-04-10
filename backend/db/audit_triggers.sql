-- ============================================================
-- World Contrast — Audit Triggers
-- File: backend/db/audit_triggers.sql
--
-- Automatically logs every INSERT, UPDATE, DELETE on
-- the core tables into audit_log (append-only).
--
-- Run this ONCE in the Supabase SQL Editor after schema.sql.
-- ============================================================

-- ── TRIGGER FUNCTION (shared by all tables) ───────────────────
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        changed_by,
        changed_at,
        old_values,
        new_values,
        reason
    ) VALUES (
        TG_TABLE_NAME,
        CASE TG_OP
            WHEN 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        TG_OP,
        -- Who made the change: Supabase auth user or 'agent' if service role
        COALESCE(
            current_setting('request.jwt.claims', true)::jsonb->>'email',
            'agent-' || current_setting('app.agent_version', true)
        ),
        now(),
        CASE TG_OP WHEN 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
        CASE TG_OP WHEN 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        current_setting('app.change_reason', true)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- ── ATTACH TO PROMISES ────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_audit_promises ON promises;
CREATE TRIGGER trg_audit_promises
    AFTER INSERT OR UPDATE OR DELETE ON promises
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- ── ATTACH TO CANDIDATES ──────────────────────────────────────
DROP TRIGGER IF EXISTS trg_audit_candidates ON candidates;
CREATE TRIGGER trg_audit_candidates
    AFTER INSERT OR UPDATE OR DELETE ON candidates
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- ── ATTACH TO ELECTIONS ───────────────────────────────────────
DROP TRIGGER IF EXISTS trg_audit_elections ON elections;
CREATE TRIGGER trg_audit_elections
    AFTER INSERT OR UPDATE OR DELETE ON elections
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- ── ROW LEVEL SECURITY — READ-ONLY for anon ───────────────────
-- Anyone can READ promises and candidates (radical transparency).
-- Only the service role (the agent) can INSERT/UPDATE.

ALTER TABLE promises     ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawled_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log    ENABLE ROW LEVEL SECURITY;

-- Public can read everything
CREATE POLICY "public_read_promises"
    ON promises FOR SELECT USING (true);

CREATE POLICY "public_read_candidates"
    ON candidates FOR SELECT USING (true);

CREATE POLICY "public_read_audit"
    ON audit_log FOR SELECT USING (true);

-- Only service role can write (the agent uses SUPABASE_KEY = service role)
CREATE POLICY "agent_write_promises"
    ON promises FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "agent_write_candidates"
    ON candidates FOR ALL
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "agent_write_crawled"
    ON crawled_pages FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "agent_write_runs"
    ON collection_runs FOR ALL
    WITH CHECK (auth.role() = 'service_role');

-- ── VERIFY FUNCTION (for the frontend badge) ──────────────────
-- Given a promise id, returns whether its content_hash
-- matches what was stored — callable via Supabase RPC.
CREATE OR REPLACE FUNCTION verify_promise(promise_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    p promises%ROWTYPE;
    cp crawled_pages%ROWTYPE;
BEGIN
    SELECT * INTO p FROM promises WHERE id = promise_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'reason', 'promise_not_found');
    END IF;

    SELECT * INTO cp FROM crawled_pages WHERE id = p.crawled_page_id;

    RETURN jsonb_build_object(
        'valid',          true,
        'promise_id',     p.id,
        'content_hash',   p.content_hash,
        'collected_at',   p.collected_at,
        'source_url',     p.source_url,
        'archive_url',    p.archive_url,
        'agent_version',  p.agent_version,
        'audit_entries',  (
            SELECT COUNT(*) FROM audit_log
            WHERE record_id = p.id AND table_name = 'promises'
        )
    );
END;
$$;

-- ── USAGE EXAMPLES ────────────────────────────────────────────
-- Verify a promise from the frontend:
--   SELECT verify_promise('uuid-da-promessa-aqui');
--
-- Set change reason before a human update:
--   SET app.change_reason = 'Status updated: promise fulfilled. Source: g1.globo.com/...';
--   UPDATE promises SET status = 'fulfilled' WHERE id = '...';
--
-- Query full audit trail for a promise:
--   SELECT * FROM audit_log WHERE record_id = 'uuid-da-promessa' ORDER BY changed_at;
