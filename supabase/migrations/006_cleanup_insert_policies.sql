-- ============================================================
-- Migration 006: cleanup de políticas RLS de escritura pública.
-- (Ya aplicada manualmente en Supabase el 16-jul-2026 — este
-- archivo la versiona para que el repo documente el estado real.)
--
-- HALLAZGO: existían políticas de INSERT con roles {public} y
-- WITH CHECK (true) en maestros, clientes, foro_posts,
-- fotos_trabajos, marketplace_items y resenas — creadas a mano
-- en el dashboard como workaround temporal el 27-28 de mayo de
-- 2026, cuando las escrituras de la app usaban la key anon y
-- chocaban contra RLS (ver commits 769b0cd → 004686b, donde las
-- escrituras migraron a service-role). El workaround nunca se
-- limpió: cualquiera con la key anon (pública, viaja en el HTML
-- del sitio) podía insertar filas directamente en la base,
-- bypasseando TODA la validación de la app (RUT, dedup, T&C,
-- rate limits, moderación). En clientes, además, exponía datos
-- personales vía una política de lectura.
--
-- Ninguna migración versionada creó esas políticas — por eso
-- este cleanup es name-agnóstico (itera pg_policies) en vez de
-- DROP POLICY con nombres literales. Es idempotente: re-correrlo
-- sobre un estado ya limpio no hace nada.
--
-- Diseño resultante (el documentado en 005_rls_policies.sql):
--   * Tablas públicas → solo SELECT público; escrituras
--     exclusivamente vía service-role (endpoints /api/*).
--   * clientes → SIN políticas: privada, solo service-role.
-- ============================================================

-- ── (a) Tablas públicas: eliminar toda política que NO sea SELECT ──
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('maestros','foro_posts','fotos_trabajos',
                        'marketplace_items','resenas')
      AND cmd <> 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
    RAISE NOTICE 'Eliminada: % en %.%', p.policyname, p.schemaname, p.tablename;
  END LOOP;
END $$;

-- ── (b) clientes: eliminar TODAS las políticas (tabla privada) ──
-- Datos personales — ninguna política significa que con RLS
-- habilitado (ver 005) la key anon no puede leer ni escribir nada;
-- solo el service-role del backend accede.
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'clientes'
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
    RAISE NOTICE 'Eliminada: % en %.%', p.policyname, p.schemaname, p.tablename;
  END LOOP;
END $$;

-- ── Verificación (solo lectura) ─────────────────────────────────
-- Esperado: solo políticas cmd = SELECT en las 5 tablas públicas,
-- y CERO filas para clientes.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('maestros','clientes','foro_posts','fotos_trabajos',
                    'marketplace_items','resenas')
ORDER BY tablename, policyname;
