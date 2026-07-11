import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SignOutBtn from "@/components/SignOutBtn";
import AvailabilitySelector from "@/components/AvailabilitySelector";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import NotifsSection, { type Notif } from "@/components/NotifsSection";
import ActivitySection, { type ActivityItem } from "@/components/ActivitySection";
import UrgencyToggle from "@/components/UrgencyToggle";

export default async function MaestroDashboard() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const userEmail2 = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
  if (adminEmail && userEmail2 === adminEmail) redirect("/admin");

  const firstName = user.firstName || "Maestro";
  const role = user.publicMetadata?.role as string | undefined;
  if (role && role !== "maestro") redirect("/dashboard/cliente");

  const supabase = getSupabaseAdmin();

  // ── Core maestro data ──────────────────────────────────────────────────────
  // Fetched once by clerk_user_id and reused both for the completeness gate below
  // and for the status banners further down. Supabase is the source of truth here —
  // Clerk's publicMetadata.profile mirror (written in registro-basico/update-profile)
  // is best-effort/non-fatal on write and must not gate access on its own.
  const { data: maestroData, error: maestroFetchError } = await supabase
    .from("maestros").select("*").eq("clerk_user_id", user.id).maybeSingle();
  if (maestroFetchError) console.error("[maestro-dashboard] maestro fetch error:", maestroFetchError.message);
  const row = maestroData as Record<string, unknown> | null;

  const especialidadesRow = (row?.especialidades as unknown[] | null) ?? [];
  if (!row || !row.nombre || !row.rut || !row.telefono ||
      !Array.isArray(especialidadesRow) || especialidadesRow.length === 0) {
    redirect("/dashboard/maestro/completar-perfil");
  }

  const maestroId        = row.id as string;
  const publicProfileUrl = `/maestro/${maestroId}`;

  const disponibilidad     = (row.disponibilidad      as string)  ?? "disponible";
  const atiendeUrgencias   = !!(row.atiende_urgencias  as boolean);
  const verificacionEstado = (row.verificacion_estado as string)  ?? "sin_enviar";
  const nombreSB            = (row.nombre              as string)  || null;
  const fotoUrlSB           = (row.foto_url            as string)  || null;
  const perfilEstado        = (row.perfil_estado       as string)  || null;
  const rechazoMotivo       = (row.rechazo_motivo      as string)  || null;

  const displayName  = nombreSB || firstName;
  const displayPhoto = fotoUrlSB || user.imageUrl || null;

  // ── Stats ──────────────────────────────────────────────────────────────────
  let visitasCount   = 0;
  let contactosCount = 0;
  if (maestroId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const startOfMonth  = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const [{ count: visitas }, { count: contactos }] = await Promise.all([
      supabase.from("perfil_visitas")
        .select("id", { count: "exact", head: true })
        .eq("maestro_id", maestroId).gte("visited_at", thirtyDaysAgo),
      supabase.from("contactos_clicks")
        .select("id", { count: "exact", head: true })
        .eq("maestro_id", maestroId).gte("clicked_at", startOfMonth),
    ]);
    visitasCount   = visitas   ?? 0;
    contactosCount = contactos ?? 0;
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  let notifs: Notif[] = [];
  const { data: notifData } = await supabase
    .from("notificaciones")
    .select("id, tipo, mensaje, link, created_at")
    .eq("user_id", user.id).eq("leida", false)
    .order("created_at", { ascending: false })
    .limit(20);
  notifs = (notifData ?? []) as Notif[];

  // ── Activity: foro posts ───────────────────────────────────────────────────
  type ForoPostRow = { id: string; titulo: string; created_at: string };
  const { data: foroData } = await supabase
    .from("foro_posts")
    .select("id, titulo, created_at")
    .eq("clerk_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const foroPosts = (foroData ?? []) as ForoPostRow[];

  const replyCountMap: Record<string, number> = {};
  if (foroPosts.length > 0) {
    const { data: replyRows } = await supabase
      .from("foro_replies").select("post_id")
      .in("post_id", foroPosts.map(p => p.id));
    for (const r of replyRows ?? []) {
      const pid = r.post_id as string;
      replyCountMap[pid] = (replyCountMap[pid] ?? 0) + 1;
    }
  }

  // ── Activity: marketplace items ────────────────────────────────────────────
  type MktRow = { id: string; titulo: string; created_at: string };
  const { data: mktData } = await supabase
    .from("marketplace_items")
    .select("id, titulo, created_at")
    .eq("clerk_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const mktItems = (mktData ?? []) as MktRow[];

  const consultaCountMap: Record<string, number> = {};
  if (mktItems.length > 0) {
    const { data: cdata } = await supabase
      .from("marketplace_consultas").select("item_id")
      .in("item_id", mktItems.map(m => m.id));
    for (const c of cdata ?? []) {
      const iid = c.item_id as string;
      consultaCountMap[iid] = (consultaCountMap[iid] ?? 0) + 1;
    }
  }

  // ── Merge & sort activity ──────────────────────────────────────────────────
  const activityItems: ActivityItem[] = [
    ...foroPosts.map(p => {
      const n = replyCountMap[p.id] ?? 0;
      return {
        id:   p.id,
        kind: "foro" as const,
        title: p.titulo,
        date:  p.created_at,
        meta:  `${n} respuesta${n !== 1 ? "s" : ""}`,
        href:  `/comunidad/${p.id}`,
      };
    }),
    ...mktItems.map(m => {
      const n = consultaCountMap[m.id] ?? 0;
      return {
        id:   m.id,
        kind: "marketplace" as const,
        title: m.titulo,
        date:  m.created_at,
        meta:  `${n} consulta${n !== 1 ? "s" : ""}`,
        href:  `/marketplace/${m.id}`,
      };
    }),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const QUICK_ACTIONS = [
    { icon: "📋", title: "Editar perfil",      desc: "Actualiza especialidades, zona y fotos de trabajos.", href: "/dashboard/maestro/completar-perfil" },
    { icon: "💬", title: "Comunidad",           desc: "Responde preguntas y gana reputación.",              href: "/comunidad" },
    { icon: "🛒", title: "Marketplace",         desc: "Vende, arrienda y encuentra equipos del rubro.",     href: "/marketplace" },
    { icon: "📦", title: "Mis publicaciones",   desc: "Gestiona tus publicaciones en el marketplace.",      href: "/dashboard/maestro/mis-publicaciones" },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {displayPhoto ? (
              <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--navy)", flexShrink: 0 }}>
                <Image src={displayPhoto} alt="Avatar" width={56} height={56} style={{ objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ width: 56, height: 56, background: "var(--navy)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
                {displayName[0].toUpperCase()}
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Panel de maestro
              </p>
              <h1 style={{ margin: "4px 0 0", fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, color: "var(--navy)", lineHeight: 1.1 }}>
                Hola, {displayName} 👋
              </h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ background: "var(--ink)", color: "var(--orange)", padding: "4px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
              MAESTRO
            </span>
            <SignOutBtn />
          </div>
        </div>

        {/* ── Profile-status banners ── */}
        {perfilEstado === "basico" && (
          <div style={{ background: "rgba(232,108,28,0.08)", border: "1.5px solid var(--orange)", padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>📝</span>
              <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>
                Completa tu perfil para que los clientes vean tus fotos y más información.
              </div>
            </div>
            <Link href="/dashboard/maestro/completar-perfil" style={{ background: "var(--orange)", color: "#fff", padding: "9px 18px", fontWeight: 700, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
              Completar perfil →
            </Link>
          </div>
        )}
        {perfilEstado === "pendiente_revision" && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1.5px solid #F59E0B", padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🕐</span>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14, color: "#92400e" }}>
              Tu perfil está en revisión — el equipo de ObraBien lo aprobará dentro de 24 horas.
            </div>
          </div>
        )}
        {perfilEstado === "rechazado" && (
          <div style={{ background: "rgba(239,68,68,0.07)", border: "1.5px solid #EF4444", padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>❌</span>
              <div>
                <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14, color: "#b91c1c", marginBottom: 2 }}>
                  Tu perfil fue rechazado.
                </div>
                {rechazoMotivo && (
                  <div style={{ fontSize: 12.5, color: "#b91c1c", opacity: 0.8 }}>
                    {rechazoMotivo}
                  </div>
                )}
              </div>
            </div>
            <Link href="/dashboard/maestro/completar-perfil" style={{ background: "#EF4444", color: "#fff", padding: "9px 18px", fontWeight: 700, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
              Volver a completar →
            </Link>
          </div>
        )}

        {/* ── Availability ── */}
        {/* ── Verification banners ── */}
        {verificacionEstado === "pendiente" && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1.5px solid #F59E0B", padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🕐</span>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14, color: "#92400e" }}>
              Tu verificación está siendo revisada — te notificaremos cuando esté lista.
            </div>
          </div>
        )}
        {verificacionEstado === "aprobado" && (
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1.5px solid #22c55e", padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>✅</span>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14, color: "#15803d" }}>
              ✓ Identidad verificada
            </div>
          </div>
        )}
        {verificacionEstado === "rechazado" && (
          <div style={{ background: "rgba(239,68,68,0.07)", border: "1.5px solid #EF4444", padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>❌</span>
              <div>
                <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14, color: "#b91c1c", marginBottom: 2 }}>
                  Tu verificación fue rechazada — revisa que las fotos sean claras y vuelve a intentarlo.
                </div>
                <div style={{ fontSize: 12.5, color: "#b91c1c", opacity: 0.8 }}>
                  Asegúrate de que el RUT sea legible y la selfie muestre tu rostro y la cédula juntos.
                </div>
              </div>
            </div>
            <Link href="/dashboard/maestro/completar-perfil" style={{ background: "#EF4444", color: "#fff", padding: "9px 18px", fontWeight: 700, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
              Volver a enviar →
            </Link>
          </div>
        )}

        {/* ── Profile banner (availability toggle embedded) ── */}
        <div style={{ background: "var(--navy)", padding: "18px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ background: "#22c55e", color: "#fff", fontSize: 9, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.08em", padding: "2px 7px" }}>
                ACTIVO
              </span>
              <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 15.5, color: "#fff" }}>
                Tu perfil está publicado
              </span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              Agrega fotos de trabajos y más especialidades para recibir más contactos.
            </div>
          </div>
          <div className="avail-controls">
            {maestroId && <AvailabilitySelector initialValue={disponibilidad} />}
            {maestroId && <UrgencyToggle initialValue={atiendeUrgencias} />}
            <Link href={publicProfileUrl ?? "/dashboard/maestro/completar-perfil"} className="avail-profile-link" style={{ background: "var(--orange)", color: "#fff", padding: "0 18px", height: 34, display: "inline-flex", alignItems: "center", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
              Ver mi perfil →
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="dash-stats" style={{ marginBottom: 24 }}>
          {[
            { n: String(visitasCount),   label: "Visitas al perfil",    sub: "Últimos 30 días", accent: "var(--navy)" },
            { n: String(contactosCount), label: "Contactos recibidos",  sub: "Este mes",        accent: "var(--orange)" },
            { n: "—",                    label: "Calificación promedio", sub: "Sin reseñas aún", accent: "var(--navy)" },
          ].map(({ n, label, sub, accent }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 18px" }}>
              <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 38, fontWeight: 900, color: accent, lineHeight: 1, marginBottom: 8 }}>{n}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Notifications ── */}
        <NotifsSection initial={notifs} />

        {/* ── Quick actions ── */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 24px", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--ink)", margin: "0 0 16px" }}>
            Acciones rápidas
          </h2>
          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map(({ icon, title, desc, href }) => (
              <Link key={title} href={href} className="card hoverable" style={{ textDecoration: "none", display: "block", padding: "18px 16px" }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
                <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: "var(--mute)", lineHeight: 1.5 }}>{desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Activity ── */}
        <ActivitySection items={activityItems} />

        {/* ── Tip ── */}
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55 }}>
            Los perfiles con foto, especialidades y al menos 3 reseñas reciben{" "}
            <strong style={{ color: "var(--navy)" }}>4× más contactos</strong> que los incompletos.
          </p>
        </div>
      </div>
    </div>
  );
}
