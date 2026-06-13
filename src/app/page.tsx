import Link from "next/link";
import Image from "next/image";
import { LogoMark } from "@/components/LogoMark";
import { HomeSearch } from "@/components/HomeSearch";
import { SPECIALTIES, SAMPLE_MASTERS } from "@/lib/data";
import { getIllustration } from "@/components/SpecialtyIllustrations";
import FadeIn from "./_home/FadeIn";
import FeaturedCarousel from "./_home/FeaturedCarousel";
import HowSection from "./_home/HowSection";
import MarketSection from "./_home/MarketSection";
import AprendeSection, { type RecursoDestacado } from "./_home/AprendeSection";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { rowToListing, type MarketplaceListing } from "@/lib/marketplace";
import { Users, Star, TrendingUp, MapPin, ShieldCheck, BadgeCheck, Gift } from "lucide-react";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function SpecialtyIcon({ name, size = 22 }: { name: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "Albañil": return <svg {...p}><rect x="3" y="5" width="6" height="4" /><rect x="9" y="5" width="6" height="4" /><rect x="15" y="5" width="6" height="4" /><rect x="6" y="9" width="6" height="4" style={{ color: "var(--orange)" }} /><rect x="12" y="9" width="6" height="4" /><rect x="3" y="13" width="6" height="4" /><rect x="9" y="13" width="6" height="4" /><rect x="15" y="13" width="6" height="4" /></svg>;
    case "Gasfiter": return <svg {...p}><path d="M4 4v6h5a3 3 0 0 1 3 3v7" /><path d="M2 4h4M2 10h4M10 20h4" /><rect x="14" y="6" width="6" height="3" rx="0.5" /><path d="M17 9v2" /></svg>;
    case "Electricista": return <svg {...p}><path d="M13 2 L4 14 H11 L10 22 L20 10 H13 Z" fill="currentColor" strokeWidth="1.4" /></svg>;
    case "Carpintero": return <svg {...p}><path d="M13 3 L21 7 L18 13 L10 9 Z" fill="currentColor" /><path d="M10 9 L3 20" strokeWidth="2.2" /></svg>;
    case "Pintor": return <svg {...p}><rect x="3" y="4" width="14" height="5" rx="1" fill="currentColor" /><path d="M17 6h2v3h-7v3M12 12 L12 20" /><circle cx="12" cy="22" r="1" fill="currentColor" /></svg>;
    case "Ceramista": return <svg {...p}><rect x="3" y="3" width="8" height="8" rx="0.5" /><rect x="13" y="3" width="8" height="8" rx="0.5" fill="currentColor" /><rect x="3" y="13" width="8" height="8" rx="0.5" fill="currentColor" /><rect x="13" y="13" width="8" height="8" rx="0.5" /></svg>;
    case "Soldador": return <svg {...p}><path d="M6 4 H18 V12 A6 6 0 0 1 12 18 A6 6 0 0 1 6 12 Z" /><rect x="9" y="8" width="6" height="3" rx="0.4" fill="currentColor" /></svg>;
    case "Techumbre": return <svg {...p}><path d="M2 12 L12 4 L22 12" strokeWidth="2.2" /><path d="M5 11 V20 H19 V11M10 20 V14 H14 V20" /></svg>;
    case "Yesero": return <svg {...p}><path d="M3 21 L9 15" strokeWidth="2.2" /><path d="M9 15 L19 5 A2 2 0 0 0 17 3 L7 13 Z" fill="currentColor" /></svg>;
    case "Drywall": return <svg {...p}><rect x="3" y="5" width="18" height="3" rx="0.4" /><rect x="3" y="10" width="18" height="3" rx="0.4" /><rect x="3" y="15" width="18" height="3" rx="0.4" fill="currentColor" /></svg>;
    case "Instalación de pisos": return <svg {...p}><rect x="3" y="4" width="18" height="4" /><path d="M8 4 V8 M14 4 V8" /><rect x="3" y="10" width="18" height="4" fill="currentColor" /><rect x="3" y="16" width="18" height="4" /></svg>;
    case "Instalación de ventanas": return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M12 3 V21 M3 12 H21" /><rect x="4.5" y="4.5" width="6" height="6" fill="currentColor" opacity="0.85" /></svg>;
    case "Instalador de cámaras": return <svg {...p}><rect x="3" y="6" width="13" height="7" rx="1.5" /><path d="M16 8 L21 5 V14 L16 11 Z" fill="currentColor" /><circle cx="7" cy="9.5" r="1.4" fill="currentColor" /></svg>;
    case "Aire acondicionado": return <svg {...p}><rect x="3" y="5" width="18" height="8" rx="1.5" /><path d="M5 9 H19M7 16 q1 1.5 0 3 M12 16 q1 1.5 0 3 M17 16 q1 1.5 0 3" /></svg>;
    case "Mantención de jardines": return <svg {...p}><path d="M4 20 C 4 6 18 4 20 4 C 20 6 18 20 4 20 Z" fill="currentColor" /><path d="M4 20 L20 4" stroke="white" strokeOpacity="0.8" /></svg>;
    case "Excavaciones": return <svg {...p}><rect x="3" y="14" width="14" height="4" rx="1" /><circle cx="6" cy="20" r="1.6" /><circle cx="14" cy="20" r="1.6" /><path d="M8 14 V10 L13 7M13 7 L20 3 L21 5 L17 11 Z" fill="currentColor" /></svg>;
    case "Paneles solares": return <svg {...p}><circle cx="6" cy="6" r="2.4" fill="currentColor" /><path d="M6 1.5 V2.5 M6 9.5 V10.5 M1.5 6 H2.5 M9.5 6 H10.5" /><path d="M9 13 L21 11 L23 19 L11 21 Z M13 12.4 L15 20.6 M17 11.6 L19 19.8 M9.7 16 L22 14 M10.4 19 L22.7 17" /></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

const COMUNIDAD_POSTS = [
  { title: "¿Cuánto cobrar por metro cuadrado de pintura interior?", category: "Precios y tarifas", author: "Pedro R.", time: "Hace 2h", replies: 12 },
  { title: "Problema con humedad en muro de hormigón, ¿qué producto usar?", category: "Técnicas y materiales", author: "María C.", time: "Hace 5h", replies: 8 },
  { title: "¿Vale la pena certificarse como instalador eléctrico en 2025?", category: "Formación y certificaciones", author: "Carlos M.", time: "Hace 1 día", replies: 23 },
];

export default async function Home() {
  // ── Marketplace listings ──────────────────────────────────────────────────────
  let listings: MarketplaceListing[] = [];
  try {
    const { data } = await getSupabaseAdmin()
      .from("marketplace_items")
      .select("*")
      .eq("activo", true)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) listings = data.map(rowToListing);
  } catch { /* silently fall back */ }

  // ── Recursos destacados ───────────────────────────────────────────────────────
  let featuredRecursos: RecursoDestacado[] = [];
  try {
    const { data } = await getSupabaseAdmin()
      .from("recursos")
      .select("id, titulo, descripcion, tipo, categoria, imagen_url, video_url, imagenes_extra")
      .eq("destacado", true)
      .eq("estado", "publicado")
      .order("created_at", { ascending: false })
      .limit(12);
    if (data) featuredRecursos = data as RecursoDestacado[];
  } catch { /* silently fall back */ }

  // ── Hero & stats data from Supabase ──────────────────────────────────────────
  let heroStats = { maestros: 0, resenas: 0, calificacion: 0, ciudades: 0 };
  try {
    const [
      { count: maestrosCount },
      { count: resenasCount },
      { data: resenasCalData },
      { data: ciudadesData },
    ] = await Promise.all([
      getSupabaseAdmin().from("maestros").select("*", { count: "exact", head: true }).eq("activo", true),
      getSupabaseAdmin().from("resenas").select("*", { count: "exact", head: true }),
      getSupabaseAdmin().from("resenas").select("calificacion"),
      getSupabaseAdmin().from("maestros").select("ciudades").eq("activo", true),
    ]);

    heroStats.maestros = maestrosCount ?? 0;
    heroStats.resenas  = resenasCount  ?? 0;

    if (resenasCalData && resenasCalData.length > 0) {
      heroStats.calificacion = Math.round(
        (resenasCalData as { calificacion: number }[])
          .reduce((sum, r) => sum + r.calificacion, 0) / resenasCalData.length * 10
      ) / 10;
    }

    if (ciudadesData) {
      const allCities = new Set(
        (ciudadesData as { ciudades: string[] | null }[])
          .flatMap(m => m.ciudades ?? [])
      );
      heroStats.ciudades = allCities.size;
    }
  } catch { /* silently fall back */ }

  const displayMaestros = heroStats.maestros > 0 ? heroStats.maestros : SAMPLE_MASTERS.length;
  const displayCiudades = heroStats.ciudades  > 0 ? heroStats.ciudades  : new Set(SAMPLE_MASTERS.map(m => m.city)).size;
  const displayResenas  = heroStats.resenas   > 0 ? String(heroStats.resenas) : "—";
  const displayCal      = heroStats.calificacion > 0 ? `${heroStats.calificacion.toFixed(1)}/5` : "—";

  const specialtiesStats = { total: SAMPLE_MASTERS.length, cities: new Set(SAMPLE_MASTERS.map(m => m.city)).size };

  return (
    <main>
      <HomeSearch />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg)", padding: "16px 0 0" }}>
        <div className="wrap">
      <section className="hero-section-img" style={{
        position: "relative",
        width: "100%",
        minHeight: 550,
        margin: 0,
        overflow: "hidden",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        backgroundImage: "url(https://res.cloudinary.com/dur4ffxqw/image/upload/v1781320539/ChatGPT_Image_12_jun_2026_11_14_35_p.m._ehnqce.png)",
        backgroundSize: "cover",
        backgroundPosition: "60% center",
      }}>
        {/* Overlay — CSS mobile override changes to solid white */}
        <div className="hero-overlay" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to right, rgba(248,245,240,0.96) 0%, rgba(248,245,240,0.96) 42%, rgba(248,245,240,0.4) 62%, transparent 80%)",
        }} />

        {/* Content */}
        <div className="hero-text">

          {/* Badge */}
          <div style={{ marginBottom: 22 }}>
            <span className="hero-badge">
              <span style={{ width: 5, height: 5, background: "#F97316", borderRadius: "50%", flexShrink: 0 }} />
              ObraBien · Plataforma chilena
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: "clamp(30px, 3.6vw, 56px)", fontWeight: 900, lineHeight: 1.05,
            color: "#1B2B4B", letterSpacing: "-0.025em", margin: "0 0 18px",
          }}>
            Encuentra<br />
            <span style={{ color: "#F97316" }}>maestros confiables</span><br />
            para tu proyecto.
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 15.5, color: "#475569", margin: "0 0 24px", lineHeight: 1.65 }}>
            Albañiles, gasfiter, electricistas, carpinteros y más.
            Revisa perfiles, reseñas reales y contáctalos directo — sin intermediarios.
          </p>

          {/* Trust items */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", marginBottom: 30 }}>
            {[
              { Icon: ShieldCheck, label: "Maestros verificados" },
              { Icon: Star,        label: "Calificaciones reales" },
              { Icon: Gift,        label: "100% gratis" },
            ].map(({ Icon, label }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, color: "#1B2B4B", fontSize: 13, fontWeight: 600 }}>
                <Icon size={15} color="#F97316" strokeWidth={2.2} />
                {label}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { href: "/buscar",   bg: "#F97316", label: "Busca tu Maestro" },
              { href: "/registro", bg: "#1B2B4B", label: "Regístrate como Maestro" },
            ].map(({ href, bg, label }) => (
              <Link key={href} href={href} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: bg, color: "#fff",
                width: 280, height: 52, borderRadius: 8,
                fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 15,
                textDecoration: "none", letterSpacing: "-0.01em", whiteSpace: "nowrap",
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
        </div>{/* /.wrap */}
      </div>{/* /hero wrapper */}

      {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
      <section style={{ background: "#fff", boxShadow: "0 4px 24px rgba(27,43,75,0.10)", position: "relative", zIndex: 10 }}>
        <div className="wrap">
          <div className="stats-grid">
            {[
              { Icon: Users,       value: displayMaestros,           label: "Maestros registrados" },
              { Icon: Star,        value: displayResenas,   label: "Reseñas publicadas" },
              { Icon: TrendingUp,  value: displayCal,       label: "Calificación promedio" },
              { Icon: MapPin,      value: displayCiudades,            label: "Ciudades activas" },
            ].map(({ Icon, value, label }, i) => (
              <div key={label} style={{
                padding: "28px 16px", textAlign: "center",
                borderRight: i < 3 ? "1px solid #E2E8F0" : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <Icon size={22} color="#F97316" strokeWidth={1.8} />
                </div>
                <div style={{
                  fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900,
                  fontSize: "clamp(26px, 3.5vw, 38px)", color: "#1B2B4B",
                  letterSpacing: "-0.03em", lineHeight: 1,
                  marginBottom: 6,
                }}>
                  {value}
                </div>
                <div style={{ fontSize: 12.5, color: "#64748B", fontWeight: 500 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────────── */}
      <FadeIn>
        <HowSection />
      </FadeIn>

      {/* ── MAESTROS DESTACADOS ──────────────────────────────────────────────── */}
      <FadeIn>
        <FeaturedCarousel />
      </FadeIn>

      {/* ── COMUNIDAD ────────────────────────────────────────────────────────── */}
      <FadeIn>
        <section style={{ background: "var(--navy)", color: "#fff" }}>
          <div className="tape-thin" />
          <div className="wrap" style={{ paddingTop: 56, paddingBottom: 64 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 36 }}>
              <div>
                <span className="label" style={{ color: "rgba(255,255,255,0.45)" }}>// Comunidad</span>
                <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, color: "#fff", margin: "6px 0 0", letterSpacing: "-0.02em" }}>
                  El foro del rubro<br />de la construcción.
                </h2>
              </div>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                {[
                  { value: "1.240", label: "Maestros activos" },
                  { value: "3.890", label: "Preguntas resueltas" },
                ].map(({ value, label }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: 34, color: "var(--orange)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                      {value}
                    </div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
              {COMUNIDAD_POSTS.map((p, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 38, height: 38, background: "rgba(232,108,28,0.2)", border: "1px solid rgba(232,108,28,0.4)",
                    display: "grid", placeItems: "center", flexShrink: 0, fontSize: 16,
                  }}>
                    💬
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
                      {p.category}
                    </div>
                    <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {p.title}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                    <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)" }}>{p.time}</span>
                    <span style={{ fontSize: 12, color: "var(--orange)", fontFamily: "var(--font-jetbrains), monospace", fontWeight: 600 }}>{p.replies} resp.</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <Link href="/comunidad"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--orange)", color: "#fff", fontWeight: 700, fontSize: 16, padding: "14px 32px", textDecoration: "none" }}>
                Entrar a la comunidad <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ── APRENDE ──────────────────────────────────────────────────────────── */}
      {featuredRecursos.length > 0 && (
        <FadeIn>
          <AprendeSection recursos={featuredRecursos} />
        </FadeIn>
      )}

      {/* ── MARKETPLACE ──────────────────────────────────────────────────────── */}
      <FadeIn>
        <MarketSection listings={listings} />
      </FadeIn>

      {/* ── ESPECIALIDADES ───────────────────────────────────────────────────── */}
      <FadeIn>
        <section className="block">
          <div className="wrap">
            <div className="row between center wrap-flex gap-12" style={{ marginBottom: 32 }}>
              <div>
                <span className="label">// Especialidades</span>
                <h2 className="display" style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, marginTop: 6 }}>
                  Todos los oficios de la construcción.
                </h2>
              </div>
            </div>

            <div className="spec-grid">
              {SPECIALTIES.map((s, idx) => {
                const count = SAMPLE_MASTERS.filter(m => m.specialties.includes(s)).length;
                const num = String(idx + 1).padStart(2, "0");
                return (
                  <Link key={s} href={`/buscar?esp=${encodeURIComponent(s)}`}
                    className="spec-card"
                    aria-label={`Buscar ${s} — ${count} ${count === 1 ? "maestro" : "maestros"}`}
                  >
                    <span className="spec-card-illust-wrap">
                      {getIllustration(s)}
                    </span>
                    <div className="spec-card-info">
                      <div className="spec-card-meta">
                        <span className="spec-card-num">#{num}</span>
                        <span className="spec-card-icon">
                          <SpecialtyIcon name={s} size={13} />
                        </span>
                        <span className="spec-card-name">{s}</span>
                      </div>
                      <div className={"spec-card-count" + (count === 0 ? " is-zero" : "")}>
                        <strong>{count}</strong> {count === 1 ? "maestro" : "maestros"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ── BANNER FINAL — ¿Eres maestro? ────────────────────────────────────── */}
      <FadeIn>
        <section style={{ background: "#1B2B4B", color: "#fff", paddingBottom: 72 }}>
          <div className="tape" />
          <div className="wrap" style={{ paddingTop: 72, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <BadgeCheck size={48} color="#F97316" strokeWidth={1.6} />
            </div>
            <h2 style={{
              fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900,
              fontSize: "clamp(30px, 4.5vw, 52px)", color: "#fff",
              letterSpacing: "-0.025em", lineHeight: 1.05, margin: "0 0 16px",
            }}>
              ¿Eres maestro?
            </h2>
            <p style={{ fontSize: 17.5, color: "rgba(255,255,255,0.65)", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.65 }}>
              Únete gratis a ObraBien y consigue nuevos clientes para crecer tu negocio.
              Sin comisiones, sin intermediarios — solo tú y tus clientes.
            </p>

            <Link href="/registro" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "transparent", color: "#fff",
              border: "2px solid rgba(255,255,255,0.70)",
              fontWeight: 800, fontSize: 16, padding: "15px 36px",
              textDecoration: "none", letterSpacing: "-0.01em",
              borderRadius: 10,
              transition: "background 0.2s",
            }}>
              ⛑ Regístrate como maestro
            </Link>

            <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap", marginTop: 52 }}>
              {[
                { value: `${displayMaestros}+`, label: "Maestros registrados" },
                { value: `${displayCiudades}`,  label: "Ciudades" },
                { value: "100%",                label: "Gratis" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: 42, color: "#F97316", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>
    </main>
  );
}
