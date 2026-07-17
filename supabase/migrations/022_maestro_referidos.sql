-- Migration 022: sistema de referidos de maestros (sin componente de rifa).
--
-- Separa dos eventos: (1) ATRIBUCIÓN — quién refirió a quién, se fija apenas
-- el maestro nuevo guarda el wizard con un RUT de referente válido, inmutable
-- desde ese momento; (2) CRÉDITO — la fila en maestro_referidos que hace
-- subir el contador del referente, se crea SOLO cuando el referido llega a
-- perfil_estado = 'completo' (la única acción que pone ese estado es
-- "Aprobar" en /api/admin/revisar-perfil).
--
-- Sin backfill: el sistema arranca en cero. Los referido_rut de texto libre
-- existentes quedan sin tocar, como registro histórico manual únicamente.

-- ── Tabla de crédito ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maestro_referidos (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id           UUID NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,        -- quien refiere (gana el crédito)
  referido_maestro_id  UUID NOT NULL REFERENCES maestros(id) ON DELETE CASCADE UNIQUE, -- quien se registró
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_referidos_no_autorreferido CHECK (maestro_id <> referido_maestro_id)
);

CREATE INDEX IF NOT EXISTS idx_maestro_referidos_maestro_id ON maestro_referidos(maestro_id);

-- ── Columna de atribución ────────────────────────────────────────────────────
ALTER TABLE maestros ADD COLUMN IF NOT EXISTS referido_por_maestro_id UUID REFERENCES maestros(id) ON DELETE SET NULL;

-- ALTER TABLE ... ADD CONSTRAINT no soporta IF NOT EXISTS en PostgreSQL (mismo
-- problema que ya vimos con CREATE POLICY) — se envuelve en DO/EXCEPTION para
-- que el script sea re-corrible sin fallar si ya existe.
DO $$ BEGIN
  ALTER TABLE maestros ADD CONSTRAINT chk_maestros_no_autorreferido
    CHECK (referido_por_maestro_id IS NULL OR referido_por_maestro_id <> id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Atribución: fija referido_por_maestro_id si aún no tiene uno ────────────
-- Llamada desde update-profile/route.ts tras cada upsert exitoso. NO otorga
-- crédito — eso lo hace acreditar_referido() al momento de la aprobación.
CREATE OR REPLACE FUNCTION procesar_referido(
  p_maestro_id   uuid,
  p_referido_rut text
)
RETURNS uuid AS $$  -- retorna el id del referente si se atribuyó (o ya existía), o NULL
DECLARE
  v_referente_id uuid;
  v_ya_tiene     uuid;
BEGIN
  SELECT referido_por_maestro_id INTO v_ya_tiene FROM maestros WHERE id = p_maestro_id;
  IF v_ya_tiene IS NOT NULL THEN
    RETURN v_ya_tiene;  -- inmutable: ya tenía referente, no se toca
  END IF;

  IF p_referido_rut IS NULL OR trim(p_referido_rut) = '' THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_referente_id
  FROM maestros
  WHERE upper(regexp_replace(rut, '[^0-9kK]', '', 'g'))
      = upper(regexp_replace(p_referido_rut, '[^0-9kK]', '', 'g'))
    AND id <> p_maestro_id  -- auto-referido, ignorar
  LIMIT 1;

  IF v_referente_id IS NULL THEN
    RETURN NULL;  -- rut no encontrado o autoreferido — no rompe nada, no atribuye
  END IF;

  UPDATE maestros SET referido_por_maestro_id = v_referente_id WHERE id = p_maestro_id;
  RETURN v_referente_id;
END;
$$ LANGUAGE plpgsql;

-- ── Crédito: crea la fila en maestro_referidos si corresponde ──────────────
-- Llamada SOLO desde revisar-perfil/route.ts cuando accion = 'aprobar', tras
-- confirmar el update de perfil_estado a 'completo'. Idempotente: si ya se
-- acreditó (p.ej. reaprobación tras un ciclo de rechazo/reenvío), el
-- ON CONFLICT no hace nada.
CREATE OR REPLACE FUNCTION acreditar_referido(p_maestro_id uuid)
RETURNS void AS $$
DECLARE
  v_referente_id uuid;
BEGIN
  SELECT referido_por_maestro_id INTO v_referente_id FROM maestros WHERE id = p_maestro_id;
  IF v_referente_id IS NULL THEN
    RETURN;  -- este maestro no fue referido por nadie
  END IF;

  INSERT INTO maestro_referidos (maestro_id, referido_maestro_id)
  VALUES (v_referente_id, p_maestro_id)
  ON CONFLICT (referido_maestro_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
