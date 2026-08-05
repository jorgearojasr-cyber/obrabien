// TrustEngine — Sistema de Confianza de ObraBien.
//
// Diseño funcional: Sprints 09–11 (inventario de señales, dimensiones y
// niveles, arquitectura funcional). Implementación: Sprint 12 (infraestructura,
// sin consumidores) y Sprint 13 (TRUST-010 a TRUST-014 — primer consumidor
// real: el Perfil del Maestro, más los campos que dejan de ser aproximados).
//
// ENTRADA
//   getTrustResult(master: Master) — recibe exactamente un objeto Master
//   (src/lib/data.ts), el mismo tipo que ya construyen buscar/page.tsx,
//   src/app/page.tsx y maestro/[id]/page.tsx.
//   Desde el Sprint 13, Master admite dos campos opcionales adicionales
//   (perfilEstado, fotosCount) que esta fase solo puebla maestro/[id]/page.tsx
//   — ver "Límites conocidos" abajo.
//
// SALIDA — TrustResult, sin números en ningún campo (CONF-007):
//   - level / levelLabel: uno de los 5 niveles del Sprint 10.
//   - dimensions: Identidad / Perfil / Reputación / Actividad (CONF-006),
//     cada una con un status y un summary en texto llano. Pensado para la
//     vista del maestro en su propio dashboard (CONF-012) — el summary es
//     honesto, no solo positivo.
//   - fortalezas: subconjunto solo-positivo, pensado para el perfil público
//     de cara al cliente (CONF-011) — nunca incluye una señal negativa u
//     omitida, esa dimensión simplemente no aparece en la lista.
//   - recomendaciones: lista de acciones concretas y accionables, pensada
//     para el dashboard del maestro (extensión natural del consejo único de
//     PANEL-007, pero aquí puede haber más de uno a la vez). Sin consumidor
//     todavía (TRUST-013: "no mostrar recomendaciones por ahora").
//
// RESPONSABILIDAD
//   Única fuente de verdad para calcular confianza (TRUST-003). Ningún
//   componente debe reimplementar esta lógica — deben importar y consumir
//   getTrustResult(). Las funciones internas de este archivo no se exportan
//   a propósito, para que no se puedan usar señales sueltas fuera de aquí.
//
// LÍMITES CONOCIDOS DE ESTA FASE (declarados, no resueltos en este sprint)
//   Master todavía no expone:
//     - estado de verificación granular (pendiente/rechazado) — se evaluó
//       agregarlo en el Sprint 13 (TRUST-010) y se descartó: `verified`
//       (boolean) ya es un dato real, no una aproximación, y el motor no
//       necesita más granularidad para decidir "fuerte"/"sin_datos" hoy.
//     - cantidad de comunas cubiertas (Master solo trae `sector` como texto).
//   perfilEstado y fotosCount (agregados en el Sprint 13) solo los puebla
//   maestro/[id]/page.tsx — buscar/page.tsx y src/app/page.tsx siguen sin
//   tocarse (fuera de alcance de ese sprint), así que para esos dos orígenes
//   el motor sigue cayendo en la aproximación por riqueza de campos.
//
// PUNTOS FUTUROS DE EXTENSIÓN
//   1. Poblar perfilEstado y fotosCount también en buscar/page.tsx y
//      src/app/page.tsx — mismo cambio ya hecho en maestro/[id]/page.tsx,
//      solo falta replicarlo para que Home y Buscar dejen la aproximación.
//   2. Dashboard (dashboard/maestro/page.tsx) no construye un Master hoy —
//      trabaja directo sobre el `row` de Supabase. Para consumir este motor
//      sin duplicar lógica, deberá mapear su `row` ya cargado a un objeto
//      compatible con Master antes de llamar a getTrustResult() — mapeo de
//      campos, no una segunda implementación de las reglas.
//   3. Mover el cálculo de Server (por request, como hoy) a una query
//      agregada o campo persistido, si el volumen lo justifica — ver
//      CONF-003 (Sprint 09). El contrato de salida (TrustResult) no cambia
//      con esa migración.
//   4. Badges visuales, orden/ranking y filtros por nivel — explícitamente
//      fuera de alcance hasta un sprint futuro aprobado (TRUST-005).

import type { Master } from "@/lib/data";

export type TrustLevel =
  | "excelente"
  | "muy_confiable"
  | "confiable"
  | "en_desarrollo"
  | "perfil_basico";

