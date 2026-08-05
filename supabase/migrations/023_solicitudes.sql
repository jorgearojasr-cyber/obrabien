-- Migration 023: módulo "Solicitud de Trabajo" — infraestructura base (Sprint 17, JOB-011).
--
-- Diseño funcional: Sprints 15-16. Un cliente crea UNA solicitud y la dirige a
-- uno o varios maestros; cada maestro recibe su propia copia con su propio
-- ciclo de vida independiente (solicitud_destinatarios) — un envío, N
-- entregas, cada una con su propio estado (igual que un correo con varios
-- destinatarios).
--
-- A diferencia de empleos/empleos_postulaciones (sin migración propia, sin
-- FKs reales, maestro_id como texto suelto — ver Sprints 15-16), este módulo
-- referencia maestros(id) con una FK real: es una mejora deliberada pedida
-- explícitamente en este sprint (JOB-011: "claves foráneas donde
-- corresponda"), no una reinterpretación del alcance.
--
-- Campos de contenido (titulo/descripcion/especialidad/region/comuna) quedan
-- NULLABLE a propósito: una fila en estado 'borrador' puede existir con muy
-- poca información (el cliente recién empezó el formulario de varios pasos —
-- ver JOB-002, Sprint 15). Qué campos son obligatorios para pasar de
-- 'borrador' a 'enviada' es una regla de negocio, no una restricción de
-- esquema — se valida en src/lib/solicitudes.ts, mismo criterio que ya usa
-- el resto del proyecto (ej. las funciones validate() de completar-perfil,
-- no CHECKs de base de datos).
--
-- Las conversaciones (mensajes por destinatario) quedan fuera de esta fase a
-- propósito (JOB-014) — ver el bloque comentado al final con el punto de
-- extensión documentado, sin crear la tabla todavía.

-- ── solicitudes ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS solicitudes (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identidad de Clerk del cliente. Sin FK a `clientes`: no todo cliente
  -- autenticado tiene una fila ahí (mismo criterio que notificaciones.user_id
  -- y foro_posts.clerk_user_id en el resto del proyecto).
  cliente_clerk_user_id  TEXT NOT NULL,
  titulo                 TEXT,
  descripcion            TEXT,
  especialidad           TEXT,
  region                 TEXT,
  comuna                 TEXT,
  estado                 TEXT NOT NULL DEFAULT 'borrador',
  maestro_asignado_id    UUID REFERENCES maestros(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  enviada_at             TIMESTAMPTZ,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_solicitudes_estado CHECK (estado IN (
    'borrador', 'enviada', 'en_conversacion', 'con_propuesta',
    'cerrada_asignado', 'cerrada_sin_resultado', 'cancelada'
  ))
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_cliente ON solicitudes(cliente_clerk_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado  ON solicitudes(estado);

-- Reutiliza el trigger genérico creado en la migración 019 ("so other tables
-- can adopt it later") en vez de duplicar la función.
DROP TRIGGER IF EXISTS trg_solicitudes_updated_at ON solicitudes;
CREATE TRIGGER trg_solicitudes_updated_at
  BEFORE UPDATE ON solicitudes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ── solicitud_destinatarios ─────────────────────────────────────────────────
-- Una fila por maestro elegido. A diferencia de `solicitudes`, aquí los
-- campos SÍ son NOT NULL: un destinatario solo se crea en el momento de
-- enviar (nunca existe "a medias").
CREATE TABLE IF NOT EXISTS solicitud_destinatarios (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id   UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  maestro_id     UUID NOT NULL REFERENCES maestros(id)    ON DELETE CASCADE,
  estado         TEXT NOT NULL DEFAULT 'enviado',
  vista_at       TIMESTAMPTZ,
  respondida_at  TIMESTAMPTZ,
  resuelta_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_solicitud_destinatarios_estado CHECK (estado IN (
    'enviado', 'vista', 'respondida', 'aceptada', 'rechazada', 'expirada', 'no_seleccionado'
  )),
  -- Evita que el mismo maestro quede agregado dos veces a la misma solicitud.
  CONSTRAINT uq_solicitud_destinatarios_solicitud_maestro UNIQUE (solicitud_id, maestro_id)
);

CREATE INDEX IF NOT EXISTS idx_solicitud_destinatarios_solicitud ON solicitud_destinatarios(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_destinatarios_maestro   ON solicitud_destinatarios(maestro_id, estado);

-- ── solicitud_archivos ───────────────────────────────────────────────────────
-- Fotos del trabajo a realizar, asociadas a la solicitud completa (no a un
-- destinatario particular) — describen el problema, no la conversación con
-- un maestro específico (ver JOB-006, Sprint 16).
CREATE TABLE IF NOT EXISTS solicitud_archivos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id  UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  descripcion   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitud_archivos_solicitud ON solicitud_archivos(solicitud_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Mismo criterio que notificaciones/clientes (ver migración 005): esta es
-- información privada entre un cliente y los maestros que eligió, no un
-- tablero público como marketplace_consultas/foro_posts. Se habilita RLS y NO
-- se agrega ninguna política — solo el service-role (usado exclusivamente
-- server-side vía getSupabaseAdmin()) puede leer o escribir. El control de
-- acceso real (el cliente ve solo lo suyo, el maestro ve solo lo dirigido a
-- él) se aplica en las rutas de la app, igual que en el resto del proyecto.
ALTER TABLE solicitudes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitud_destinatarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitud_archivos      ENABLE ROW LEVEL SECURITY;

-- ── Punto de extensión futuro: conversaciones (JOB-014, NO implementado aquí) ─
-- Cuando se aborde el sprint de conversaciones, `solicitud_mensajes` seguirá
-- esta forma (documentada, no creada):
--
--   CREATE TABLE solicitud_mensajes (
--     id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     solicitud_destinatario_id   UUID NOT NULL REFERENCES solicitud_destinatarios(id) ON DELETE CASCADE,
--     autor_tipo                  TEXT NOT NULL CHECK (autor_tipo IN ('cliente', 'maestro')),
--     autor_clerk_user_id         TEXT NOT NULL,
--     texto                       TEXT NOT NULL,
--     created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
--   );
--
-- Un hilo por destinatario (no uno por solicitud completa), consistente con
-- que cada maestro tiene su propio ciclo de vida independiente. No requiere
-- ningún cambio en las 3 tablas de esta migración — solicitud_destinatarios.id
-- ya es la FK que esa tabla futura va a necesitar.
