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
    case "Instalador de pisos flotantes": return <svg {...p}><rect x="3" y="4" width="18" height="4" /><path d="M8 4 V8 M14 4 V8" /><rect x="3" y="10" width="18" height="4" fill="currentColor" /><rect x="3" y="16" width="18" height="4" /></svg>;
    case "Instalador de ventanas termopanel": return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M12 3 V21 M3 12 H21" /><rect x="4.5" y="4.5" width="6" height="6" fill="currentColor" opacity="0.85" /></svg>;
    case "Instalador de cámaras": return <svg {...p}><rect x="3" y="6" width="13" height="7" rx="1.5" /><path d="M16 8 L21 5 V14 L16 11 Z" fill="currentColor" /><circle cx="7" cy="9.5" r="1.4" fill="currentColor" /></svg>;
    case "Aire acondicionado": return <svg {...p}><rect x="3" y="5" width="18" height="8" rx="1.5" /><path d="M5 9 H19M7 16 q1 1.5 0 3 M12 16 q1 1.5 0 3 M17 16 q1 1.5 0 3" /></svg>;
    case "Mantención de jardines": return <svg {...p}><path d="M4 20 C 4 6 18 4 20 4 C 20 6 18 20 4 20 Z" fill="currentColor" /><path d="M4 20 L20 4" stroke="white" strokeOpacity="0.8" /></svg>;
    case "Excavaciones": return <svg {...p}><rect x="3" y="14" width="14" height="4" rx="1" /><circle cx="6" cy="20" r="1.6" /><circle cx="14" cy="20" r="1.6" /><path d="M8 14 V10 L13 7M13 7 L20 3 L21 5 L17 11 Z" fill="currentColor" /></svg>;
    case "Paneles solares": return <svg {...p}><circle cx="6" cy="6" r="2.4" fill="currentColor" /><path d="M6 1.5 V2.5 M6 9.5 V10.5 M1.5 6 H2.5 M9.5 6 H10.5" /><path d="M9 13 L21 11 L23 19 L11 21 Z M13 12.4 L15 20.6 M17 11.6 L19 19.8 M9.7 16 L22 14 M10.4 19 L22.7 17" /></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

const stats = { total: SAMPLE_MASTERS.length, cities: new Set(SAMPLE_MASTERS.map(m => m.city)).size };

const COMUNIDAD_POSTS = [
  { title: "¿Cuánto cobrar por metro cuadrado de pintura interior?", category: "Precios y tarifas", author: "Pedro R.", time: "Hace 2h", replies: 12 },
  { title: "Problema con humedad en muro de hormigón, ¿qué producto usar?", category: "Técnicas y materiales", author: "María C.", time: "Hace 5h", replies: 8 },
  { title: "¿Vale la pena certificarse como instalador eléctrico en 2025?", category: "Formación y certificaciones", author: "Carlos M.", time: "Hace 1 día", replies: 23 },
];

