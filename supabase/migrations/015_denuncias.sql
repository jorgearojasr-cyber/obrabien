-- Migration 015: alertas de la comunidad (denuncias)
CREATE TABLE IF NOT EXISTS denuncias (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp DEFAULT now(),
  denunciante_clerk_id text NOT NULL,
  denunciante_nombre text NOT NULL,
  denunciado_nombre text NOT NULL,
  denunciado_rut text,
  denunciado_region text,
  descripcion text NOT NULL,
  fotos_evidencia text[] DEFAULT '{}',
  estado text DEFAULT 'pendiente',
  razon_rechazo text,
  respuesta_descargo text,
  descargo_aprobado boolean DEFAULT false,
  aprobado_por text,
  aprobado_at timestamp
);
