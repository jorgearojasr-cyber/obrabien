-- Extended columns for recursos table
ALTER TABLE recursos ADD COLUMN IF NOT EXISTS contenido       text;
ALTER TABLE recursos ADD COLUMN IF NOT EXISTS video_url       text;
ALTER TABLE recursos ADD COLUMN IF NOT EXISTS pdf_url         text;
ALTER TABLE recursos ADD COLUMN IF NOT EXISTS imagenes_extra  text[] DEFAULT '{}';
ALTER TABLE recursos ADD COLUMN IF NOT EXISTS estado          text   DEFAULT 'proximamente';
