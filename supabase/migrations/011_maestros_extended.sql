-- Extended columns for the maestros table.
-- All statements use IF NOT EXISTS so this migration is safe to re-run.

ALTER TABLE maestros ADD COLUMN IF NOT EXISTS anos_experiencia       INTEGER;
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS atiende_urgencias      BOOLEAN  DEFAULT false;
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS especialidades_urgencia TEXT[]   DEFAULT '{}';
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS social                 JSONB;
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS rut                    TEXT;
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS dias_disponibles       TEXT[]   DEFAULT '{}';
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS formas_pago            TEXT[]   DEFAULT '{}';
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS modalidad_cobro        TEXT[]   DEFAULT '{}';
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS frase_destacada        TEXT;
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS verificacion_estado    TEXT     DEFAULT 'sin_enviar';
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS cedula_frente          TEXT;
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS cedula_reverso         TEXT;
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS selfie_cedula          TEXT;
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS disponibilidad         TEXT     DEFAULT 'disponible';
