import Link from "next/link";
import { HomeSearch } from "@/components/HomeSearch";
import FadeIn from "./_home/FadeIn";
import HowSection from "./_home/HowSection";
import BannerMaestros from "./_home/BannerMaestros";
import Especialidades from "./_home/Especialidades";
import MaestrosDestacados, { type MaestroCard } from "./_home/MaestrosDestacados";
import Testimonios from "./_home/Testimonios";
import HeroCarousel from "./_home/HeroCarousel";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export default async function Home() {
  // ── Maestros destacados ──────────────────────────────────────────────────────
  let featuredMaestros: MaestroCard[] = [];
  try {
    // Sin ORDER BY en la query: el ranking real (referidos > reseñas > rating)
    // requiere un agregado de maestro_referidos que Supabase no puede hacer vía
    // .order() directo, así que se trae el universo de activos y se ordena en
    // JS antes de cortar a 10 — mismo patrón que buscar/page.tsx.
    const { data: rows } = await getSupabaseAdmin()
      .from("maestros")
      .select("id, nombre, foto_url, especialidades, ciudades, descripcion, verificado, verificacion_estado, created_at")
      .eq("activo", true);

    if (rows && rows.length > 0) {
      const ids = rows.map((r: Record<string, unknown>) => r.id as string);

      // Fetch ratings
      const { data: resenas } = await getSupabaseAdmin()
        .from("resenas")
        .select("maestro_id, calificacion")
        .in("maestro_id", ids);

      const ratingMap: Record<string, { sum: number; count: number }> = {};
      for (const r of resenas ?? []) {
        if (!ratingMap[r.maestro_id]) ratingMap[r.maestro_id] = { sum: 0, count: 0 };
        ratingMap[r.maestro_id].sum   += r.calificacion;
        ratingMap[r.maestro_id].count += 1;
      }

      // Fetch referral counts — un solo query agregado en JS, mismo patrón que buscar/page.tsx.
      const { data: referidos } = await getSupabaseAdmin()
        .from("maestro_referidos")
        .select("maestro_id")
        .in("maestro_id", ids);

      const referidosMap: Record<string, number> = {};
      for (const r of referidos ?? []) referidosMap[r.maestro_id] = (referidosMap[r.maestro_id] ?? 0) + 1;

      featuredMaestros = (rows as Record<string, unknown>[])
        .map(r => {
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
            referidosCount: referidosMap[r.id as string] ?? 0,
          };
        })
        .sort((a, b) => {
          if (a.referidosCount !== b.referidosCount) return b.referidosCount - a.referidosCount;
          if (a.jobs === 0 && b.jobs > 0) return 1;
          if (a.jobs > 0 && b.jobs === 0) return -1;
          return b.rating - a.rating;
        })
        .slice(0, 10)
        .map(({ referidosCount: _referidosCount, ...card }) => card);
    }
  } catch { /* fallback */ }

  // ── Contador público de maestros ─────────────────────────────────────────────
  // Social proof for the maestros banner. null on failure → the line is hidden.
  let maestrosCount: number | null = null;
  try {
    const { count } = await getSupabaseAdmin()
      .from("maestros")
      .select("id", { count: "exact", head: true })
      .in("perfil_estado", ["basico", "pendiente_revision", "completo"]);
    maestrosCount = count ?? null;
  } catch { /* hide counter */ }

  return (
    <main>
      {/* ── BUSCADOR ──────────────────────────────────────────────────────────── */}
      <HomeSearch />

      {/* ── HERO CAROUSEL ─────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg)", padding: "8px 0 0" }}>
        <div className="wrap">
          <HeroCarousel />
        </div>
      </div>

      {/* ── BANNER MAESTROS ───────────────────────────────────────────────────── */}
      <FadeIn>
        <BannerMaestros maestrosCount={maestrosCount} />
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
              {/* Bloque cliente — imagen + overlay naranja */}
              <div style={{
                position: "relative", borderRadius: 12, overflow: "hidden",
                minHeight: 220, display: "flex",
              }}>
                {/* Background image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://res.cloudinary.com/dur4ffxqw/image/upload/v1781478173/ChatGPT_Image_14_jun_2026_06_57_38_p.m._fe6ph3.png"
                  alt=""
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                />
                {/* Orange overlay */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(230,100,20,0.78)" }} />
                {/* Content */}
                <div style={{ position: "relative", zIndex: 10, padding: "40px 36px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                  <h2 style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontWeight: 900, fontSize: "clamp(22px, 2.8vw, 32px)",
                    color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.15, margin: 0,
                  }}>
                    ¿Listo para encontrar al maestro ideal?
                  </h2>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.88)", lineHeight: 1.6, margin: 0 }}>
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
              </div>

              {/* Bloque maestro — imagen + overlay navy */}
              <div style={{
                position: "relative", borderRadius: 12, overflow: "hidden",
                minHeight: 220, display: "flex",
              }}>
                {/* Background image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://res.cloudinary.com/dur4ffxqw/image/upload/v1781478166/ChatGPT_Image_14_jun_2026_07_01_12_p.m._tuvzg9.png"
                  alt=""
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                />
                {/* Navy overlay */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(20,55,95,0.82)" }} />
                {/* Content */}
                <div style={{ position: "relative", zIndex: 10, padding: "40px 36px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                  <h2 style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontWeight: 900, fontSize: "clamp(22px, 2.8vw, 32px)",
                    color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.15, margin: 0,
                  }}>
                    ¿Eres maestro?
                  </h2>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, margin: 0 }}>
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
          </div>
        </section>
      </FadeIn>
    </main>
  );
}
