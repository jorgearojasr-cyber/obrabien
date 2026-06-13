-- Migration 013: add referral tracking columns to maestros
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS como_llego       text;
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS referido_rut     text;
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS como_llego_otro  text;
