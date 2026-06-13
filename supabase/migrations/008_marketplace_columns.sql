-- Extend marketplace_items with columns needed by the publish form

ALTER TABLE marketplace_items ALTER COLUMN clerk_user_id DROP NOT NULL;

ALTER TABLE marketplace_items ADD COLUMN IF NOT EXISTS categoria    text;
ALTER TABLE marketplace_items ADD COLUMN IF NOT EXISTS region       text;
ALTER TABLE marketplace_items ADD COLUMN IF NOT EXISTS precio_unit  text DEFAULT 'unidad';
ALTER TABLE marketplace_items ADD COLUMN IF NOT EXISTS plan         text DEFAULT 'gratis';
ALTER TABLE marketplace_items ADD COLUMN IF NOT EXISTS whatsapp     text;
ALTER TABLE marketplace_items ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE marketplace_items ADD COLUMN IF NOT EXISTS activo       boolean DEFAULT true;

CREATE INDEX IF NOT EXISTS marketplace_items_activo_created
  ON marketplace_items (activo, created_at DESC);
