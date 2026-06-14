import Link from "next/link";
import { HomeSearch } from "@/components/HomeSearch";
import FadeIn from "./_home/FadeIn";
import HowSection from "./_home/HowSection";
import AprendeSection, { type RecursoDestacado } from "./_home/AprendeSection";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ShieldCheck, BadgeCheck, Gift, Star } from "lucide-react";

export default async function Home() {
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

  const displayMaestros = heroStats.maestros > 0 ? heroStats.maestros : 0;
  const displayCiudades = heroStats.ciudades  > 0 ? heroStats.ciudades  : 0;

  return (
    <main>
      <HomeSearch />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg)", padding: "8px 0 0" }}>
        <div className="wrap">
      <section className="hero-section-img" style={{
        position: "relative",
        width: "100%",
        minHeight: 400,
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
          <div style={{ marginBottom: 14 }}>
            <span className="hero-badge" style={{ color: "#FFFFFF", backgroundColor: "#1B2B4B" }}>
              <span style={{ width: 5, height: 5, background: "#F97316", borderRadius: "50%", flexShrink: 0 }} />
              ObraBien · Plataforma chilena
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: "clamp(26px, 2.8vw, 44px)", fontWeight: 900, lineHeight: 1.05,
            color: "#1B2B4B", letterSpacing: "-0.025em", margin: "0 0 12px",
          }}>
            Encuentra<br />
            <span style={{ color: "#F97316" }}>maestros confiables</span><br />
            para tu proyecto.
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 14.5, color: "#475569", margin: "0 0 16px", lineHeight: 1.6 }}>
            Albañiles, gasfiter, electricistas, carpinteros y más.
            Revisa perfiles, reseñas reales y contáctalos directo — sin intermediarios.
          </p>

          {/* Trust items */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
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

      {/* ── STATS BAR — oculta temporalmente ── */}

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────────── */}
      <FadeIn>
        <HowSection />
      </FadeIn>

      {/* ── APRENDE ──────────────────────────────────────────────────────────── */}
      {featuredRecursos.length > 0 && (
        <FadeIn>
          <AprendeSection recursos={featuredRecursos} />
        </FadeIn>
      )}

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
