import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function Stars({ n }: { n: number }) {
  return (
    <span style={{ color: "#F59E0B", fontSize: 14, letterSpacing: 1 }}>
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
  );
}

export const metadata = {
  title: "Mis reseñas — ObraBien",
};

export default async function MisResenasPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const role = user.publicMetadata?.role as string | undefined;
  if (role && role !== "cliente") redirect("/dashboard/maestro");

  const { data: rawResenas } = await getSupabaseAdmin()
    .from("resenas")
    .select("calificacion, comentario, created_at, maestro_id")
    .eq("clerk_user_id", user.id)
    .order("created_at", { ascending: false });

  const resenas = rawResenas ?? [];

  const maestroIds = [...new Set(resenas.map(r => r.maestro_id).filter(Boolean))];
  const maestroMap: Record<string, string> = {};
  if (maestroIds.length > 0) {
    const { data: maestros } = await getSupabaseAdmin()
      .from("maestros")
      .select("id, nombre")
      .in("id", maestroIds);
    for (const m of maestros ?? []) maestroMap[m.id] = m.nombre;
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 72, maxWidth: 680 }}>

        <Link href="/dashboard/cliente" style={{ fontSize: 13, color: "var(--mute)", textDecoration: "none", fontFamily: "var(--font-jetbrains), monospace", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
          ← Volver al panel
        </Link>

        <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(22px,3vw,28px)", color: "var(--navy)", margin: "0 0 6px", lineHeight: 1.1 }}>
          Mis reseñas
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: "var(--mute)" }}>
          {resenas.length === 0 ? "Aún no has dejado reseñas." : `${resenas.length} reseña${resenas.length !== 1 ? "s" : ""} publicada${resenas.length !== 1 ? "s" : ""}.`}
        </p>

        {resenas.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>⭐</div>
            <p style={{ margin: "0 0 18px", fontSize: 14, color: "var(--mute)", lineHeight: 1.6 }}>
              Cuando contrates un maestro y dejes tu opinión, aparecerá aquí.
            </p>
            <Link href="/buscar" style={{ color: "var(--navy)", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
              Buscar maestros →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {resenas.map((r, i) => {
              const maestroNombre = maestroMap[r.maestro_id];
              const fecha = new Date(r.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
              return (
                <div key={i} style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                    <div>
                      {maestroNombre ? (
                        <Link href={`/maestro/${r.maestro_id}`} style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 15.5, color: "var(--navy)", textDecoration: "none", display: "block", marginBottom: 4 }}>
                          {maestroNombre}
                        </Link>
                      ) : (
                        <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 15.5, color: "var(--ink)", display: "block", marginBottom: 4 }}>
                          Maestro
                        </span>
                      )}
                      <Stars n={r.calificacion} />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", whiteSpace: "nowrap" }}>{fecha}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.7 }}>
                    {r.comentario}
                  </p>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
