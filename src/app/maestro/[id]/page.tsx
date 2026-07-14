import Link from "next/link";
import { SAMPLE_MASTERS, type Master } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import ProfessionalCard from "@/components/ProfessionalCard";
import ReviewSection, { type ExistingReview } from "@/components/ReviewSection";
import GalleryCarousel from "@/components/GalleryCarousel";
import ProfilePhotoLightbox from "@/components/ProfilePhotoLightbox";
import AvailabilityPicker from "@/components/AvailabilityPicker";
import UrgencyToggle from "@/components/UrgencyToggle";

// Identity-verification badge temporarily hidden (system paused) — the
// `verificado` column keeps its data; flip to true to show it again.
const MOSTRAR_BADGE_VERIFICADO = false;

// ── Icons ──────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>;
}
function StarIcon({ size = 14, filled = true }: { size?: number; filled?: boolean }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}><path d="M12 17.3 5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6L18.2 21z" /></svg>;
}
function BackIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>;
}
function PhoneIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>;
}
function ClockIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}
function PinIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>;
}

function VideoLinkCard({ url, icon, label, color, border, name }: { url: string; icon: string; label: string; color: string; border: string; name: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 24 }}>
      <span className="label" style={{ marginBottom: 16, display: "block" }}>// VIDEO DE TRABAJOS</span>
      <div style={{ border: `1.5px solid ${border}`, padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
        <span style={{ fontSize: 44 }}>{icon}</span>
        <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
          {name} tiene un video en {label}
        </p>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: color, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
          Ver video en {label} →
        </a>
      </div>
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────

const SEED_REVIEWS = [
  { author: "María González",   date: "Marzo 2025",    text: "Excelente trabajo, rápido y muy limpio. Lo recomiendo sin dudarlo.", rating: 5 },
  { author: "Sebastián Torres", date: "Febrero 2025",  text: "Solucionó el problema en menos de una hora. Muy profesional y puntual.", rating: 5 },
  { author: "Claudia Herrera",  date: "Enero 2025",    text: "Buen precio y trabajo cuidadoso. Volvería a contratarlo.", rating: 4 },
];

const AV_COLORS: [string, string][] = [["#14375F", "#fff"], ["#E86C1C", "#fff"], ["#ECEAE3", "#14375F"]];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type HorarioRow = { tipo?: string; desde?: string; hasta?: string; dias?: string[] } | null;
type SocialRow  = { whatsapp?: string | null; instagram?: string | null; facebook?: string | null; tiktok?: string | null } | null;
type FotoRow    = { url: string; descripcion: string | null };

const FULL_DAY_SHORT: Record<string, string> = {
  "Lunes":"Lun","Martes":"Mar","Miércoles":"Mié",
  "Jueves":"Jue","Viernes":"Vie","Sábado":"Sáb","Domingo":"Dom",
};
const DAY_ORDER = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

function getYouTubeId(url: string): string | null {
  // Covers: watch?v=, youtu.be/, shorts/, embed/
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getVideoPlatform(url: string): "youtube" | "tiktok" | "instagram" | "facebook" | null {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("tiktok.com"))    return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("facebook.com") || url.includes("fb.watch")) return "facebook";
  return null;
}

function inferDiasFromTipo(tipo?: string): string[] {
  if (tipo === "semana") return ["Lunes","Martes","Miércoles","Jueves","Viernes"];
  if (tipo === "finde")  return ["Sábado","Domingo"];
  return [];
}

function formatSchedule(diasFull: string[], diasAbbr: string[] | undefined, desde?: string, hasta?: string): string {
  const parts: string[] = [];
  if (diasFull.length === 7) {
    parts.push("Todos los días");
  } else if (diasFull.length > 0) {
    const sorted = [...diasFull].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
    const indices = sorted.map(d => DAY_ORDER.indexOf(d)).filter(i => i >= 0);
    const isRange = indices.length >= 2 && indices.every((v, i) => i === 0 || v === indices[i - 1] + 1);
    if (isRange) {
      parts.push(`${FULL_DAY_SHORT[sorted[0]] ?? sorted[0]} a ${FULL_DAY_SHORT[sorted[sorted.length - 1]] ?? sorted[sorted.length - 1]}`);
    } else {
      parts.push(sorted.map(d => FULL_DAY_SHORT[d] ?? d).join(", "));
    }
  } else if (diasAbbr?.length) {
    // Old abbreviated format stored in horarios.dias
    parts.push(diasAbbr.join(", "));
  }
  if (desde && hasta) parts.push(`${desde}–${hasta}`);
  return parts.join(" · ") || "";
}

function rowToMaster(row: Record<string, unknown>): Master {
  const nombre   = (row.nombre   as string)   ?? "Maestro";
  const ciudades = (row.ciudades as string[])  ?? [];
  const horario  = row.horarios as HorarioRow;
  const social   = row.social   as SocialRow;

  // Prefer dias_disponibles column; fall back to inferring from horario.tipo (old form format)
  const diasFromDb = (row.dias_disponibles as string[]) ?? [];
  const diasDisponibles = diasFromDb.length > 0 ? diasFromDb : inferDiasFromTipo(horario?.tipo);

  const initials = nombre.split(" ").slice(0, 2).map((w: string) => w[0] ?? "").join("").toUpperCase();

  const schedule = formatSchedule(diasDisponibles, horario?.dias, horario?.desde, horario?.hasta);

  const paymentMethods = (row.formas_pago as string[]) ?? [];
  const paymentSchedule = (() => {
    const mc = row.modalidad_cobro;
    if (Array.isArray(mc)) return mc as string[];
    if (typeof mc === "string" && mc) {
      try { const p = JSON.parse(mc); return Array.isArray(p) ? p as string[] : [mc]; } catch { return [mc]; }
    }
    return [];
  })();

  return {
    id:             row.id as string,
    name:           nombre,
    initials,
    photoUrl:       (row.foto_url as string) || undefined,
    disponibilidad: (row.disponibilidad as string) || "disponible",
    specialties: (row.especialidades as string[]) ?? [],
    city:        ciudades[0] ?? "Chile",
    sector:      ciudades.join(", "),
    phone:       (row.telefono as string) ?? "",
    schedule,
    rating:      0,
    jobs:        0,
    yearsExp:    (row.anos_experiencia as number) || 0,
    verified:    !!(row.verificado as boolean) || (row.verificacion_estado as string) === "aprobado",
    description: (row.descripcion as string) ?? "",
    gallery:     [],
    quote:       (row.frase_destacada as string) || undefined,
    paymentMethods:  paymentMethods.length  > 0 ? paymentMethods  : undefined,
    paymentSchedule: paymentSchedule.length > 0 ? paymentSchedule : undefined,
    atiendeUrgencias:      !!(row.atiende_urgencias as boolean),
    especialidadesUrgencia: (row.especialidades_urgencia as string[]) ?? [],
    createdAt:             (row.created_at as string) || undefined,
    social: {
      whatsapp:  social?.whatsapp  ?? undefined,
      instagram: social?.instagram ?? undefined,
      facebook:  social?.facebook  ?? undefined,
      tiktok:    social?.tiktok    ?? undefined,
    },
  };
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function PerfilMaestro({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();

  type ResenaRow = {
    cliente_nombre: string | null;
    calificacion: number;
    comentario: string;
    created_at: string;
    tags: string[] | null;
    tags_negativos: string[] | null;
    tipo_trabajo: string | null;
    fotos: string[] | null;
  };

  let m: Master;
  let fotos: FotoRow[]    = [];
  let videoUrl: string | null = null;
  let colorIdx             = 0;
  let isReal               = false;
  let maestroClerkId: string | null = null;
  let resenas: ResenaRow[] = [];
  let hasReviewed          = false;
  let userName             = "";
  let existingReviewData: ExistingReview | null = null;
  let clerkUser: Awaited<ReturnType<typeof currentUser>> = null;

  if (UUID_RE.test(id)) {
    const [{ data: row }, { data: resenaData }, fetchedClerkUser, { data: existingReview }, { data: clienteProfile }] = await Promise.all([
      getSupabaseAdmin()
        .from("maestros")
        .select("*, verificado, verificacion_estado, fotos_trabajos(url, descripcion)")
        .eq("id", id)
        .eq("activo", true)
        .single(),
      getSupabaseAdmin()
        .from("resenas")
        .select("cliente_nombre, calificacion, comentario, created_at, tags, tags_negativos, tipo_trabajo, fotos")
        .eq("maestro_id", id)
        .order("created_at", { ascending: false }),
      currentUser(),
      userId
        ? getSupabaseAdmin().from("resenas")
            .select("calificacion, comentario, tags, tags_negativos, tipo_trabajo, fotos")
            .eq("maestro_id", id).eq("clerk_user_id", userId).maybeSingle()
        : Promise.resolve({ data: null }),
      userId
        ? getSupabaseAdmin().from("clientes").select("nombre").eq("user_id", userId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    if (!row) notFound();

    clerkUser      = fetchedClerkUser;
    resenas        = (resenaData ?? []) as ResenaRow[];
    m              = rowToMaster(row as Record<string, unknown>);
    fotos          = (row.fotos_trabajos ?? []) as FotoRow[];
    videoUrl       = (row as Record<string, unknown>).video_url as string | null ?? null;
    console.log("[maestro profile] video_url:", videoUrl);
    isReal         = true;
    colorIdx       = 0;
    maestroClerkId = (row as Record<string, unknown>).clerk_user_id as string ?? null;
    hasReviewed       = !!existingReview;
    existingReviewData = existingReview
      ? (existingReview as unknown as ExistingReview)
      : null;
    // Prefer nombre from Supabase clientes over Clerk display name
    userName       = (clienteProfile as { nombre?: string } | null)?.nombre
      ?? [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ");

    if (resenas.length > 0) {
      m.jobs   = resenas.length;
      m.rating = Math.round(resenas.reduce((s, r) => s + r.calificacion, 0) / resenas.length * 10) / 10;
    }
  } else {
    const idx = SAMPLE_MASTERS.findIndex(s => s.id === id);
    m        = idx !== -1 ? SAMPLE_MASTERS[idx] : SAMPLE_MASTERS[0];
    if (!m) notFound();
    colorIdx = idx;
  }

  const [bg, fg]    = AV_COLORS[colorIdx % AV_COLORS.length];
  const isLoggedIn   = !!userId;
  const isOwnProfile = !!userId && !!maestroClerkId && userId === maestroClerkId;
  const isMaestro    = (clerkUser?.publicMetadata?.role as string | undefined) === "maestro";

  // Track profile visit — real profiles only, skip own views, deduplicate by IP per 24 h
  if (isReal && !isOwnProfile) {
    const hdrs      = await headers();
    const visitorIp = hdrs.get("x-forwarded-for")?.split(",")[0].trim()
                   ?? hdrs.get("x-real-ip")
                   ?? "unknown";
    const since24h  = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recent } = await getSupabaseAdmin()
      .from("perfil_visitas")
      .select("id", { count: "exact", head: true })
      .eq("maestro_id", m.id)
      .eq("visitor_ip", visitorIp)
      .gte("visited_at", since24h);
    if ((recent ?? 0) === 0) {
      await getSupabaseAdmin()
        .from("perfil_visitas")
        .insert({ maestro_id: m.id, visitor_ip: visitorIp });
    }
  }

  const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const reviews = isReal
    ? resenas.map(r => ({
        author:         r.cliente_nombre ?? "Cliente anónimo",
        date:           `${MONTHS[new Date(r.created_at).getMonth()]} ${new Date(r.created_at).getFullYear()}`,
        text:           r.comentario,
        rating:         r.calificacion,
        tags:           r.tags,
        tags_negativos: r.tags_negativos,
        tipo_trabajo:   r.tipo_trabajo,
        fotos:          r.fotos,
      }))
    : SEED_REVIEWS;

  return (
    <div style={{ background: "var(--bg)", minHeight: "70vh" }}>

      {/* Back bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "12px 0" }}>
        <div className="wrap">
          <Link href="/buscar" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mute)", textDecoration: "none", fontWeight: 500 }}>
            <BackIcon /> Volver a resultados
          </Link>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div className="maestro-grid">

          {/* LEFT column */}
          <div className="col gap-24">

            {/* Header — hidden on mobile (ProfessionalCard shows it) */}
            <div className="maestro-profile-header" style={{ background: "#fff", border: "1px solid var(--line)", padding: 28 }}>
              <div className="row gap-20 wrap-flex" style={{ alignItems: "flex-start" }}>
                <ProfilePhotoLightbox
                  photoUrl={m.photoUrl ?? ""}
                  name={m.name}
                  initials={m.initials}
                  bg={bg}
                  fg={fg}
                  size={160}
                />
                <div className="col gap-8" style={{ flex: 1, minWidth: 0 }}>
                  <div className="row center gap-10 wrap-flex">
                    <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, margin: 0, color: "var(--ink)" }}>
                      {m.name}
                    </h1>
                    {MOSTRAR_BADGE_VERIFICADO && m.verified && <span className="verified"><CheckIcon /> Verificado</span>}
                    <AvailabilityPicker initialStatus={m.disponibilidad} isOwnProfile={isOwnProfile} />
                    {!isOwnProfile && m.atiendeUrgencias && (
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:5,
                        background:"#FEF2F2", border:"1.5px solid #FCA5A5",
                        color:"#DC2626", fontSize:11.5, fontWeight:700,
                        padding:"3px 10px", fontFamily:"var(--font-jetbrains),monospace",
                        letterSpacing:"0.04em",
                      }}>
                        🚨 Atiende urgencias
                      </span>
                    )}
                  </div>
                  {isOwnProfile && (
                    <div>
                      <UrgencyToggle initialValue={m.atiendeUrgencias ?? false} variant="light" />
                    </div>
                  )}
                  <div className="row gap-6 wrap-flex">
                    {m.specialties.map(sp => <span key={sp} className="chip chip-dark">{sp}</span>)}
                  </div>
                  {isOwnProfile && (
                    <div>
                      <Link
                        href="/dashboard/maestro/completar-perfil"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: "var(--orange)", color: "#fff",
                          padding: "7px 16px", fontSize: 13, fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        ✏️ Editar perfil
                      </Link>
                    </div>
                  )}
                  <div className="row gap-16 wrap-flex" style={{ fontSize: 13.5, color: "var(--mute)", marginTop: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ color: m.rating > 0 ? "var(--orange)" : "#D1D5DB", display: "flex", gap: 1 }}>
                        {[1,2,3,4,5].map(i => <StarIcon key={i} size={14} filled={i <= Math.round(m.rating)} />)}
                      </span>
                      {m.rating > 0 ? (
                        <>
                          <strong style={{ color: "var(--ink)", fontFamily: "var(--font-jetbrains), monospace" }}>{m.rating.toFixed(1)}</strong>
                          <span>· {m.jobs} reseña{m.jobs !== 1 ? "s" : ""}</span>
                        </>
                      ) : (
                        <span style={{ color: "var(--mute)" }}>Sin reseñas aún</span>
                      )}
                    </span>
                    {m.city && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}><PinIcon /> {m.city}</span>
                    )}
                    {m.yearsExp > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}><ClockIcon /> {m.yearsExp} años de experiencia</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {m.description && (
              <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 24 }}>
                <span className="label" style={{ marginBottom: 12, display: "block" }}>// Sobre {m.name.split(" ")[0]}</span>
                <p style={{ fontSize: 15.5, color: "var(--ink-soft)", lineHeight: 1.65, margin: 0 }}>{m.description}</p>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
                  {m.phone && (
                    <a
                      href={`tel:${m.phone}`}
                      title="Llamar directamente"
                      className="phone-link"
                      style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--mute)", textDecoration: "none" }}
                    >
                      <PhoneIcon /> {m.phone}
                    </a>
                  )}
                  {m.schedule && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--mute)" }}>
                      <ClockIcon /> {m.schedule}
                    </div>
                  )}
                  {m.sector && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--mute)" }}>
                      <PinIcon /> {m.sector}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Video — only renders when video_url column exists in DB and has a value */}
            {videoUrl && getVideoPlatform(videoUrl) === "youtube" && getYouTubeId(videoUrl) && (
              <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 24 }}>
                <span className="label" style={{ marginBottom: 16, display: "block" }}>// VIDEO DE TRABAJOS</span>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 8 }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video del maestro"
                  />
                </div>
              </div>
            )}
            {videoUrl && getVideoPlatform(videoUrl) === "tiktok" && (
              <VideoLinkCard url={videoUrl} icon="🎵" label="TikTok" color="#010101" border="rgba(0,0,0,0.15)" name={m.name.split(" ")[0]} />
            )}
            {videoUrl && getVideoPlatform(videoUrl) === "instagram" && (
              <VideoLinkCard url={videoUrl} icon="📸" label="Instagram" color="#E1306C" border="rgba(225,48,108,0.2)" name={m.name.split(" ")[0]} />
            )}
            {videoUrl && getVideoPlatform(videoUrl) === "facebook" && (
              <VideoLinkCard url={videoUrl} icon="📘" label="Facebook" color="#1877F2" border="rgba(24,119,242,0.2)" name={m.name.split(" ")[0]} />
            )}

            {/* Galería */}
            {(fotos.length > 0 || m.gallery.length > 0) && (
              <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 24 }}>
                <span className="label" style={{ marginBottom: 16, display: "block" }}>// Galería de trabajos</span>
                {fotos.length > 0
                  ? <GalleryCarousel fotos={fotos} />
                  : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                      {m.gallery.map((label, i) => (
                        <div key={i} className="photo-ph" style={{ aspectRatio: "4/3" }}>
                          <div className="ph-label">📷 {label}</div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            )}

            {/* Formas de pago */}
            {m.paymentMethods && m.paymentMethods.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 24 }}>
                <span className="label" style={{ marginBottom: 16, display: "block" }}>// Formas y modalidad de pago</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--navy)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Acepta</div>
                    <div className="col gap-6">
                      {m.paymentMethods.map(pm => (
                        <div key={pm} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
                          <span style={{ width: 20, height: 20, background: "rgba(232,108,28,0.12)", color: "var(--orange)", display: "grid", placeItems: "center", borderRadius: 4, flexShrink: 0 }}><CheckIcon /></span>
                          {pm}
                        </div>
                      ))}
                    </div>
                  </div>
                  {(m.paymentSchedule ?? []).length > 0 && (
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--navy)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Modalidad</div>
                      <div className="col gap-6">
                        {(m.paymentSchedule ?? []).map(ps => (
                          <div key={ps} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
                            <span style={{ width: 20, height: 20, background: "rgba(20,55,95,0.1)", color: "var(--navy)", display: "grid", placeItems: "center", borderRadius: 4, flexShrink: 0 }}><CheckIcon /></span>
                            {ps}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reseñas */}
            <ReviewSection masterId={m.id} masterName={m.name} initialReviews={reviews} isLoggedIn={isLoggedIn} isOwnProfile={isOwnProfile} isMaestro={isMaestro} userName={userName} hasReviewed={hasReviewed} existingReview={existingReviewData} />
          </div>

          {/* RIGHT — ProfessionalCard (same for both real and demo) */}
          <div className="maestro-card-wrap">
            <ProfessionalCard m={m} bg={bg} fg={fg} maestroId={m.id} />
          </div>

        </div>
      </div>
    </div>
  );
}
