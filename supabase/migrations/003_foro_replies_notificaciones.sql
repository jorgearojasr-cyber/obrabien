CREATE TABLE IF NOT EXISTS foro_replies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES foro_posts(id) ON DELETE CASCADE,
  clerk_user_id text,
  autor_nombre text NOT NULL,
  autor_rol text NOT NULL DEFAULT 'cliente',
  autor_especialidad text,
  contenido text NOT NULL,
  votos_utiles int DEFAULT 0,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notificaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  tipo text NOT NULL,
  mensaje text NOT NULL,
  link text,
  leida boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_foro_replies_post_id ON foro_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_user_id ON notificaciones(user_id, leida);
