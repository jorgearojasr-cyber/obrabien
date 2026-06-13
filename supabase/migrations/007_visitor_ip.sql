-- Add visitor_ip for deduplication of visits and contact clicks

ALTER TABLE perfil_visitas   ADD COLUMN IF NOT EXISTS visitor_ip text;
ALTER TABLE contactos_clicks ADD COLUMN IF NOT EXISTS visitor_ip text;

-- Indexes to make the 24-hour dedup check fast
CREATE INDEX IF NOT EXISTS perfil_visitas_dedup
  ON perfil_visitas (maestro_id, visitor_ip, visited_at DESC);

CREATE INDEX IF NOT EXISTS contactos_clicks_dedup
  ON contactos_clicks (maestro_id, visitor_ip, clicked_at DESC);
