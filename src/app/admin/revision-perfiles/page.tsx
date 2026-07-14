import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import RevisionPerfilesList from "./RevisionPerfilesList";

export const dynamic = "force-dynamic";

export default async function RevisionPerfilesAdmin() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "jorge.arojasr@gmail.com").toLowerCase().trim();
  const email = (user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "").toLowerCase().trim();
  if (!email || email !== adminEmail) redirect("/");

  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("maestros")
    .select("id, nombre, rut, telefono, especialidades, descripcion, foto_url, updated_at, created_at")
    .eq("perfil_estado", "pendiente_revision")
    .order("updated_at", { ascending: true, nullsFirst: true });

  const maestros = data ?? [];

  // Gallery photo counts — one query for all pending maestros, grouped client-side
  // (mirrors the reply/consulta count-map pattern used in dashboard/maestro/page.tsx).
  const fotosCountMap: Record<string, number> = {};
  if (maestros.length > 0) {
    const { data: fotosRows } = await supabase
      .from("fotos_trabajos")
      .select("maestro_id")
      .in("maestro_id", maestros.map(m => m.id));
    for (const f of fotosRows ?? []) {
      const mid = f.maestro_id as string;
      fotosCountMap[mid] = (fotosCountMap[mid] ?? 0) + 1;
    }
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>

        <div style={{ marginBottom: 32 }}>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mute)", display: "block", marginBottom: 6 }}>
            // Admin · ObraBien
          </span>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(22px, 3vw, 28px)", color: "var(--navy)", margin: "0 0 8px" }}>
            Revisión de perfiles
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>
            {maestros.length} perfil{maestros.length !== 1 ? "es" : ""} esperando revisión
          </p>
        </div>

        <RevisionPerfilesList maestros={maestros} fotosCountMap={fotosCountMap} />

      </div>
    </div>
  );
}
