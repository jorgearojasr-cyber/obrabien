-- Migration 020: enforce uniqueness of rut and telefono (normalized) in maestros.
--
-- The diagnostic query run beforehand (upper(regexp_replace(rut, '[^0-9kK]', '', 'g'))
-- and regexp_replace(replace(replace(telefono, '+56', ''), ' ', ''), '[^0-9]', '', 'g'))
-- confirmed 0 duplicate rows exist today, so these indexes can be created directly
-- without a data-cleanup step.

-- ── RUT ──────────────────────────────────────────────────────────────────────
-- Strip everything except digits and K/k, uppercase. Partial index excludes
-- NULL/empty ruts so multiple incomplete profiles don't collide with each other.
CREATE UNIQUE INDEX IF NOT EXISTS idx_maestros_rut_normalizado_unique
  ON maestros (upper(regexp_replace(rut, '[^0-9kK]', '', 'g')))
  WHERE rut IS NOT NULL AND upper(regexp_replace(rut, '[^0-9kK]', '', 'g')) <> '';

-- ── Teléfono ─────────────────────────────────────────────────────────────────
-- Strip the literal "+56", spaces, then any remaining non-digit characters.
CREATE UNIQUE INDEX IF NOT EXISTS idx_maestros_telefono_normalizado_unique
  ON maestros (regexp_replace(replace(replace(telefono, '+56', ''), ' ', ''), '[^0-9]', '', 'g'))
  WHERE telefono IS NOT NULL
    AND regexp_replace(replace(replace(telefono, '+56', ''), ' ', ''), '[^0-9]', '', 'g') <> '';

-- ── Pre-check RPC ────────────────────────────────────────────────────────────
-- Lets the API check for a normalized rut/telefono conflict against a DIFFERENT
-- maestro before attempting the upsert, so it can return a clear 409 message
-- instead of surfacing the raw unique-violation (23505) from the indexes above.
-- Uses the exact same normalization expressions as the indexes, so there's a
-- single definition of "duplicate" shared by the constraint and the app check.
CREATE OR REPLACE FUNCTION check_maestro_duplicado(
  p_clerk_user_id text,
  p_rut text,
  p_telefono text
)
RETURNS TABLE (campo text, clerk_user_id text) AS $$
  SELECT 'rut'::text, m.clerk_user_id
  FROM maestros m
  WHERE m.clerk_user_id <> p_clerk_user_id
    AND p_rut IS NOT NULL
    AND upper(regexp_replace(p_rut, '[^0-9kK]', '', 'g')) <> ''
    AND upper(regexp_replace(m.rut, '[^0-9kK]', '', 'g')) = upper(regexp_replace(p_rut, '[^0-9kK]', '', 'g'))

  UNION ALL

  SELECT 'telefono'::text, m.clerk_user_id
  FROM maestros m
  WHERE m.clerk_user_id <> p_clerk_user_id
    AND p_telefono IS NOT NULL
    AND regexp_replace(replace(replace(p_telefono, '+56', ''), ' ', ''), '[^0-9]', '', 'g') <> ''
    AND regexp_replace(replace(replace(m.telefono, '+56', ''), ' ', ''), '[^0-9]', '', 'g')
      = regexp_replace(replace(replace(p_telefono, '+56', ''), ' ', ''), '[^0-9]', '', 'g');
$$ LANGUAGE sql STABLE;
