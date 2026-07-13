-- Migration 017: add perfil_estado to maestros for the simplified basic-registration flow.
-- 'basico'  = created via the 4-field quick registration form.
-- 'completo' = has gone through (or already had, pre-migration) the full profile wizard.

ALTER TABLE maestros ADD COLUMN IF NOT EXISTS perfil_estado TEXT DEFAULT 'basico';

-- Backfill: maestros that already have the core fields filled in are treated as
-- 'completo' so the new basic-registration flow does not affect existing profiles.
UPDATE maestros
SET perfil_estado = 'completo'
WHERE nombre IS NOT NULL AND nombre <> ''
  AND rut IS NOT NULL AND rut <> ''
  AND telefono IS NOT NULL AND telefono <> ''
  AND especialidades IS NOT NULL AND array_length(especialidades, 1) > 0;
