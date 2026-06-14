import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
    title: "PERFIL GRATUITO",
    desc: "Crea tu perfil sin costo y en pocos minutos",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    title: "CLIENTES DIRECTOS",
    desc: "Recibe contactos reales de personas que buscan tus servicios",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
      </svg>
    ),
    title: "MUESTRA TUS TRABAJOS",
    desc: "Sube fotos de tus proyectos y destaca tu experiencia",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    ),
    title: "RESEÑAS VERIFICADAS",
    desc: "Construye confianza con reseñas reales de tus clientes",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: "SIN COMISIONES",
    desc: "No cobramos comisión por tus trabajos. Lo que ganas es tuyo",
  },
];

const CHECKS = ["Sin pagos mensuales", "Sin contratos", "Sin intermediarios"];

export default function BannerMaestros() {
  return (
    <section style={{ background: "#14375F", padding: "72px 0", position: "relative", overflow: "hidden" }}>
      {/* Subtle background pattern */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Cpath d='M10 10l5-5M20 10l5-5M30 10l5-5M40 10l5-5M50 10l5-5M10 20l5-5M20 20l5-5M30 20l5-5M40 20l5-5M50 20l5-5M10 30l5-5M20 30l5-5M30 30l5-5M40 30l5-5M50 30l5-5M10 40l5-5M20 40l5-5M30 40l5-5M40 40l5-5M50 40l5-5M10 50l5-5M20 50l5-5M30 50l5-5M40 50l5-5M50 50l5-5'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: "60px 60px",
      }} />

      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <div className="banner-maestros-inner">

          {/* ── LEFT: text + CTA ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start" }}>
              <div style={{
                background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)",
                borderRadius: 999, padding: "6px 14px",
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z" fill="#F97316" fillOpacity=".25"/><path d="M3 11v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><line x1="9" y1="15" x2="9" y2="18"/><line x1="15" y1="15" x2="15" y2="18"/><line x1="7" y1="18" x2="17" y2="18"/>
                </svg>
                <span style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#F97316",
                }}>
                  Para Maestros
                </span>
              </div>
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 900, fontSize: "clamp(28px, 3.5vw, 46px)",
              color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0,
            }}>
              ¿Eres maestro?<br />
              Consigue más clientes<br />
              y haz <span style={{ color: "#F97316" }}>crecer tu negocio.</span>
            </h2>

            {/* Subtitle */}
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, margin: 0, maxWidth: 440 }}>
              Crea tu perfil gratis y recibe contactos directos de personas
              que buscan tus servicios.
            </p>

            {/* CTA Button */}
            <Link href="/registro?tab=maestro" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "#F97316", color: "#fff",
              fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800,
              fontSize: 16, padding: "16px 28px", borderRadius: 10,
              textDecoration: "none", letterSpacing: "-0.01em", alignSelf: "flex-start",
            }}>
              Quiero registrarme gratis
              <span style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>→</span>
            </Link>

            {/* Checks */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 4 }}>
              {CHECKS.map(c => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.4)",
                    display: "grid", placeItems: "center", flexShrink: 0,
                    fontSize: 10, color: "#F97316", fontWeight: 900,
                  }}>✓</span>
                  <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: feature grid ── */}
          <div className="banner-features-grid">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "18px 16px",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(249,115,22,0.15)",
                  border: "1px solid rgba(249,115,22,0.25)",
                  display: "grid", placeItems: "center",
                  color: "#F97316", flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div>
                  <div style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em",
                    color: "#fff", textTransform: "uppercase", marginBottom: 4,
                  }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
