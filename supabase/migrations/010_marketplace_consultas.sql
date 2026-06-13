CREATE TABLE IF NOT EXISTS marketplace_consultas (
  id         uuid      DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id    uuid      NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  nombre     text      NOT NULL,
  pregunta   text      NOT NULL,
  respuesta  text,
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketplace_consultas_item_id
  ON marketplace_consultas (item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS marketplace_consultas_sin_respuesta
  ON marketplace_consultas (created_at DESC) WHERE respuesta IS NULL;

ALTER TABLE marketplace_consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consultas_select" ON marketplace_consultas
  FOR SELECT USING (true);

CREATE POLICY "consultas_insert" ON marketplace_consultas
  FOR INSERT WITH CHECK (true);
