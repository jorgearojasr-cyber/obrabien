-- Migration 024: solicitud_mensajes — hilo de respuesta del maestro (Sprint 21, JOB-038/040).
--
-- Forma documentada como punto de extensión desde la migración 023 (Sprint 17,
-- JOB-014) — se crea ahora tal cual se dejó anotada, sin cambios: un hilo por
-- destinatario (no uno por solicitud completa), consistente con que cada
-- maestro tiene su propio ciclo de vida independiente frente al cliente.

CREATE TABLE IF NOT EXISTS solicitud_mensajes (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_destinatario_id UUID NOT NULL REFERENCES solicitud_destinatarios(id) ON DELETE CASCADE,
  autor_tipo                TEXT NOT NULL,
  autor_clerk_user_id       TEXT NOT NULL,
  texto                     TEXT NOT NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_solicitud_mensajes_autor_tipo CHECK (autor_tipo IN ('cliente', 'maestro'))
);

CREATE INDEX IF NOT EXISTS idx_solicitud_mensajes_destinatario
  ON solicitud_mensajes(solicitud_destinatario_id, created_at);

-- Mismo criterio que solicitudes/solicitud_destinatarios/solicitud_archivos
-- (migración 023): información privada entre un cliente y un maestro
-- puntual, no un tablero público. RLS habilitado sin políticas — solo el
-- service-role (usado exclusivamente server-side vía getSupabaseAdmin())
-- puede leer o escribir. El control de acceso real (cada maestro ve
-- únicamente su propio hilo) se aplica en las rutas de la app.
ALTER TABLE solicitud_mensajes ENABLE ROW LEVEL SECURITY;