export default function Home() {
  return (
    <main>
      <HomeSearch />

      {/* HERO */}
      <section style={{ background: "var(--bg)", position: "relative", overflow: "hidden" }}>
        <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>
          <div className="row gap-32 wrap-flex" style={{ alignItems: "center" }}>
            <div style={{ flex: "1.1 1 460px", minWidth: 280 }}>
              <div className="row center gap-8 wrap-flex" style={{ marginBottom: 22 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--navy)", color: "#fff",
                  padding: "5px 12px", borderRadius: 999,
                  fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5,
                  letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
                }}>
                  <span style={{ width: 6, height: 6, background: "var(--orange)", borderRadius: "50%" }} />
                  OBRABIEN · Plataforma chilena
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {stats.total} maestros · {stats.cities} ciudades
                </span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontSize: "clamp(36px, 5.2vw, 64px)", fontWeight: 900, lineHeight: 1.02,
                color: "var(--navy)", letterSpacing: "-0.025em", margin: 0,
              }}>
                Encuentra<br />
                <span style={{ color: "var(--orange)" }}>maestros confiables</span><br />
                para tu proyecto.
              </h1>

              <p style={{ fontSize: 17.5, color: "var(--ink-soft)", maxWidth: 520, marginTop: 22, lineHeight: 1.6 }}>
                Albañiles, gasfiter, electricistas, carpinteros y más.
                Revisa el perfil, las reseñas y contáctalos directamente — sin intermediarios.
              </p>

              <div className="row gap-10 wrap-flex" style={{ marginTop: 26 }}>
                <Link href="/buscar" className="btn btn-lg"
                  style={{ background: "var(--orange)", borderColor: "var(--orange)", color: "#fff", borderRadius: 10, fontWeight: 700, padding: "0 24px", textDecoration: "none" }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                  Buscar maestros
                </Link>
                <Link href="/registro" className="btn btn-lg"
                  style={{ background: "#fff", borderColor: "var(--navy)", color: "var(--navy)", borderRadius: 10, fontWeight: 700, padding: "0 24px", textDecoration: "none" }}>
                  ⛑ Registrarme como maestro
                </Link>
              </div>

              <div className="row center gap-16 wrap-flex" style={{ marginTop: 26, fontSize: 12.5, color: "var(--mute)" }}>
                {[
                  { bg: "var(--navy)", color: "var(--orange)", text: "✓", label: "Maestros verificados" },
                  { bg: "var(--orange)", color: "#fff", text: "%", label: "100% gratis" },
                  { bg: "var(--navy)", color: "#fff", text: "★", label: "Calificaciones reales" },
                ].map(({ bg, color, text, label }) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 18, height: 18, background: bg, color, display: "grid", placeItems: "center", borderRadius: "50%", fontSize: 11, fontWeight: 900 }}>{text}</span>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ flex: "0.85 1 340px", minWidth: 240, maxWidth: 380, position: "relative" }}>
              <div style={{
                position: "relative", aspectRatio: "4/5", background: "var(--navy)",
                borderRadius: 18, overflow: "hidden",
                boxShadow: "0 20px 40px rgba(14,39,66,0.18), 0 4px 10px rgba(14,39,66,0.08)",
              }}>
                <Image
                  src="/assets/hero-worker.png"
                  alt="Maestro de la construcción con casco"
                  fill style={{ objectFit: "cover" }}
                  priority
                />
                <div style={{
                  position: "absolute", inset: "auto 0 0 0", height: "40%",
                  background: "linear-gradient(180deg, transparent 0%, rgba(14,39,66,0.55) 100%)",
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", left: 14, right: 14, bottom: 14,
                  background: "rgba(255,255,255,0.96)", backdropFilter: "blur(6px)",
                  border: "1.5px solid var(--navy)", borderRadius: 12,
                  padding: "9px 12px", display: "flex", alignItems: "center", gap: 10,
                }}>
                  <LogoMark size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 12.5, color: "var(--navy)", lineHeight: 1.15, textTransform: "uppercase", textAlign: "center" }}>
                      Nuevas oportunidades
                    </div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9.5, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2, textAlign: "center" }}>
                      Están esperando por ti
                    </div>
                  </div>
                </div>
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  background: "var(--orange)", color: "#fff", padding: "5px 11px",
                  fontFamily: "var(--font-jetbrains), monospace", fontSize: 9.5,
                  fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  borderBottomLeftRadius: 12,
                }}>
                  Verificados ✓
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="tape" />
      </section>

      {/* CÓMO FUNCIONA */}
      <FadeIn>
        <HowSection />
      </FadeIn>

      {/* MAESTROS DESTACADOS */}
      <FadeIn>
        <FeaturedCarousel />
      </FadeIn>

      {/* COMUNIDAD */}
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

      {/* MARKETPLACE */}
      <FadeIn>
        <MarketSection />
      </FadeIn>

      {/* ESPECIALIDADES */}
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

      {/* CTA FINAL */}
      <FadeIn>
        <section style={{ background: "var(--navy)", color: "#fff", paddingBottom: 72 }}>
          <div className="tape" />
          <div className="wrap" style={{ paddingTop: 72, textAlign: "center" }}>
            <span className="label" style={{ color: "var(--orange)", marginBottom: 12, display: "block" }}>// ¿Eres maestro?</span>
            <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(32px,5vw,60px)", color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.05, margin: "0 0 16px" }}>
              Únete gratis.
            </h2>
            <p style={{ fontSize: 17.5, color: "rgba(255,255,255,0.65)", maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.6 }}>
              Sin comisiones. Sin intermediarios. Solo tú y tus clientes.
            </p>

            <Link href="/registro"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--orange)", color: "#fff", fontWeight: 800, fontSize: 17, padding: "16px 36px", textDecoration: "none", letterSpacing: "-0.01em" }}>
              ⛑ Registrarme como maestro
            </Link>

            <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap", marginTop: 52 }}>
              {[
                { value: "10+", label: "Maestros verificados" },
                { value: "6",   label: "Ciudades" },
                { value: "100%", label: "Gratis" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: 42, color: "var(--orange)", letterSpacing: "-0.03em", lineHeight: 1 }}>
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
