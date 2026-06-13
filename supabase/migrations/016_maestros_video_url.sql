-- Migration 016: add video_url to maestros
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS video_url text;
