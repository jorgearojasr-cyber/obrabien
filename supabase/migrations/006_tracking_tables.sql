-- Profile visit and contact click tracking tables

CREATE TABLE IF NOT EXISTS perfil_visitas (
  id         uuid      DEFAULT gen_random_uuid() PRIMARY KEY,
  maestro_id text      NOT NULL,
  visited_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contactos_clicks (
  id         uuid      DEFAULT gen_random_uuid() PRIMARY KEY,
  maestro_id text      NOT NULL,
  clicked_at timestamp DEFAULT now()
);

-- Indexes for fast dashboard count queries
CREATE INDEX IF NOT EXISTS perfil_visitas_maestro_visited
  ON perfil_visitas (maestro_id, visited_at DESC);

CREATE INDEX IF NOT EXISTS contactos_clicks_maestro_clicked
  ON contactos_clicks (maestro_id, clicked_at DESC);

-- RLS: service-role writes only; no anon reads needed
ALTER TABLE perfil_visitas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos_clicks ENABLE ROW LEVEL SECURITY;
