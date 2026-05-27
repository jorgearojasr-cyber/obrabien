import Link from "next/link";

const pasosCliente = [
  { n: "01", icon: "📝", title: "Describe tu trabajo", desc: "Cuéntanos qué necesitas reparar o construir, dónde estás y cuándo lo necesitas." },
  { n: "02", icon: "💬", title: "Recibe cotizaciones", desc: "Maestros disponibles y verificados en tu zona te envían sus presupuestos." },
  { n: "03", icon: "🔍", title: "Revisa perfiles", desc: "Compara calificaciones, reseñas y experiencia antes de decidir." },
  { n: "04", icon: "✅", title: "Contrata con confianza", desc: "Elige al maestro que más te convence y coordina directamente con él." },
];

const pasosMaestro = [
  { n: "01", icon: "📋", title: "Regístrate gratis", desc: "Crea tu perfil con tu especialidad, foto y descripción de tus servicios." },
  { n: "02", icon: "🪪", title: "Completa tu verificación", desc: "Sube tu cédula de identidad para generar confianza en los clientes." },
  { n: "03", icon: "🔔", title: "Recibe solicitudes", desc: "Cuando alguien busque tu especialidad en tu zona, te llegará una notificación." },
  { n: "04", icon: "💰", title: "Trabaja y cobra", desc: "Coordina con el cliente, haz el trabajo y cobra según lo acordado." },
];

const faqs = [
  { q: "¿Es gratis usar OBRABIEN?", a: "Para los clientes es completamente gratis. Para los maestros, el registro y las primeras cotizaciones no tienen costo." },
  { q: "¿Cómo verifican a los maestros?", a: "Solicitamos cédula de identidad y referencias de trabajos anteriores. Además, las calificaciones de los clientes ayudan a mantener la calidad." },
  { q: "¿Puedo contratar para una emergencia?", a: "Sí. Puedes filtrar por disponibilidad inmediata al buscar maestros en tu zona." },
  { q: "¿En qué ciudades opera OBRABIEN?", a: "Estamos comenzando en Talca, Santiago, Curicó y Concepción, creciendo hacia el resto del país." },
];

export default function ComoFunciona() {
  return (
    <div style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <div style={{ background: "var(--navy)", padding: "48px 0 40px" }}>
        <div className="wrap">
          <span className="label" style={{ color: "var(--orange)" }}>// Guía</span>
          <h1 className="display" style={{ fontFamily: "var(--font-archivo), sans-serif", color: "#fff", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, marginTop: 8 }}>
            ¿Cómo funciona OBRABIEN?
          </h1>
          <p style={{ color: "#9AA7B5", marginTop: 12, fontSize: 16, maxWidth: 560 }}>
            Conectamos a personas que necesitan trabajo con maestros de oficio de manera simple y segura.
          </p>
        </div>
        <div className="tape" style={{ marginTop: 40 }} />
      </div>

      <div className="wrap" style={{ paddingTop: 56, paddingBottom: 80 }}>
        {/* Para clientes */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <span style={{ background: "var(--orange)", color: "#fff", padding: "4px 14px", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Para clientes
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {pasosCliente.map(p => (
              <div key={p.n} style={{ background: "#fff", border: "1px solid var(--line)", padding: 20, display: "flex", gap: 16 }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>{p.icon}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--orange)", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>
                    Paso {p.n}
                  </div>
                  <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16, color: "var(--navy)", marginBottom: 6 }}>{p.title}</div>
                  <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.55 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/buscar"
              style={{ display: "inline-block", background: "var(--orange)", color: "#fff", fontWeight: 700, padding: "14px 28px", fontSize: 14, textDecoration: "none" }}>
              Buscar un maestro ahora
            </Link>
          </div>
        </section>

        {/* Para maestros */}
        <section style={{ marginBottom: 64, paddingTop: 48, borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <span style={{ background: "var(--navy)", color: "#fff", padding: "4px 14px", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Para maestros
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {pasosMaestro.map(p => (
              <div key={p.n} style={{ background: "#fff", border: "1px solid var(--line)", padding: 20, display: "flex", gap: 16 }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>{p.icon}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--navy)", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>
                    Paso {p.n}
                  </div>
                  <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16, color: "var(--navy)", marginBottom: 6 }}>{p.title}</div>
                  <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.55 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/registro"
              style={{ display: "inline-block", background: "var(--navy)", color: "#fff", fontWeight: 700, padding: "14px 28px", fontSize: 14, textDecoration: "none" }}>
              Registrarme como maestro
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ paddingTop: 48, borderTop: "1px solid var(--line)" }}>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>// FAQ</span>
          <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, marginBottom: 32, color: "var(--navy)" }}>
            Preguntas frecuentes
          </h2>
          <div className="col gap-12">
            {faqs.map(({ q, a }, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid var(--line)", padding: 22 }}>
                <h3 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 17, color: "var(--navy)", margin: "0 0 10px" }}>{q}</h3>
                <p style={{ fontSize: 14.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.6 }}>{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
