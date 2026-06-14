import Link from "next/link";
import { HomeSearch } from "@/components/HomeSearch";
import FadeIn from "./_home/FadeIn";
import HowSection from "./_home/HowSection";
import StatsBanner from "./_home/StatsBanner";
import BannerMaestros from "./_home/BannerMaestros";
import Especialidades from "./_home/Especialidades";
import MaestrosDestacados, { type MaestroCard } from "./_home/MaestrosDestacados";
import Testimonios from "./_home/Testimonios";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ShieldCheck, Gift, Star } from "lucide-react";

export default async function Home() {
  // ── Hero stats ───────────────────────────────────────────────────────────────
  let heroStats = { maestros: 0, resenas: 0, calificacion: 0 };
  try {
    const [
      { count: maestrosCount },
      { count: resenasCount },
      { data: resenasCalData },
    ] = await Promise.all([
      getSupabaseAdmin().from("maestros").select("*", { count: "exact", head: true }).eq("activo", true),
      getSupabaseAdmin().from("resenas").select("*", { count: "exact", head: true }),
      getSupabaseAdmin().from("resenas").select("calificacion"),
    ]);

    heroStats.maestros = maestrosCount ?? 0;
    heroStats.resenas  = resenasCount  ?? 0;

    if (resenasCalData && resenasCalData.length > 0) {
      heroStats.calificacion = Math.round(
        (resenasCalData as { calificacion: number }[])
          .reduce((sum, r) => sum + r.calificacion, 0) / resenasCalData.length * 10
      ) / 10;
    }
  } catch { /* fallback */ }

  // ── Maestros destacados ──────────────────────────────────────────────────────
  let featuredMaestros: MaestroCard[] = [];
  try {
    const { data: rows } = await getSupabaseAdmin()
      .from("maestros")
      .select("id, nombre, foto_url, especialidades, ciudades, descripcion, verificado, verificacion_estado")
      .eq("activo", true)
      .order("verificado", { ascending: false })
      .limit(6);

    if (rows && rows.length > 0) {
      // Fetch ratings
      const { data: resenas } = await getSupabaseAdmin()
        .from("resenas")
        .select("maestro_id, calificacion")
        .in("maestro_id", rows.map((r: Record<string, unknown>) => r.id));

      const ratingMap: Record<string, { sum: number; count: number }> = {};
      for (const r of resenas ?? []) {
        if (!ratingMap[r.maestro_id]) ratingMap[r.maestro_id] = { sum: 0, count: 0 };
        ratingMap[r.maestro_id].sum   += r.calificacion;
        ratingMap[r.maestro_id].count += 1;
      }

      featuredMaestros = (rows as Record<string, unknown>[]).map(r => {
        const nombre = (r.nombre as string) ?? "Maestro";
        const initials = nombre.split(" ").slice(0, 2).map((w: string) => w[0] ?? "").join("").toUpperCase();
        const ciudades = (r.ciudades as string[]) ?? [];
        const s = ratingMap[r.id as string];
        return {
          id:          r.id as string,
          name:        nombre,
          initials,
          photoUrl:    (r.foto_url as string) || undefined,
          specialties: (r.especialidades as string[]) ?? [],
          city:        ciudades[0] ?? "Chile",
          rating:      s ? Math.round(s.sum / s.count * 10) / 10 : 0,
          jobs:        s?.count ?? 0,
          verified:    !!(r.verificado as boolean) || (r.verificacion_estado as string) === "aprobado",
          description: (r.descripcion as string) ?? "",
        };
      });
    }
  } catch { /* fallback */ }

  return (
    <main>
      {/* ── BUSCADOR ──────────────────────────────────────────────────────────── */}
      <HomeSearch />

      {/* ── STATS BAR ─────────────────────────────────────────────────────────── */}
      <StatsBanner
        maestros={heroStats.maestros}
        resenas={heroStats.resenas}
        calificacion={heroStats.calificacion}
      />

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
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
            backgroundPosition: "60% 15%",
          }}>
            <div className="hero-overlay" style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "linear-gradient(to right, rgba(248,245,240,0.96) 0%, rgba(248,245,240,0.96) 42%, rgba(248,245,240,0.4) 62%, transparent 80%)",
            }} />

            <div className="hero-text">
              <div style={{ marginBottom: 14 }}>
                <span className="hero-badge" style={{ color: "#FFFFFF", backgroundColor: "#1B2B4B" }}>
                  <span style={{ width: 5, height: 5, background: "#F97316", borderRadius: "50%", flexShrink: 0 }} />
                  ObraBien · Plataforma chilena
                </span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontSize: "clamp(26px, 2.8vw, 44px)", fontWeight: 900, lineHeight: 1.05,
                color: "#1B2B4B", letterSpacing: "-0.025em", margin: "0 0 12px",
              }}>
                Encuentra<br />
                <span style={{ color: "#F97316" }}>maestros confiables</span><br />
                para tu proyecto.
              </h1>

              <p style={{ fontSize: 14.5, color: "#475569", margin: "0 0 16px", lineHeight: 1.6 }}>
                Albañiles, gasfiter, electricistas, carpinteros y más.
                Revisa perfiles, reseñas reales y contáctalos directo — sin intermediarios.
              </p>

              <div className="hero-trust" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
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

              <div className="hero-cta-buttons" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
        </div>
      </div>

      {/* ── BANNER MAESTROS ───────────────────────────────────────────────────── */}
      <FadeIn>
        <BannerMaestros />
      </FadeIn>

      {/* ── CÓMO FUNCIONA ─────────────────────────────────────────────────────── */}
      <FadeIn>
        <HowSection />
      </FadeIn>

      {/* ── ESPECIALIDADES ────────────────────────────────────────────────────── */}
      <FadeIn>
        <Especialidades />
      </FadeIn>

      {/* ── MAESTROS DESTACADOS ───────────────────────────────────────────────── */}
      <FadeIn>
        <MaestrosDestacados maestros={featuredMaestros} />
      </FadeIn>

      {/* ── TESTIMONIOS ───────────────────────────────────────────────────────── */}
      <FadeIn>
        <Testimonios />
      </FadeIn>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────────── */}
      <FadeIn>
        <section style={{ background: "var(--bg)", padding: "72px 0" }}>
          <div className="wrap">
            <div className="cta-final-grid">
              {/* Bloque cliente — naranja */}
              <div style={{
                background: "var(--orange)", borderRadius: 12, padding: "40px 36px",
                display: "flex", flexDirection: "column", gap: 16,
              }}>
                <div style={{ fontSize: 36 }}>🔍</div>
                <h2 style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 900, fontSize: "clamp(22px, 2.8vw, 32px)",
                  color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.15, margin: 0,
                }}>
                  ¿Listo para encontrar al maestro ideal?
                </h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, margin: 0 }}>
                  Busca gratis entre maestros verificados de tu ciudad.
                  Sin registro obligatorio.
                </p>
                <Link href="/buscar" style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "#fff", color: "var(--orange)",
                  fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800,
                  fontSize: 15, padding: "14px 28px", borderRadius: 8,
                  textDecoration: "none", letterSpacing: "-0.01em", alignSelf: "flex-start",
                }}>
                  Buscar maestros →
                </Link>
              </div>

              {/* Bloque maestro — navy */}
              <div style={{
                background: "var(--navy)", borderRadius: 12, padding: "40px 36px",
                display: "flex", flexDirection: "column", gap: 16,
              }}>
                <div style={{ fontSize: 36 }}>⛑</div>
                <h2 style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 900, fontSize: "clamp(22px, 2.8vw, 32px)",
                  color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.15, margin: 0,
                }}>
                  ¿Eres maestro?
                </h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: 0 }}>
                  Crea tu perfil gratis, recibe contactos y haz crecer tu negocio.
                  Sin comisiones ni intermediarios.
                </p>
                <Link href="/registro?tab=maestro" style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "var(--orange)", color: "#fff",
                  fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800,
                  fontSize: 15, padding: "14px 28px", borderRadius: 8,
                  textDecoration: "none", letterSpacing: "-0.01em", alignSelf: "flex-start",
                }}>
                  Registrarme como maestro →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>
    </main>
  );
}
