import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "jorge.arojasr@gmail.com"
).toLowerCase().trim();

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days}d`;
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

type FeedEvent = { icon: string; text: string; time: string; key: string };

// Identity-verification system temporarily disabled — the /admin/verificaciones
// page, VerifList component and /api/admin/verificar endpoint all still exist;
// only this hub card is hidden. Flip to true to restore the nav link.
const MOSTRAR_VERIFICACIONES = false;

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const email = (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    ""
  ).toLowerCase().trim();
  if (!email || email !== ADMIN_EMAIL) redirect("/");

  const supabase = getSupabaseAdmin();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [
    { count: pendientesCount },
    { count: maestrosCount },
    { count: clientesCount },
    { count: mkpPendientesCount },
    { count: maestrosHoy },
    { count: clientesHoy },
    { count: foroHoy },
    { count: mkpHoy },
    { count: totalRecursos },
    { count: totalForo },
    { data: downloadData, error: downloadError },
    { data: recentMaestros },
    { data: recentClientes },
    { data: recentForo },
    { data: recentMkp },
    { data: recentVerified },
    { data: topDownloads },
  ] = await Promise.all([
    supabase.from("maestros").select("*", { count: "exact", head: true }).eq("verificacion_estado", "pendiente"),
    supabase.from("maestros").select("*", { count: "exact", head: true }),
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase.from("marketplace_items").select("*", { count: "exact", head: true }).eq("payment_status", "revision"),
    supabase.from("maestros").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
    supabase.from("clientes").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
    supabase.from("foro_posts").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
    supabase.from("marketplace_items").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
    supabase.from("recursos").select("*", { count: "exact", head: true }).eq("estado", "publicado"),
    supabase.from("foro_posts").select("*", { count: "exact", head: true }),
    supabase.from("recursos").select("download_count"),
    supabase.from("maestros").select("id, nombre, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("clientes").select("id, nombre, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("foro_posts").select("id, titulo, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("marketplace_items").select("id, titulo, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("maestros").select("id, nombre, created_at").eq("verificacion_estado", "aprobado").order("created_at", { ascending: false }).limit(8),
    supabase.from("recursos").select("id, titulo, download_count").gt("download_count", 0).order("download_count", { ascending: false }).limit(5),
  ]);

  const totalDescargas = downloadError
    ? 0
    : (downloadData ?? []).reduce((sum, r) => sum + ((r.download_count as number) ?? 0), 0);

  // Build activity feed
  const events: FeedEvent[] = [];
  const verifiedIds = new Set((recentVerified ?? []).map(v => v.id as string));

  for (const m of recentMaestros ?? []) {
    if (!verifiedIds.has(m.id as string)) {
      events.push({ icon: "🧑‍🔧", text: `Nuevo maestro registrado: ${m.nombre as string}`, time: m.created_at as string, key: `mae-${m.id}` });
    }
  }
  for (const c of recentClientes ?? []) {
    events.push({ icon: "👤", text: `Nuevo cliente registrado: ${c.nombre as string}`, time: c.created_at as string, key: `cli-${c.id}` });
  }
  for (const p of recentForo ?? []) {
    events.push({ icon: "💬", text: `Nuevo tema en foro: "${p.titulo as string}"`, time: p.created_at as string, key: `foro-${p.id}` });
  }
  for (const mkp of recentMkp ?? []) {
    events.push({ icon: "🏪", text: `Nueva publicación en Marketplace: "${mkp.titulo as string}"`, time: mkp.created_at as string, key: `mkp-${mkp.id}` });
  }
  for (const v of recentVerified ?? []) {
    events.push({ icon: "✅", text: `Maestro verificado: ${v.nombre as string}`, time: v.created_at as string, key: `ver-${v.id}` });
  }

  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const feedEvents = events.slice(0, 20);

  const badgePill: React.CSSProperties = {
    position: "absolute", top: 10, right: 10,
    background: "#EF4444", color: "#fff",
    fontSize: 10.5, fontWeight: 700,
    fontFamily: "var(--font-jetbrains),monospace",
    padding: "2px 8px", borderRadius: 999,
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mute)", display: "block", marginBottom: 6 }}>
            // Admin · ObraBien
          </span>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(22px, 3vw, 28px)", color: "var(--navy)", margin: "0 0 6px" }}>
            Panel de administración
          </h1>
          <p style={{ fontSize: 13, color: "var(--mute)", margin: 0, fontFamily: "var(--font-jetbrains), monospace" }}>
            {email}
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 40 }}>

          {/* Verificaciones (oculto vía MOSTRAR_VERIFICACIONES) */}
          {MOSTRAR_VERIFICACIONES && (
          <Link href="/admin/verificaciones" className="card hoverable" style={{ textDecoration: "none", display: "block", padding: "24px 22px", position: "relative" }}>
            {(pendientesCount ?? 0) > 0 && (
              <div style={badgePill}>{pendientesCount}</div>
            )}
            <div style={{ fontSize: 28, marginBottom: 12 }}>🪪</div>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16, color: "var(--ink)", marginBottom: 6 }}>Verificaciones</div>
            <div style={{ fontSize: 13, color: "var(--mute)", lineHeight: 1.5, marginBottom: (pendientesCount ?? 0) > 0 ? 10 : 0 }}>Revisar identidades pendientes de validación.</div>
            {(pendientesCount ?? 0) > 0 && (
              <div style={{ display: "inline-block", background: "#EF4444", color: "#fff", fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", padding: "3px 10px" }}>
                {pendientesCount} pendiente{pendientesCount !== 1 ? "s" : ""}
              </div>
            )}
          </Link>
          )}

          {/* Maestros */}
          <Link href="/admin/maestros" className="card hoverable" style={{ textDecoration: "none", display: "block", padding: "24px 22px", position: "relative" }}>
            {(maestrosHoy ?? 0) > 0 && (
              <div style={badgePill}>+{maestrosHoy} hoy</div>
            )}
            <div style={{ fontSize: 28, marginBottom: 12 }}>🔧</div>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16, color: "var(--ink)", marginBottom: 6 }}>Maestros</div>
            <div style={{ fontSize: 13, color: "var(--mute)", lineHeight: 1.5, marginBottom: 10 }}>Ver y gestionar todos los maestros registrados.</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", color: "var(--mute)" }}>
              {maestrosCount ?? 0} registrado{maestrosCount !== 1 ? "s" : ""}
              {(maestrosHoy ?? 0) > 0 && <span style={{ color: "#EF4444", marginLeft: 8 }}>+{maestrosHoy} nuevos hoy</span>}
            </div>
          </Link>

          {/* Clientes */}
          <Link href="/admin/clientes" className="card hoverable" style={{ textDecoration: "none", display: "block", padding: "24px 22px", position: "relative" }}>
            {(clientesHoy ?? 0) > 0 && (
              <div style={badgePill}>+{clientesHoy} hoy</div>
            )}
            <div style={{ fontSize: 28, marginBottom: 12 }}>👥</div>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16, color: "var(--ink)", marginBottom: 6 }}>Clientes</div>
            <div style={{ fontSize: 13, color: "var(--mute)", lineHeight: 1.5, marginBottom: 10 }}>Ver todos los clientes registrados.</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", color: "var(--mute)" }}>
              {clientesCount ?? 0} registrado{clientesCount !== 1 ? "s" : ""}
              {(clientesHoy ?? 0) > 0 && <span style={{ color: "#EF4444", marginLeft: 8 }}>+{clientesHoy} nuevos hoy</span>}
            </div>
          </Link>

          {/* Estadísticas */}
          <Link href="/admin/estadisticas" className="card hoverable" style={{ textDecoration: "none", display: "block", padding: "24px 22px" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>📊</div>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16, color: "var(--ink)", marginBottom: 6 }}>Estadísticas</div>
            <div style={{ fontSize: 13, color: "var(--mute)", lineHeight: 1.5 }}>Ver métricas y crecimiento de la plataforma.</div>
          </Link>

          {/* Recursos */}
          <Link href="/admin/recursos" className="card hoverable" style={{ textDecoration: "none", display: "block", padding: "24px 22px", position: "relative" }}>
            {totalDescargas > 0 && (
              <div style={{ ...badgePill, background: "#E86C1C" }}>{totalDescargas} desc.</div>
            )}
            <div style={{ fontSize: 28, marginBottom: 12 }}>📚</div>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16, color: "var(--ink)", marginBottom: 6 }}>Recursos</div>
            <div style={{ fontSize: 13, color: "var(--mute)", lineHeight: 1.5, marginBottom: totalDescargas > 0 ? 10 : 0 }}>Gestionar contenido educativo y guías.</div>
            {totalDescargas > 0 && (
              <div style={{ fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", color: "var(--mute)" }}>
                <span style={{ color: "#E86C1C" }}>{totalDescargas}</span> descarga{totalDescargas !== 1 ? "s" : ""} totales
              </div>
            )}
          </Link>

          {/* Foro */}
          <Link href="/comunidad" className="card hoverable" style={{ textDecoration: "none", display: "block", padding: "24px 22px", position: "relative" }}>
            {(foroHoy ?? 0) > 0 && (
              <div style={badgePill}>+{foroHoy} hoy</div>
            )}
            <div style={{ fontSize: 28, marginBottom: 12 }}>💬</div>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16, color: "var(--ink)", marginBottom: 6 }}>Foro / Comunidad</div>
            <div style={{ fontSize: 13, color: "var(--mute)", lineHeight: 1.5, marginBottom: (foroHoy ?? 0) > 0 ? 10 : 0 }}>Temas y discusiones publicados por la comunidad.</div>
            {(foroHoy ?? 0) > 0 && (
              <div style={{ display: "inline-block", background: "#EF4444", color: "#fff", fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", padding: "3px 10px" }}>
                {foroHoy} tema{foroHoy !== 1 ? "s" : ""} nuevos hoy
              </div>
            )}
          </Link>

          {/* Marketplace */}
          <Link href="/admin/marketplace" className="card hoverable" style={{ textDecoration: "none", display: "block", padding: "24px 22px", position: "relative" }}>
            {((mkpPendientesCount ?? 0) + (mkpHoy ?? 0) > 0) && (
              <div style={badgePill}>
                {(mkpHoy ?? 0) > 0 ? `+${mkpHoy} hoy` : `${mkpPendientesCount} rev.`}
              </div>
            )}
            <div style={{ fontSize: 28, marginBottom: 12 }}>🛒</div>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16, color: "var(--ink)", marginBottom: 6 }}>Marketplace</div>
            <div style={{ fontSize: 13, color: "var(--mute)", lineHeight: 1.5, marginBottom: ((mkpPendientesCount ?? 0) > 0 || (mkpHoy ?? 0) > 0) ? 10 : 0 }}>Revisión y moderación de publicaciones nuevas.</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(mkpPendientesCount ?? 0) > 0 && (
                <div style={{ display: "inline-block", background: "#E86C1C", color: "#fff", fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", padding: "3px 10px" }}>
                  {mkpPendientesCount} en revisión
                </div>
              )}
              {(mkpHoy ?? 0) > 0 && (
                <div style={{ display: "inline-block", background: "#EF4444", color: "#fff", fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", padding: "3px 10px" }}>
                  +{mkpHoy} publicaciones nuevas
                </div>
              )}
            </div>
          </Link>

        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 52 }}>
          {([
            { value: maestrosCount ?? 0,  label: "Maestros activos",      color: "var(--navy)"   },
            { value: clientesCount ?? 0,  label: "Clientes registrados",  color: "var(--navy)"   },
            { value: totalRecursos ?? 0,  label: "Recursos publicados",   color: "var(--orange)" },
            { value: totalForo ?? 0,      label: "Temas en foro",         color: "var(--navy)"   },
            { value: totalDescargas,      label: "Descargas totales",     color: "var(--orange)" },
          ] as { value: number; label: string; color: string }[]).map(({ value, label, color }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: 34, color, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {value.toLocaleString("es-CL")}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--mute)", marginTop: 7, fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.4 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--orange)" }}>
              // Actividad reciente
            </span>
            <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 20, color: "var(--navy)", margin: "4px 0 0" }}>
              Últimos eventos
            </h2>
          </div>

          {feedEvents.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "40px", textAlign: "center", color: "var(--mute)", fontSize: 14 }}>
              No hay actividad reciente.
            </div>
          ) : (
            <div style={{ border: "1px solid var(--line)", background: "#fff" }}>
              {feedEvents.map((ev, i) => (
                <div
                  key={ev.key}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "13px 18px",
                    borderBottom: i < feedEvents.length - 1 ? "1px solid var(--line)" : "none",
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, width: 26, textAlign: "center" }}>{ev.icon}</span>
                  <span style={{ flex: 1, fontSize: 13.5, color: "var(--ink)", fontFamily: "var(--font-inter-tight),sans-serif", minWidth: 0 }}>
                    {ev.text}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains),monospace", flexShrink: 0, whiteSpace: "nowrap", marginLeft: 8 }}>
                    {timeAgo(ev.time)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Downloads table */}
          {(topDownloads ?? []).length > 0 && (
            <div style={{ marginTop: 28 }}>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mute)", display: "block", marginBottom: 12 }}>
                // Recursos más descargados
              </span>
              <div style={{ border: "1px solid var(--line)", background: "#fff" }}>
                {(topDownloads ?? []).map((r, i) => (
                  <div
                    key={r.id as string}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "12px 18px",
                      borderBottom: i < (topDownloads ?? []).length - 1 ? "1px solid var(--line)" : "none",
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0, width: 26, textAlign: "center" }}>📄</span>
                    <span style={{ flex: 1, fontSize: 13.5, color: "var(--ink)", fontFamily: "var(--font-inter-tight),sans-serif" }}>
                      &ldquo;{r.titulo as string}&rdquo; fue descargado
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--orange)", fontFamily: "var(--font-jetbrains),monospace", flexShrink: 0 }}>
                      {(r.download_count as number).toLocaleString("es-CL")}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
