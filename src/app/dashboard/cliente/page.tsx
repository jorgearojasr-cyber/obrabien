import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import SignOutBtn from "@/components/SignOutBtn";
import MigrateToMaestroCard from "@/components/MigrateToMaestroCard";
import CancelMigrationBanner from "@/components/CancelMigrationBanner";
import NotificacionesBanner from "@/components/NotificacionesBanner";

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

const PAGE_SIZE = 5;

export default async function ClienteDashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

  const user = await currentUser();
  if (!user) redirect("/login");

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const userEmail2 = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
  if (adminEmail && userEmail2 === adminEmail) redirect("/admin");

  const role = user.publicMetadata?.role as string | undefined;
  if (role && role !== "cliente") redirect("/dashboard/maestro");

  const { data: clientProfile } = await getSupabaseAdmin()
    .from("clientes")
    .select("nombre, ciudad, foto_perfil")
    .eq("user_id", user.id)
    .single();

  if (!clientProfile?.nombre) redirect("/dashboard/cliente/completar-perfil");

  const ciudad    = clientProfile.ciudad ?? null;
  const avatarUrl = clientProfile.foto_perfil || user.imageUrl || null;
  const firstName = clientProfile.nombre.split(" ")[0] || user.firstName || "Cliente";
  const buscarHref = ciudad ? `/buscar?ciudad=${encodeURIComponent(ciudad)}` : "/buscar";

  // ── Fetch user's published content in parallel ──
  const [empleosRes, marketplaceRes, foroRes] = await Promise.all([
    getSupabaseAdmin()
      .from("empleos")
      .select("id, tipo, titulo, created_at")
      .eq("clerk_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    getSupabaseAdmin()
      .from("marketplace_items")
      .select("id, titulo, tipo, created_at")
      .eq("clerk_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    getSupabaseAdmin()
      .from("foro_posts")
      .select("id, titulo, created_at")
      .eq("clerk_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const misEmpleos     = empleosRes.data    ?? [];
  const misMarketplace = marketplaceRes.data ?? [];
  const misForoPosts   = foroRes.data       ?? [];

  // ── Batch-fetch counts ──
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

  // ── Build and sort unified activity list ──
  const activity: AItem[] = [
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

  const totalItems    = activity.length;
  const totalPages    = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage   = Math.min(totalPages, Math.max(1, parseInt(pageParam ?? "1", 10)));
  const pageItems     = activity.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const ACTIONS = [
    { icon: "🔍", title: "Buscar maestros",   desc: "Encuentra especialistas por ciudad y oficio.", href: buscarHref },
    { icon: "⭐", title: "Mis favoritos",     desc: "Maestros que guardaste para contactar.",       href: "/favoritos" },
    { icon: "📋", title: "Mis publicaciones", desc: "Empleos, marketplace y foro publicados.",      href: "/dashboard/cliente/mis-publicaciones" },
    { icon: "💬", title: "Mis reseñas",       desc: "Reseñas que has dejado a maestros.",           href: "/dashboard/cliente/mis-resenas" },
    { icon: "💼", title: "Empleos",           desc: "Busca trabajos o publica ofertas.",            href: "/empleos" },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 72 }}>

        <CancelMigrationBanner />

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, marginBottom: 28, paddingBottom: 24,
          borderBottom: "1px solid var(--line)", flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {avatarUrl ? (
              <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--navy)", flexShrink: 0 }}>
                <Image src={avatarUrl} alt="Avatar" width={56} height={56} style={{ objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--navy)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
                {firstName[0].toUpperCase()}
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Panel de cliente
              </p>
              <h1 style={{ margin: "4px 0 0", fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(20px,3vw,26px)", fontWeight: 900, color: "var(--navy)", lineHeight: 1.1 }}>
                Hola, {firstName} 👋
              </h1>
              {ciudad && (
                <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--mute)" }}>📍 {ciudad}</p>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ background: "var(--navy)", color: "#fff", padding: "4px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
              CLIENTE
            </span>
            <SignOutBtn />
          </div>
        </div>

        {/* ── Profile banner (compact) ── */}
        <div style={{
          background: "#fff", border: "1px solid var(--line)",
          borderLeft: "3px solid var(--navy)",
          padding: "12px 18px", marginBottom: 24,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>✅</span>
            <span style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 600 }}>Tu perfil está activo</span>
            {ciudad && <span style={{ fontSize: 12.5, color: "var(--mute)" }}>· 📍 {ciudad}</span>}
          </div>
          <Link href="/dashboard/cliente/completar-perfil" style={{ fontSize: 12.5, color: "var(--navy)", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            Editar perfil →
          </Link>
        </div>

        {/* ── Notifications (client component — hides itself when empty) ── */}
        <NotificacionesBanner />

        {/* ── Quick actions ── */}
        <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 16, color: "var(--ink)", margin: "0 0 12px" }}>
          Acciones rápidas
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 36 }}>
          {ACTIONS.map(({ icon, title, desc, href }) => (
            <Link key={title} href={href} className="card hoverable" style={{ textDecoration: "none", display: "block", padding: "16px 18px" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--mute)", lineHeight: 1.5 }}>{desc}</div>
            </Link>
          ))}
        </div>

        {/* ── Mi actividad reciente ── */}
        <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 16, color: "var(--ink)", margin: "0 0 12px" }}>
          Mi actividad reciente
        </h2>
        <div style={{ background: "#fff", border: "1px solid var(--line)", marginBottom: 36 }}>
          {totalItems === 0 ? (
            <div style={{ padding: "32px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <p style={{ margin: 0, fontSize: 14, color: "var(--mute)", lineHeight: 1.6 }}>
                Aún no has publicado nada. ¡Empieza buscando maestros!
              </p>
              <Link href={buscarHref} style={{ display: "inline-block", marginTop: 16, color: "var(--navy)", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
                Buscar maestros →
              </Link>
            </div>
          ) : (
            <>
              {pageItems.map((item, i) => {
                const fecha = new Date(item.date).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
                const countStr = item.count === 0
                  ? `Sin ${item.countWord}s`
                  : `${item.count} ${item.countWord}${item.count !== 1 ? "s" : ""}`;
                return (
                  <div key={item.id} style={{ padding: "14px 20px", borderBottom: i < pageItems.length - 1 ? "1px solid var(--line)" : undefined, display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10.5, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {item.typeLabel}
                        </span>
                        <span style={{ fontSize: 10.5, color: "var(--mute)" }}>·</span>
                        <span style={{ fontSize: 10.5, fontFamily: "var(--font-jetbrains), monospace", color: item.count > 0 ? "var(--navy)" : "var(--mute)" }}>
                          {countStr}
                        </span>
                      </div>
                      <Link href={item.href} style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", textDecoration: "none", display: "block", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.title}
                      </Link>
                    </div>
                    <span style={{ fontSize: 11.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", flexShrink: 0, marginTop: 2 }}>{fecha}</span>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 16 }}>
                  {currentPage > 1 && (
                    <Link href={`?page=${currentPage - 1}`} style={{ fontSize: 13, color: "var(--navy)", fontWeight: 600, textDecoration: "none" }}>
                      ← Anterior
                    </Link>
                  )}
                  <span style={{ fontSize: 12, color: "var(--mute)", marginLeft: "auto", fontFamily: "var(--font-jetbrains), monospace" }}>
                    {currentPage} / {totalPages}
                  </span>
                  {currentPage < totalPages && (
                    <Link href={`?page=${currentPage + 1}`} style={{ fontSize: 13, color: "var(--navy)", fontWeight: 600, textDecoration: "none" }}>
                      Siguiente →
                    </Link>
                  )}
                </div>
              )}

              {/* Footer link */}
              {totalPages === 1 && (
                <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line)" }}>
                  <Link href="/dashboard/cliente/mis-publicaciones" style={{ fontSize: 13, color: "var(--navy)", fontWeight: 600, textDecoration: "none" }}>
                    Ver todas mis publicaciones →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Subtle conversion banner (bottom) ── */}
        <MigrateToMaestroCard context="subtle" />

      </div>
    </div>
  );
}
