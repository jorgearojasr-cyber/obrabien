import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { TYPE_CONFIG, PLAN_CONFIG, type ListingType, type ListingPlan } from "@/lib/marketplace";

function BackIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
}

export default async function MisPublicacionesPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const supabase = getSupabaseAdmin();

  // Fetch all user's marketplace items (active and inactive)
  const { data: items } = await supabase
    .from("marketplace_items")
    .select("id, titulo, tipo, plan, activo, payment_status, created_at, foto_url")
    .eq("clerk_user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (items ?? []) as {
    id: string; titulo: string; tipo: string; plan: string;
    activo: boolean; payment_status: string; created_at: string; foto_url: string | null;
  }[];

  // Consulta counts in one query
  let consultaMap: Record<string, number> = {};
  if (rows.length > 0) {
    const { data: cdata } = await supabase
      .from("marketplace_consultas")
      .select("item_id")
      .in("item_id", rows.map(r => r.id));
    consultaMap = (cdata ?? []).reduce<Record<string, number>>((acc, r) => {
      acc[r.item_id as string] = (acc[r.item_id as string] ?? 0) + 1;
      return acc;
    }, {});
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>

        {/* Back + header */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/dashboard/maestro" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mute)", textDecoration: "none", fontWeight: 500, marginBottom: 14 }}>
            <BackIcon /> Volver al panel
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                Dashboard
              </p>
              <h1 style={{ margin: 0, fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(20px,3vw,28px)", fontWeight: 900, color: "var(--navy)", lineHeight: 1.1 }}>
                Mis publicaciones
              </h1>
            </div>
            <Link href="/marketplace/publicar" style={{ background: "var(--orange)", color: "#fff", padding: "10px 20px", fontWeight: 700, fontSize: 13.5, textDecoration: "none", whiteSpace: "nowrap" }}>
              + Nueva publicación
            </Link>
          </div>
        </div>

        {rows.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🛒</div>
            <p style={{ fontSize: 15, color: "var(--mute)", margin: "0 0 20px" }}>
              Aún no tienes publicaciones en el marketplace.
            </p>
            <Link href="/marketplace/publicar" style={{ background: "var(--navy)", color: "#fff", padding: "11px 22px", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              Publicar ahora →
            </Link>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid var(--line)" }}>
            {rows.map((r, i) => {
              const typeCfg = TYPE_CONFIG[r.tipo as ListingType] ?? { label: r.tipo.toUpperCase(), bg: "var(--bg-2)", color: "var(--mute)" };
              const planCfg = PLAN_CONFIG[r.plan as ListingPlan] ?? { label: r.plan.toUpperCase(), bg: "var(--bg-2)", color: "var(--mute)" };
              const consultas = consultaMap[r.id] ?? 0;
              const isActive = r.activo;
              const isPending = !r.activo && r.payment_status === "pendiente";

              return (
                <div
                  key={r.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 20px",
                    borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none",
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ width: 52, height: 52, flexShrink: 0, overflow: "hidden", background: "var(--bg-2)", border: "1px solid var(--line)" }}>
                    {r.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.foto_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: 20 }}>📦</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 5 }}>
                      {r.titulo}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ padding: "1px 7px", background: typeCfg.bg, color: typeCfg.color, fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.07em" }}>
                        {typeCfg.label}
                      </span>
                      <span style={{ padding: "1px 7px", background: planCfg.bg, color: planCfg.color, fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.07em" }}>
                        {planCfg.label}
                      </span>
                      {isActive ? (
                        <span style={{ padding: "1px 7px", background: "rgba(34,197,94,0.1)", color: "#15803d", fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace" }}>
                          ACTIVO
                        </span>
                      ) : isPending ? (
                        <span style={{ padding: "1px 7px", background: "rgba(245,158,11,0.12)", color: "#92400e", fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace" }}>
                          PAGO PENDIENTE
                        </span>
                      ) : (
                        <span style={{ padding: "1px 7px", background: "rgba(239,68,68,0.08)", color: "#b91c1c", fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace" }}>
                          INACTIVO
                        </span>
                      )}
                      <span style={{ fontSize: 11.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                        {fmt(r.created_at)}
                      </span>
                      {consultas > 0 && (
                        <span style={{ fontSize: 11.5, color: "var(--navy)", fontWeight: 600 }}>
                          💬 {consultas}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  {isActive && (
                    <Link href={`/marketplace/${r.id}`} style={{ fontSize: 12.5, color: "var(--orange)", fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
                      Ver →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
