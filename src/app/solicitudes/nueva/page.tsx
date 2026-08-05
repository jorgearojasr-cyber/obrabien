import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import NuevaSolicitudForm, { type MaestroPickerItem } from "@/components/solicitudes/NuevaSolicitudForm";

// Sprint 19 (JOB-028): pantalla "Nueva Solicitud". Este archivo solo hace dos
// cosas server-side: exigir sesión (mismo patrón que dashboard/maestro/page.tsx)
// y traer la lista de maestros para el paso 6 (selección). Esa lectura es un
// query directo a Supabase, igual que en /buscar y la Home — no es lo que
// JOB-029 restringe ("no acceder directamente a Supabase" aplica a CREAR la
// solicitud, que pasa exclusivamente por POST /api/solicitudes; ver
// NuevaSolicitudForm). El formulario en sí vive en un client component
// porque necesita estado de varios pasos, previews de archivos y checkboxes.
export default async function NuevaSolicitudPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const { data: rows } = await getSupabaseAdmin()
    .from("maestros")
    .select("id, nombre, foto_url, ciudades, especialidades")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(150);

  const maestros: MaestroPickerItem[] = (rows ?? []).map(r => ({
    id: r.id as string,
    nombre: (r.nombre as string) ?? "Maestro",
    fotoUrl: (r.foto_url as string) || null,
    ciudad: ((r.ciudades as string[]) ?? [])[0] ?? "",
    especialidades: (r.especialidades as string[]) ?? [],
  }));

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64, maxWidth: 760 }}>
        <p style={{ margin: 0, fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          // Nueva solicitud
        </p>
        <h1 style={{ margin: "6px 0 8px", fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 900, color: "var(--navy)" }}>
          Pide un trabajo a los maestros que elijas
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14.5, color: "var(--mute)", maxWidth: 560 }}>
          Describe lo que necesitas, elige a uno o varios maestros y te responden directo por acá — sin tener que escribir a cada uno por separado.
        </p>
        <NuevaSolicitudForm maestros={maestros} />
      </div>
    </div>
  );
}
