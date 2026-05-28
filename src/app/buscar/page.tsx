import { Suspense } from "react";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SAMPLE_MASTERS, type Master } from "@/lib/data";
import BuscarContent from "./_content";

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
    id:           row.id as string,
    name:         nombre,
    initials,
    specialties:  (row.especialidades as string[]) ?? [],
    city:         ciudades[0] ?? "Chile",
    sector:       ciudades.join(", "),
    phone:        (row.telefono as string) ?? "",
    schedule,
    rating:       0,
    jobs:         0,
    yearsExp:     0,
    verified:     false,
    description:  (row.descripcion as string) ?? "",
    gallery:      [],
  };
}

export default async function BuscarPage() {
  const { data: rows, error } = await getSupabaseAdmin()
    .from("maestros")
    .select("id, nombre, especialidades, ciudades, telefono, horarios, descripcion")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[buscar] Supabase fetch failed:", error.message);
  }

  const realMaestros: Master[] = (rows ?? []).map(r => rowToMaster(r as Record<string, unknown>));
  const realIds = new Set(realMaestros.map(m => m.id));

  // Real maestros first, then sample data (deduplicated by id)
  const allMaestros = [
    ...realMaestros,
    ...SAMPLE_MASTERS.filter(m => !realIds.has(m.id)),
  ];

  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <BuscarContent allMaestros={allMaestros} realIds={realIds} />
    </Suspense>
  );
}
