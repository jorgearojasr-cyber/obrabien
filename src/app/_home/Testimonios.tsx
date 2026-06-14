const TESTIMONIOS = [
  {
    texto: "Encontré un gasfiter en menos de 10 minutos. Me llamó al tiro, vino al día siguiente y quedó impecable. Sin intermediarios ni vueltas.",
    nombre: "Valentina M.",
    ciudad: "Santiago",
    estrellas: 5,
  },
  {
    texto: "Busqué electricista para mi local en Viña. Pude ver los trabajos anteriores y las reseñas reales. Confié y no me equivoqué. Lo recomiendo.",
    nombre: "Rodrigo S.",
    ciudad: "Viña del Mar",
    estrellas: 5,
  },
  {
    texto: "Como maestro albañil me registré y empecé a recibir contactos esa misma semana. Gratis, sin comisiones. Es lo que necesitaba.",
    nombre: "Patricio A.",
    ciudad: "Concepción",
    estrellas: 5,
  },
];

export default function Testimonios() {
  return (
    <section style={{ background: "var(--bg-2)", padding: "72px 0 64px" }}>
      <div className="wrap">
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 48px" }}>
          <span style={{
            display: "inline-block", fontFamily: "var(--font-jetbrains), monospace",
            textTransform: "uppercase", fontSize: 11, letterSpacing: "0.15em",
            fontWeight: 700, color: "var(--orange)", marginBottom: 12,
          }}>
            // TESTIMONIOS
          </span>
          <h2 style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: "clamp(24px, 3.2vw, 38px)", fontWeight: 900,
            color: "var(--navy)", letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0,
          }}>
            Lo que dicen nuestros usuarios
          </h2>
        </div>

        <div className="testimonios-grid">
          {TESTIMONIOS.map(({ texto, nombre, ciudad, estrellas }) => (
            <div key={nombre} style={{
              background: "#fff", border: "1px solid var(--line)",
              padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16,
            }}>
              {/* Stars */}
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: estrellas }).map((_, i) => (
                  <span key={i} style={{ color: "var(--orange)", fontSize: 16 }}>★</span>
                ))}
              </div>

              {/* Quote */}
              <div style={{
                fontSize: 36, color: "var(--orange)", lineHeight: 1,
                fontFamily: "Georgia, serif", marginTop: -8, marginBottom: -8,
              }}>
                "
              </div>
              <p style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.65, margin: 0, flex: 1, fontStyle: "italic" }}>
                {texto}
              </p>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", background: "var(--navy)",
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900,
                  fontSize: 13, color: "#fff", flexShrink: 0,
                }}>
                  {nombre.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--navy)", fontFamily: "var(--font-archivo), sans-serif" }}>
                    {nombre}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--mute)" }}>{ciudad}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
