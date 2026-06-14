import Link from "next/link";

const SPECS = [
  { slug: "Albañil",       emoji: "🧱", desc: "Muros, cielos, estucos, revestimientos y obra gruesa." },
  { slug: "Gasfiter",      emoji: "🔧", desc: "Instalaciones de agua, gas y sistema sanitario." },
  { slug: "Electricista",  emoji: "⚡", desc: "Instalaciones eléctricas, tableros y luminaria." },
  { slug: "Carpintero",    emoji: "🪵", desc: "Muebles a medida, puertas, ventanas y molduras." },
  { slug: "Pintor",        emoji: "🎨", desc: "Pintura interior, exterior, barniz y empapelado." },
  { slug: "Ceramista",     emoji: "🪟", desc: "Cerámica, porcelanato, baldosas y guardas." },
];

export default function Especialidades() {
  return (
    <section style={{ background: "var(--bg)", padding: "72px 0 64px" }}>
      <div className="wrap">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 48px" }}>
          <span style={{
            display: "inline-block", fontFamily: "var(--font-jetbrains), monospace",
            textTransform: "uppercase", fontSize: 11, letterSpacing: "0.15em",
            fontWeight: 700, color: "var(--orange)", marginBottom: 12,
          }}>
            // ESPECIALIDADES
          </span>
          <h2 style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 900,
            color: "var(--navy)", letterSpacing: "-0.025em", lineHeight: 1.1,
            margin: "0 0 14px",
          }}>
            Los más buscados en ObraBien
          </h2>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.6, margin: 0 }}>
            Encuentra al especialista que necesitas para tu proyecto.
          </p>
        </div>

        {/* Grid */}
        <div className="esp-home-grid">
          {SPECS.map(({ slug, emoji, desc }) => (
            <Link
              key={slug}
              href={`/buscar?esp=${encodeURIComponent(slug)}`}
              style={{ textDecoration: "none" }}
            >
              <div className="esp-home-card">
                <div style={{ fontSize: 34, lineHeight: 1, marginBottom: 12 }}>{emoji}</div>
                <h3 style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 800, fontSize: 16.5, color: "var(--navy)",
                  margin: "0 0 6px", letterSpacing: "-0.01em",
                }}>
                  {slug}
                </h3>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.55, margin: "0 0 14px", flex: 1 }}>
                  {desc}
                </p>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 12.5, fontWeight: 700, color: "var(--orange)",
                  fontFamily: "var(--font-jetbrains), monospace",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  Ver maestros →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
