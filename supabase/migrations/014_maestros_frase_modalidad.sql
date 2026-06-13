-- Migration 014: ensure frase_destacada and modalidad_cobro columns exist
-- Safe to re-run; both were added in 011 but may be missing in some environments.
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS frase_destacada TEXT;
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS modalidad_cobro TEXT[] DEFAULT '{}';
