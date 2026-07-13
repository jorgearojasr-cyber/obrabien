-- Migration 021: track Terms & Conditions acceptance on maestros.
-- terminos_aceptados    = whether the maestro checked the mandatory T&C box on signup.
-- terminos_aceptados_at = when they did (NULL for rows created before this feature).

ALTER TABLE maestros ADD COLUMN IF NOT EXISTS terminos_aceptados BOOLEAN DEFAULT false;
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS terminos_aceptados_at TIMESTAMPTZ;
