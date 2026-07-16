-- ============================================================
-- RLS (Row Level Security) policies for ObrabiEN
-- Run AFTER migrations 001, 003.
-- The app uses the service-role key for ALL writes, so RLS
-- only guards against direct anon-key access (e.g. leaked key,
-- or future client-side Supabase usage).
-- ============================================================

-- ── Enable RLS ───────────────────────────────────────────────
ALTER TABLE maestros          ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_trabajos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE foro_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Tables created in migration 003 (run conditionally)
DO $$ BEGIN
  ALTER TABLE foro_replies   ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'foro_replies table not found — skipping RLS enable';
END $$;

DO $$ BEGIN
  ALTER TABLE notificaciones  ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'notificaciones table not found — skipping RLS enable';
END $$;

-- clientes table (may exist from manual creation)
DO $$ BEGIN
  ALTER TABLE clientes        ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'clientes table not found — skipping RLS enable';
END $$;

-- ── Public-read policies ──────────────────────────────────────
-- These tables contain public-facing data (profiles, posts, etc.)
-- Anyone with the anon key can read them; writes go through
-- service-role only (server-side routes).
--
-- NOTE: "CREATE POLICY IF NOT EXISTS" is NOT valid PostgreSQL syntax
-- (unlike CREATE TABLE). Each policy is wrapped in a DO block that
-- swallows duplicate_object instead, so the script is truly
-- idempotent and re-runnable.

DO $$ BEGIN
  CREATE POLICY "maestros_public_select"
    ON maestros FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "fotos_trabajos_public_select"
    ON fotos_trabajos FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "resenas_public_select"
    ON resenas FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "foro_posts_public_select"
    ON foro_posts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "marketplace_items_public_select"
    ON marketplace_items FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "foro_replies_public_select"
    ON foro_replies FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
         WHEN undefined_table   THEN NULL;
END $$;

-- ── Private tables — no SELECT policy (service-role only) ────
-- notificaciones: user-specific, never exposed via anon key
-- clientes:       personal data, never exposed via anon key
-- No policy needed — blank RLS blocks all non-service-role access.
