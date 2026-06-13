import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const metadata = {
  title: "Mis publicaciones — ObraBien",
};

type AItem = {
  id: string;
  kind: "empleo" | "marketplace" | "foro";
  icon: string;
  typeLabel: string;
  title: string;
  href: string;
  count: number;
  countWord: string;
  date: string;
};

export default async function MisPublicacionesPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const role = user.publicMetadata?.role as string | undefined;
  if (role && role !== "cliente") redirect("/dashboard/maestro");

  const [empleosRes, marketplaceRes, foroRes] = await Promise.all([
    getSupabaseAdmin()
      .from("empleos")
      .select("id, tipo, titulo, created_at")
      .eq("clerk_user_id", user.id)
      .order("created_at", { ascending: false }),
    getSupabaseAdmin()
      .from("marketplace_items")
      .select("id, titulo, tipo, created_at")
      .eq("clerk_user_id", user.id)
      .order("created_at", { ascending: false }),
    getSupabaseAdmin()
      .from("foro_posts")
      .select("id, titulo, created_at")
      .eq("clerk_user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const misEmpleos     = empleosRes.data    ?? [];
  const misMarketplace = marketplaceRes.data ?? [];
  const misForoPosts   = foroRes.data       ?? [];

  const empleoIds      = misEmpleos.map(e => e.id);
  const marketplaceIds = misMarketplace.map(m => m.id);
  const foroIds        = misForoPosts.map(f => f.id);

  const [postRes, consultaRes, replyRes] = await Promise.all([
    empleoIds.length > 0
      ? getSupabaseAdmin().from("empleos_postulaciones").select("empleo_id").in("empleo_id", empleoIds)
      : Promise.resolve({ data: [] as { empleo_id: string }[] }),
    marketplaceIds.length > 0
      ? getSupabaseAdmin().from("marketplace_consultas").select("item_id").in("item_id", marketplaceIds)
      : Promise.resolve({ data: [] as { item_id: string }[] }),
    foroIds.length > 0
      ? getSupabaseAdmin().from("foro_replies").select("post_id").in("post_id", foroIds)
      : Promise.resolve({ data: [] as { post_id: string }[] }),
  ]);

  const postCount:     Record<string, number> = {};
  const consultaCount: Record<string, number> = {};
  const replyCount:    Record<string, number> = {};

  for (const p of postRes.data     ?? []) postCount[p.empleo_id]   = (postCount[p.empleo_id]   ?? 0) + 1;
  for (const c of consultaRes.data ?? []) consultaCount[c.item_id] = (consultaCount[c.item_id] ?? 0) + 1;
  for (const r of replyRes.data    ?? []) replyCount[r.post_id]    = (replyCount[r.post_id]    ?? 0) + 1;

  const items: AItem[] = [
    ...misEmpleos.map(e => ({
      id: e.id, kind: "empleo" as const, icon: "💼",
      typeLabel: e.tipo === "oferta" ? "Oferta de trabajo" : "Maestro disponible",
      title: e.titulo, href: "/empleos",
      count: postCount[e.id] ?? 0, countWord: "postulación",
      date: e.created_at,
    })),
    ...misMarketplace.map(m => ({
      id: m.id, kind: "marketplace" as const, icon: "🛒",
      typeLabel: "Marketplace",
      title: m.titulo, href: `/marketplace/${m.id}`,
      count: consultaCount[m.id] ?? 0, countWord: "consulta",
      date: m.created_at,
    })),
    ...misForoPosts.map(f => ({
      id: f.id, kind: "foro" as const, icon: "💬",
      typeLabel: "Comunidad",
      title: f.titulo, href: `/comunidad/${f.id}`,
      count: replyCount[f.id] ?? 0, countWord: "respuesta",
      date: f.created_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = items.length;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 72, maxWidth: 720 }}>

        <Link href="/dashboard/cliente" style={{ fontSize: 13, color: "var(--mute)", textDecoration: "none", fontFamily: "var(--font-jetbrains), monospace", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
          ← Volver al panel
        </Link>

        <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(22px,3vw,28px)", color: "var(--navy)", margin: "0 0 6px", lineHeight: 1.1 }}>
          Mis publicaciones
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: "var(--mute)" }}>
          {total === 0 ? "Aún no tienes publicaciones." : `${total} publicación${total !== 1 ? "es" : ""} en total.`}
        </p>

        {/* Summary pills */}
        {total > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { label: "Empleos",     count: misEmpleos.length,     icon: "💼" },
              { label: "Marketplace", count: misMarketplace.length, icon: "🛒" },
              { label: "Comunidad",   count: misForoPosts.length,   icon: "💬" },
            ].map(({ label, count, icon }) => count > 0 && (
              <div key={label} style={{ background: "#fff", border: "1px solid var(--line)", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>{icon}</span>
                <span style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 600 }}>{count} {label}</span>
              </div>
            ))}
          </div>
        )}

        {total === 0 ? (
          <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>📋</div>
            <p style={{ margin: "0 0 18px", fontSize: 14, color: "var(--mute)", lineHeight: 1.6 }}>
              Cuando publiques empleos, artículos en el marketplace o preguntas en la comunidad, aparecerán aquí.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/empleos/publicar" style={{ color: "var(--navy)", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>Publicar empleo →</Link>
              <Link href="/marketplace/publicar" style={{ color: "var(--navy)", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>Publicar en marketplace →</Link>
              <Link href="/comunidad/nueva" style={{ color: "var(--navy)", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>Publicar en comunidad →</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((item) => {
              const fecha = new Date(item.date).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
              const countStr = item.count === 0
                ? `Sin ${item.countWord}s`
                : `${item.count} ${item.countWord}${item.count !== 1 ? "s" : ""}`;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  style={{ background: "#fff", border: "1px solid var(--line)", padding: "16px 20px", textDecoration: "none", display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10.5, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {item.typeLabel}
                      </span>
                      <span style={{
                        fontSize: 10.5, fontFamily: "var(--font-jetbrains), monospace",
                        color: item.count > 0 ? "#fff" : "var(--mute)",
                        background: item.count > 0 ? "var(--navy)" : "transparent",
                        padding: item.count > 0 ? "1px 6px" : undefined,
                      }}>
                        {countStr}
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 15, color: "var(--ink)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </div>
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", flexShrink: 0, marginTop: 3 }}>{fecha}</span>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