export const TRUST_LEVEL_LABELS: Record<TrustLevel, string> = {
  excelente: "Excelente",
  muy_confiable: "Muy confiable",
  confiable: "Confiable",
  en_desarrollo: "En desarrollo",
  perfil_basico: "Perfil básico",
};

export type TrustDimensionKey = "identidad" | "perfil" | "reputacion" | "actividad";

export type TrustDimensionStatus = "fuerte" | "en_desarrollo" | "sin_datos";

export interface TrustDimension {
  key: TrustDimensionKey;
  label: string;
  status: TrustDimensionStatus;
  /** Texto llano, honesto (no solo positivo) — pensado para el dashboard del maestro. */
  summary: string;
}

export interface TrustResult {
  level: TrustLevel;
  levelLabel: string;
  dimensions: TrustDimension[];
  /** Solo bullets positivos — pensado para mostrarse al cliente (CONF-011). */
  fortalezas: string[];
  /** Acciones concretas para subir de nivel — pensado para el dashboard del maestro. */
  recomendaciones: string[];
}

function evaluarIdentidad(m: Master): TrustDimension {
  const status: TrustDimensionStatus = m.verified ? "fuerte" : "sin_datos";
  return {
    key: "identidad",
    label: "Identidad",
    status,
    summary: m.verified
      ? "Identidad verificada por el equipo de ObraBien."
      : "Identidad aún no verificada.",
  };
}

// TRUST-010/011 (Sprint 13): cuando `perfilEstado` viene poblado (hoy solo
// desde maestro/[id]/page.tsx), es la fuente de verdad real — reemplaza la
// aproximación por riqueza de campos usada en Sprint 12. `perfil_estado` es
// el techo que exige CONF-009 (principio 2: no premiar perfiles no
// aprobados), así que solo "completo" cuenta como "fuerte"; "básico" (sin
// wizard completado) es tan vacío como no tener datos; "pendiente_revision" y
// "rechazado" quedan en "en_desarrollo" — tienen contenido real, pero no
// deben alcanzar los niveles altos, que exigen perfil "fuerte".
function evaluarPerfil(m: Master): TrustDimension {
  if (m.perfilEstado) {
    const status: TrustDimensionStatus =
      m.perfilEstado === "completo" ? "fuerte" : m.perfilEstado === "basico" ? "sin_datos" : "en_desarrollo";
    const summary =
      status === "fuerte"
        ? "Perfil completo y aprobado por el equipo de ObraBien."
        : status === "en_desarrollo"
        ? "Perfil con información cargada, pendiente de aprobación."
        : "Perfil recién iniciado, con poca información aún.";
    return { key: "perfil", label: "Perfil", status, summary };
  }

  // Aproximación (Sprint 12) — para orígenes que todavía no pueblan perfilEstado.
  const senalesOpcionales = [
    !!m.description && m.description.trim().length > 20,
    !!m.paymentMethods && m.paymentMethods.length > 0,
    !!m.social && Object.values(m.social).some(Boolean),
    !!m.quote,
  ];
  const riqueza = senalesOpcionales.filter(Boolean).length;

  let status: TrustDimensionStatus;
  if (!m.photoUrl) {
    status = riqueza > 0 ? "en_desarrollo" : "sin_datos";
  } else if (riqueza >= 3) {
    status = "fuerte";
  } else {
    status = "en_desarrollo";
  }

  const summary =
    status === "fuerte"
      ? "Perfil con información completa (foto, descripción y datos de contacto)."
      : status === "en_desarrollo"
      ? "Perfil con información parcial — se puede completar más."
      : "Perfil recién iniciado, con poca información aún.";

  return { key: "perfil", label: "Perfil", status, summary };
}

function evaluarReputacion(m: Master): TrustDimension {
  let status: TrustDimensionStatus;
  if (m.jobs === 0) status = "sin_datos";
  else if (m.jobs >= 3 && m.rating >= 4) status = "fuerte";
  else status = "en_desarrollo";

  const summary =
    status === "fuerte"
      ? `Buena calificación con ${m.jobs} reseñas de clientes.`
      : status === "en_desarrollo"
      ? `Reputación en construcción (${m.jobs} reseña${m.jobs === 1 ? "" : "s"}).`
      : "Aún sin reseñas de clientes.";

  return { key: "reputacion", label: "Reputación", status, summary };
}

function mesesDesde(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 30));
}

