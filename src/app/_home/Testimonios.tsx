const STATS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M8 12l3 3 5-5" />
      </svg>
    ),
    label: "100% Gratis",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    label: "Maestros Verificados",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.43 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
      </svg>
    ),
    label: "Contacto Directo",
  },
];

export default function Testimonios() {
  return (
    <section style={{ background: "#0A1E3C", padding: "72px 0 64px" }}>
      <div className="wrap" style={{ textAlign: "center" }}>

        {/* Badge */}
        <div style={{ marginBottom: 20 }}>
          <span style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "#F97316",
          }}>
            🇨🇱 Hecho en Chile
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: "var(--font-archivo), sans-serif",
          fontSize: "clamp(26px, 3.2vw, 40px)", fontWeight: 900,
          color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.15,
          margin: "0 auto 12px", maxWidth: 640,
        }}>
          Somos la primera plataforma chilena<br />
          de maestros verificados.
        </h2>

        {/* Subtitle */}
        <div style={{
          fontFamily: "var(--font-archivo), sans-serif",
          fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 700,
          color: "#F97316", marginBottom: 24,
        }}>
          Sin comisiones, para siempre.
        </div>

        {/* Divider */}
        <div style={{
          width: 80, height: 2, background: "#F97316",
          margin: "0 auto 24px",
        }} />

        {/* Description */}
        <p style={{
          fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.7,
          maxWidth: 520, margin: "0 auto 48px",
        }}>
          Conectamos directamente a clientes con maestros confiables
          de construcción. Sin intermediarios, sin costos ocultos.
        </p>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 40, justifyContent: "center",
          flexWrap: "wrap",
        }}>
          {STATS.map(({ icon, label }) => (
            <div key={label} style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 10,
            }}>
              <div style={{ lineHeight: 0 }}>{icon}</div>
              <span style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontSize: 15, fontWeight: 700, color: "#fff",
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
