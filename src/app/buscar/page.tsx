export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { type Master } from "@/lib/data";
import BuscarContent from "./_content";

// ── Metadata ───────────────────────────────────────────────────────────────────
// El filtrado real sigue siendo 100% client-side (_content.tsx via
// useSearchParams) — el HTML no cambia según estos params. Esto solo ajusta
// el <title>/<meta description> que Google muestra en resultados de
// búsqueda cuando alguien comparte/indexa un link con filtros, sin
// necesitar rediseñar el filtrado a server-side.
type BuscarSearchParams = { esp?: string; ciudad?: string; region?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BuscarSearchParams>;
}): Promise<Metadata> {
  const params  = await searchParams;
  const esp     = params.esp?.trim();
  const ciudad  = params.ciudad?.trim() || params.region?.trim();

  if (!esp && !ciudad) {
    return {
      title: "Buscar Maestros en Chile | ObraBien",
      description: "Encuentra albañiles, gasfiteres, electricistas y más profesionales de la construcción cerca de ti. Perfiles verificados, contacto directo por WhatsApp.",
    };
  }

  const title = esp && ciudad
    ? `${esp} en ${ciudad} | ObraBien`
    : esp
      ? `${esp} en Chile | ObraBien`
      : `Maestros en ${ciudad} | ObraBien`;

  const description = esp && ciudad
    ? `Encuentra maestros de ${esp.toLowerCase()} verificados en ${ciudad}. Contacto directo por WhatsApp, sin intermediarios.`
    : esp
      ? `Encuentra maestros de ${esp.toLowerCase()} verificados en toda Chile. Contacto directo por WhatsApp.`
      : `Encuentra maestros verificados en ${ciudad}. Contacto directo por WhatsApp.`;

  return { title, description };
}

type HorarioRow = { tipo?: string; desde?: string; hasta?: string; dias?: string[] } | null;

function rowToMaster(row: Record<string, unknown>): Master {
  const nombre = (row.nombre as string) ?? "Maestro";
  const initials = nombre.split(" ").slice(0, 2).map((w: string) => w[0] ?? "").join("").toUpperCase();
  const ciudades = (row.ciudades as string[]) ?? [];
  const horario = row.horarios as HorarioRow;
  const schedule = horario
    ? [horario.dias?.join(", "), horario.desde && horario.hasta ? `${horario.desde}–${horario.hasta}` : null]
        .filter(Boolean).join(" · ")
    : "A coordinar";

  return {
    id:             row.id as string,
    name:           nombre,
    initials,
    photoUrl:       (row.foto_url as string) || undefined,
    disponibilidad: (row.disponibilidad as string) || "disponible",
    specialties:  (row.especialidades as string[]) ?? [],
    city:         ciudades[0] ?? "Chile",
    sector:       ciudades.join(", "),
    phone:        (row.telefono as string) ?? "",
    schedule,
    rating:       0,
    jobs:         0,
    yearsExp:     (row.anos_experiencia as number) ?? 0,
    verified:     !!(row.verificado as boolean) || (row.verificacion_estado as string) === "aprobado",
    description:  (row.descripcion as string) ?? "",
    gallery:      [],
    atiendeUrgencias:     !!(row.atiende_urgencias as boolean),
    especialidadesUrgencia: (row.especialidades_urgencia as string[]) ?? [],
    createdAt:    (row.created_at as string) ?? undefined,
    referidosCount: 0,
  };
}

export default async function BuscarPage() {
  const { data: rows, error } = await getSupabaseAdmin()
    .from("maestros")
    .select("*, verificado, verificacion_estado")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[buscar] Supabase fetch failed — code:", error.code, "message:", error.message, "details:", error.details);
  }

  console.log("[buscar] rows from Supabase:", rows?.length ?? 0, error ? `(error: ${error.message})` : "");

  const realMaestros: Master[] = (rows ?? []).map(r => rowToMaster(r as Record<string, unknown>));
  const realIds = new Set(realMaestros.map(m => m.id));

  // Fetch ratings for all real maestros in one query
  if (realMaestros.length > 0) {
    const { data: resenas } = await getSupabaseAdmin()
      .from("resenas")
      .select("maestro_id, calificacion")
      .in("maestro_id", realMaestros.map(m => m.id));

    if (resenas && resenas.length > 0) {
      const map: Record<string, { sum: number; count: number }> = {};
      for (const r of resenas) {
        if (!map[r.maestro_id]) map[r.maestro_id] = { sum: 0, count: 0 };
        map[r.maestro_id].sum   += r.calificacion;
        map[r.maestro_id].count += 1;
      }
      for (const m of realMaestros) {
        const s = map[m.id];
        if (s) {
          m.rating  = Math.round(s.sum / s.count * 10) / 10;
          m.jobs    = s.count;
        }
      }
    }

    // Fetch referral counts for all real maestros in one query — used to boost
    // "Más relevantes" (ver buscar/_content.tsx). Un solo query agregado en
    // JS, no N llamadas por maestro.
    const { data: referidos } = await getSupabaseAdmin()
      .from("maestro_referidos")
      .select("maestro_id")
      .in("maestro_id", realMaestros.map(m => m.id));

    if (referidos && referidos.length > 0) {
      const referidosCounts: Record<string, number> = {};
      for (const r of referidos) referidosCounts[r.maestro_id] = (referidosCounts[r.maestro_id] ?? 0) + 1;
      for (const m of realMaestros) m.referidosCount = referidosCounts[m.id] ?? 0;
    }
  }

  // Solo maestros reales de Supabase
  const allMaestros = realMaestros;

  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <BuscarContent allMaestros={allMaestros} realIds={realIds} />
    </Suspense>
  );
}