function evaluarActividad(m: Master): TrustDimension {
  if (!m.disponibilidad) {
    return { key: "actividad", label: "Actividad", status: "sin_datos", summary: "Sin datos de actividad." };
  }

  const disponible = m.disponibilidad === "disponible";
  const antiguo = m.createdAt ? mesesDesde(m.createdAt) >= 6 : false;
  const tieneReferidos = (m.referidosCount ?? 0) > 0;

  const status: TrustDimensionStatus =
    disponible && (antiguo || tieneReferidos) ? "fuerte" : "en_desarrollo";

  const partes: string[] = [disponible ? "Disponible actualmente" : "No disponible por ahora"];
  if (m.atiendeUrgencias) partes.push("atiende urgencias");
  if (tieneReferidos) partes.push("recibió referidos de otros maestros");

  return { key: "actividad", label: "Actividad", status, summary: partes.join(", ") + "." };
}

// Cascada de reglas simples (mismo enfoque que PANEL-007, sin IA ni puntajes)
// — codifica directamente los principios del Sprint 10 (CONF-009): "perfil"
// fuerte es requisito para cualquier nivel por sobre "en_desarrollo", e
// "identidad" fuerte es requisito para "excelente". La ausencia de datos
// nunca produce un nivel peor que "en_desarrollo" (no perjudicar a nuevos).
function calcularNivel(byKey: Record<TrustDimensionKey, TrustDimension>): TrustLevel {
  const identidadFuerte = byKey.identidad.status === "fuerte";
  const perfilFuerte = byKey.perfil.status === "fuerte";
  const perfilConDatos = byKey.perfil.status !== "sin_datos";
  const reputacionFuerte = byKey.reputacion.status === "fuerte";
  const reputacionConDatos = byKey.reputacion.status !== "sin_datos";
  const actividadConDatos = byKey.actividad.status !== "sin_datos";

  const todoSinDatos =
    byKey.identidad.status === "sin_datos" &&
    byKey.perfil.status === "sin_datos" &&
    byKey.reputacion.status === "sin_datos" &&
    byKey.actividad.status === "sin_datos";

  if (todoSinDatos) return "perfil_basico";
  if (identidadFuerte && perfilFuerte && reputacionFuerte) return "excelente";
  if (identidadFuerte && perfilFuerte && (reputacionConDatos || actividadConDatos)) return "muy_confiable";
  if (perfilFuerte && reputacionConDatos) return "confiable";
  if (perfilConDatos || reputacionConDatos || actividadConDatos) return "en_desarrollo";
  return "perfil_basico";
}

function construirFortalezas(m: Master, byKey: Record<TrustDimensionKey, TrustDimension>): string[] {
  const f: string[] = [];
  if (byKey.identidad.status === "fuerte") f.push("Identidad verificada");
  if (byKey.perfil.status === "fuerte") f.push("Perfil completo");
  if (byKey.reputacion.status === "fuerte") f.push("Excelente reputación");
  else if (byKey.reputacion.status === "en_desarrollo" && m.jobs > 0) f.push("Buena reputación");
  if (m.disponibilidad === "disponible") f.push("Disponible actualmente");
  if (m.atiendeUrgencias) f.push("Atiende urgencias");
  if ((m.referidosCount ?? 0) > 0) f.push("Recomendado por otros maestros");
  if ((m.fotosCount ?? 0) > 0) f.push("Galería de trabajos realizados");
  return f;
}

function construirRecomendaciones(m: Master): string[] {
  const r: string[] = [];
  if (!m.photoUrl) r.push("Agrega una foto de perfil.");
  if (!m.description || m.description.trim().length <= 20) r.push("Agrega una descripción de tu trabajo.");
  if (m.jobs === 0) r.push("Pide a tus clientes que dejen una reseña.");
  if (!m.verified) r.push("Verifica tu identidad.");
  if (!m.paymentMethods || m.paymentMethods.length === 0) r.push("Indica tus formas de pago aceptadas.");
  if (!m.social || !Object.values(m.social).some(Boolean)) r.push("Agrega tus redes sociales o WhatsApp.");
  return r;
}

export function getTrustResult(master: Master): TrustResult {
  const dimensions: TrustDimension[] = [
    evaluarIdentidad(master),
    evaluarPerfil(master),
    evaluarReputacion(master),
    evaluarActividad(master),
  ];
  const byKey = Object.fromEntries(dimensions.map(d => [d.key, d])) as Record<TrustDimensionKey, TrustDimension>;
  const level = calcularNivel(byKey);

  return {
    level,
    levelLabel: TRUST_LEVEL_LABELS[level],
    dimensions,
    fortalezas: construirFortalezas(master, byKey),
    recomendaciones: construirRecomendaciones(master),
  };
}
