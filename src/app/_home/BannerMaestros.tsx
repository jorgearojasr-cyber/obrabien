import Link from "next/link";

const FEATURES = [
  {
    icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    title: "PERFIL GRATUITO",
    desc: "Crea tu perfil sin costo y en pocos minutos",
  },
  {
    icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    title: "CLIENTES DIRECTOS",
    desc: "Recibe contactos reales de personas que te buscan",
  },
  {
    icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>,
    title: "MUESTRA TUS TRABAJOS",
    desc: "Sube fotos y destaca tu experiencia",
  },
  {
    icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
    title: "RESEÑAS VERIFICADAS",
    desc: "Construye confianza con reseñas reales",
  },
  {
    icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    title: "SIN COMISIONES",
    desc: "Lo que ganas es tuyo, siempre",
  },
];

const CHECKS = ["Sin pagos mensuales", "Sin contratos", "Sin intermediarios"];

export default function BannerMaestros() {
  return (
    <section style={{ background: "#14375F", padding: "52px 0", position: "relative", overflow: "hidden" }}>
      {/* Subtle diagonal pattern */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, opacity: 0.035,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0' stroke='white' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
        backgroundSize: "40px 40px",
      }} />

      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <div className="bm-layout">

          {/* ── LEFT ── */}
          <div className="bm-left">
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "#F97316", padding: "6px 14px 6px 10px",
              borderRadius: "4px 20px 20px 4px", marginBottom: 20, alignSelf: "flex-start",
            }}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z" fill="rgba(255,255,255,0.3)"/>
                <path d="M3 11v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/>
                <line x1="9" y1="15" x2="9" y2="18"/><line x1="15" y1="15" x2="15" y2="18"/><line x1="7" y1="18" x2="17" y2="18"/>
              </svg>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
                Para Maestros
              </span>
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 900, fontSize: "clamp(22px, 2.8vw, 36px)",
              color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1,
              margin: "0 0 14px",
            }}>
              ¿Eres maestro?<br />
              Consigue más clientes<br />
              y haz <span style={{ color: "#F97316" }}>crecer tu negocio.</span>
            </h2>

            {/* Subtitle */}
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: "0 0 22px", maxWidth: 360 }}>
              Crea tu perfil gratis y recibe contactos directos de personas que buscan tus servicios.
            </p>

            {/* CTA */}
            <Link href="/registro?tab=maestro" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "#F97316", color: "#fff",
              fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800,
              fontSize: 14.5, padding: "13px 20px 13px 22px", borderRadius: 8,
              textDecoration: "none", letterSpacing: "-0.01em", marginBottom: 22,
            }}>
              Quiero registrarme gratis
              <span style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "#fff", color: "#F97316",
                display: "grid", placeItems: "center", flexShrink: 0,
                fontSize: 13, fontWeight: 900,
              }}>→</span>
            </Link>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 18 }} />

            {/* Checks */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
              {CHECKS.map((c, i) => (
                <span key={c} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {i > 0 && <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 10px" }}>|</span>}
                  <span style={{ color: "#F97316", fontSize: 11, fontWeight: 900 }}>✓</span>
                  <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)" }}>{c}</span>
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT: 5 icons in a row ── */}
          <div className="bm-features-row">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <div key={title} style={{ display: "flex", alignItems: "flex-start" }}>
                {/* Vertical separator */}
                {i > 0 && (
                  <div style={{ width: 1, background: "rgba(255,255,255,0.1)", alignSelf: "stretch", flexShrink: 0, margin: "0 16px" }} />
                )}
                {/* Feature */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1, gap: 10 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "#0d2444",
                    display: "grid", placeItems: "center",
                    color: "#F97316", flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "#fff", lineHeight: 1.3,
                  }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
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
