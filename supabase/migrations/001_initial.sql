CREATE TABLE maestros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  nombre TEXT,
  rut TEXT,
  telefono TEXT,
  whatsapp BOOLEAN DEFAULT true,
  foto_url TEXT,
  descripcion TEXT,
  especialidades TEXT[],
  ciudades TEXT[],
  horarios JSONB,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fotos_trabajos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  maestro_id UUID REFERENCES maestros(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE resenas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  maestro_id UUID REFERENCES maestros(id) ON DELETE CASCADE,
  cliente_nombre TEXT,
  calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE foro_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  categoria TEXT,
  tags TEXT[],
  quien_responde TEXT DEFAULT 'todos',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE marketplace_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  precio INTEGER,
  tipo TEXT,
  foto_url TEXT,
  ciudad TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
