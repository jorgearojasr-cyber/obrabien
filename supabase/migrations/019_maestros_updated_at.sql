-- Migration 019: add updated_at to maestros, kept fresh automatically via trigger.
-- No table in this project had an updated_at/trigger pattern yet — this establishes one
-- with a reusable trigger function so other tables can adopt it later.

ALTER TABLE maestros ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_maestros_updated_at ON maestros;
CREATE TRIGGER trg_maestros_updated_at
  BEFORE UPDATE ON maestros
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
