const STEPS = [
  {
    n: "1",
    title: "Busca",
    desc: "Encuentra el maestro filtrando por especialidad y ubicación",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
  {
    n: "2",
    title: "Revisa perfiles",
    desc: "Verifica experiencia, trabajos anteriores y reseñas reales",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    n: "3",
    title: "Contacta",
    desc: "Habla directamente con el maestro por WhatsApp",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    n: "4",
    title: "Elige y trabaja",
    desc: "Realiza tu proyecto con total confianza",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
];

export default function HowSection() {
  return (
    <section style={{ background: "#fff", padding: "72px 0 64px" }}>
      <div className="wrap">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span style={{
            display: "inline-block",
            fontFamily: "var(--font-jetbrains), monospace",
            textTransform: "uppercase", fontSize: 11, letterSpacing: "0.15em",
            fontWeight: 700, color: "var(--orange)", marginBottom: 12,
          }}>
            // ASÍ DE FÁCIL
          </span>
          <h2 style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900,
            color: "var(--navy)", letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0,
          }}>
            ¿Cómo funciona ObraBien?
          </h2>
        </div>

        {/* Steps */}
        <div className="how-simple-grid">
          {STEPS.map((step, i) => (
            <div key={step.n} className="how-simple-step-wrap">
              <div className="how-simple-step">
                {/* Number circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--orange)", color: "#fff",
                  display: "grid", placeItems: "center", flexShrink: 0,
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 900, fontSize: 18, marginBottom: 16,
                }}>
                  {step.n}
                </div>

                {/* Text */}
                <h3 style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 800, fontSize: 16.5, color: "var(--navy)",
                  margin: "0 0 8px", letterSpacing: "-0.01em",
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55,
                  margin: "0 0 18px", flex: 1,
                }}>
                  {step.desc}
                </p>

                {/* Icon */}
                <div style={{ color: "var(--navy)", opacity: 0.55 }}>
                  {step.icon}
                </div>
              </div>

              {/* Arrow between steps */}
              {i < STEPS.length - 1 && (
                <div className="how-simple-arrow" aria-hidden>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
