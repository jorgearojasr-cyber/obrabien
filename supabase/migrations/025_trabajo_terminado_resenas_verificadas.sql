-- Migration 025: cierre del trabajo + reseñas verificadas (Sprint 24, JOB-054/055/056).
--
-- JOB-054: nuevo estado de solicitud ("trabajo_terminado") y su fecha de
-- finalización. Postgres no permite alterar los valores de un CHECK
-- existente in place — se elimina y se vuelve a crear con el valor nuevo
-- agregado al final, sin tocar ninguno de los siete valores ya usados en
-- producción desde la migración 023.
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS finalizada_at TIMESTAMPTZ;

ALTER TABLE solicitudes DROP CONSTRAINT IF EXISTS chk_solicitudes_estado;
ALTER TABLE solicitudes ADD CONSTRAINT chk_solicitudes_estado CHECK (estado IN (
  'borrador', 'enviada', 'en_conversacion', 'con_propuesta',
  'cerrada_asignado', 'cerrada_sin_resultado', 'cancelada', 'trabajo_terminado'
));

-- JOB-056: vincular la reseña a la solicitud que la originó — extensión
-- mínima de la tabla ya existente (`resenas`, ver comentario de esquema en
-- src/app/api/resenas/route.ts), sin tabla nueva. Nullable a propósito: las
-- reseñas del flujo libre histórico (sin Solicitud detrás) siguen sin tener
-- este dato y no se tocan.
ALTER TABLE resenas ADD COLUMN IF NOT EXISTS solicitud_id UUID REFERENCES solicitudes(id) ON DELETE SET NULL;

-- Decisión de producto explícita para este sprint: el modelo de reseñas
-- evoluciona a "una reseña verificada por trabajo (solicitud) terminado",
-- reemplazando la vieja regla "una reseña por (maestro, cliente) para
-- siempre". Se agrega la restricción nueva...
CREATE UNIQUE INDEX IF NOT EXISTS resenas_solicitud_unique
  ON resenas (solicitud_id) WHERE solicitud_id IS NOT NULL;

-- ...y se elimina la vieja, que en caso contrario bloquearía una reseña
-- verificada legítima si ese mismo cliente ya había dejado alguna vez una
-- reseña libre (no verificada) para el mismo maestro. Las reseñas ya
-- existentes NO se tocan ni se migran — conviven tal cual con las nuevas
-- reseñas verificadas (dato histórico, sin solicitud_id).
DROP INDEX IF EXISTS resenas_user_maestro_unique;
