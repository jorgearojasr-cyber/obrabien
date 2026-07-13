-- Migration 018: add rechazo_motivo to maestros.
-- Free-text reason shown to the maestro when perfil_estado = 'rechazado'.

ALTER TABLE maestros ADD COLUMN IF NOT EXISTS rechazo_motivo TEXT;
