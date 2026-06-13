"use client";

import { useState } from "react";

const STEPS_CLIENTE = [
  { n: "01", iconKey: "doc",     title: "Describe tu proyecto",       desc: "Cuéntanos qué necesitas. Albañilería, gasfitería, electricidad — tenemos el especialista.",       visualKey: "free-chip"   },
  { n: "02", iconKey: "profile", title: "Revisa perfiles reales",     desc: "Ve fotos de trabajos anteriores, calificaciones reales de clientes y años de experiencia.",       visualKey: "rating-card" },
  { n: "03", iconKey: "wa",      title: "Contacta directo",           desc: "Sin intermediarios. Habla directo con el maestro por WhatsApp y coordina los detalles.",           visualKey: "wa-btn"      },
  { n: "04", iconKey: "star",    title: "Califica tu experiencia",    desc: "Después del trabajo, deja tu reseña. Ayudas a otros y construyes la reputación del maestro.",     visualKey: "stars"       },
];
const STEPS_MAESTRO = [
  { n: "01", iconKey: "helmet",  title: "Crea tu perfil profesional", desc: "Sube tus trabajos, especialidades, zona de cobertura y formas de pago. Gratis y en minutos.",   visualKey: "free-maestro" },
  { n: "02", iconKey: "shield",  title: "Verifica tu identidad",      desc: "Sube tu cédula y obtén el badge VERIFICADO. Los clientes confían más en maestros verificados.",  visualKey: "verified"     },
  { n: "03", iconKey: "bell",    title: "Recibe solicitudes",         desc: "Cuando alguien busque tu especialidad en tu zona, te llegará una notificación por WhatsApp.",    visualKey: "wa-notif"     },
  { n: "04", iconKey: "trophy",  title: "Construye tu reputación",    desc: "Cada trabajo bien hecho suma estrellas y reseñas. Tu perfil crece y recibes más clientes.",     visualKey: "progress"     },
];

function HowIcon({ iconKey, size = 28 }: { iconKey: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (iconKey) {
    case "doc":     return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><path d="M10 13l2 2 4-4" stroke="var(--orange)" strokeWidth="2"/></svg>;
    case "profile": return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
    case "wa":      return <svg {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
    case "star":    return <svg {...p} fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>;
    case "helmet":  return <svg {...p}><path d="M12 2a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z" fill="currentColor" strokeWidth="1.5"/><path d="M3 11v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><line x1="9" y1="15" x2="9" y2="18"/><line x1="15" y1="15" x2="15" y2="18"/><line x1="7" y1="18" x2="17" y2="18"/></svg>;
    case "shield":  return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4" strokeWidth="2"/></svg>;
    case "bell":    return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case "trophy":  return <svg {...p}><polyline points="8,21 12,17 16,21"/><line x1="12" y1="17" x2="12" y2="12"/><path d="M7 4H3v3a4 4 0 0 0 4 4"/><path d="M17 4h4v3a4 4 0 0 1-4 4"/><rect x="7" y="2" width="10" height="10" rx="1"/></svg>;
    default:        return <svg {...p}><circle cx="12" cy="12" r="9"/></svg>;
  }
}

function HowVisual({ visualKey }: { visualKey: string }) {
  switch (visualKey) {
    case "free-chip":
      return <div style={{ display: "inline-flex", alignItems: "center", background: "var(--bg)", border: "1px solid var(--line)", padding: "5px 10px", fontSize: 11, fontFamily: "var(--font-jetbrains), monospace", color: "var(--ink-soft)", letterSpacing: "0.03em", lineHeight: 1.4 }}>✓ Sin costo · Sin registro obligatorio</div>;
    case "rating-card":
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg)", border: "1px solid var(--line)", padding: "8px 10px" }}>
          <div style={{ width: 28, height: 28, background: "var(--navy)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 10.5, flexShrink: 0 }}>JP</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink)" }}>Juan P.</div>
            <div style={{ fontSize: 11, color: "var(--orange)", fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700 }}>★ 4.8</div>
          </div>
          <span style={{ background: "var(--ink)", color: "var(--orange)", fontSize: 8, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, letterSpacing: "0.08em", padding: "2px 5px", flexShrink: 0 }}>VERIFICADO</span>
        </div>
      );
    case "wa-btn":
      return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#25D366", color: "#fff", padding: "7px 12px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-archivo), sans-serif" }}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.6 5.8L0 24l6.3-1.6C7.9 23.4 9.9 24 12 24c6.6 0 12-5.4 12-12S18.6 0 12 0zm3.9 16.7c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.7-4.5-3.9-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9 1-2.2.3-.3.5-.3.7-.3h.5c.2 0 .3 0 .5.4.2.4.6 1.5.7 1.6.1.1.1.3 0 .4-.1.1-.2.3-.3.4-.1.1-.3.2-.4.3-.1.2-.2.3-.1.5.2.3.7.9 1.2 1.5.8.7 1.5.9 1.7 1 .3.1.4.1.5-.1.2-.2.6-.7.7-.9.2-.2.3-.1.5 0l1.7.8c.2.1.3.2.4.3 0 .2-.1.5-.2.8z"/></svg>
          Contactar por WhatsApp
        </div>
      );
    case "stars":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", gap: 1 }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: "var(--orange)", fontSize: 18 }}>★</span>)}</div>
          <div style={{ fontSize: 10.5, fontFamily: "var(--font-jetbrains), monospace", color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reseña verificada ✓</div>
        </div>
      );
    case "free-maestro":
      return <div style={{ display: "inline-flex", alignItems: "center", background: "var(--orange)", color: "#fff", padding: "5px 10px", fontSize: 11, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1.4 }}>100% Gratis · Sin comisiones</div>;
    case "verified":
      return <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--ink)", color: "var(--orange)", padding: "6px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em" }}>✓ VERIFICADO</div>;
    case "wa-notif":
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid var(--line)", padding: "8px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", maxWidth: 210 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#25D366", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>WhatsApp</div>
            <div style={{ fontSize: 10.5, color: "var(--mute)" }}>Nueva solicitud en tu zona</div>
          </div>
        </div>
      );
    case "progress":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nivel Pro</span>
            <span style={{ fontSize: 11, color: "var(--orange)", fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700 }}>78%</span>
          </div>
          <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "78%", background: "var(--orange)", borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 10.5, color: "var(--mute-2)", fontFamily: "var(--font-jetbrains), monospace" }}>4 reseñas · 142 trabajos</div>
        </div>
      );
    default: return null;
  }
}

export default function HowSection() {
  const [roleTab, setRoleTab] = useState<"cliente" | "maestro">("cliente");
  const [stepsVisible, setStepsVisible] = useState(true);

  function handleRoleChange(role: "cliente" | "maestro") {
    if (role === roleTab) return;
    setStepsVisible(false);
    setTimeout(() => { setRoleTab(role); setStepsVisible(true); }, 200);
  }

  return (
    <section style={{ background: "#fff" }}>
      <div className="wrap" style={{ paddingTop: 72, paddingBottom: 64 }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 52px" }}>
          <span style={{ display: "inline-block", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.15em", fontWeight: 700, color: "var(--orange)", marginBottom: 14 }}>
            // ASÍ FUNCIONA
          </span>
          <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, color: "var(--navy)", lineHeight: 1.1, letterSpacing: "-0.025em", margin: "0 0 18px" }}>
            La forma más fácil de conectar<br />con maestros verificados.
          </h2>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.65, margin: 0 }}>
            Encuentra especialistas reales, revisa sus trabajos, calificaciones y experiencia.
            Contáctalos directo, sin intermediarios ni comisiones.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 52 }}>
          <div style={{ display: "flex", border: "1.5px solid var(--line)", overflow: "hidden", width: "min(100%, 480px)" }}>
            {(["cliente", "maestro"] as const).map((key, i) => (
              <button key={key} onClick={() => handleRoleChange(key)}
                style={{
                  flex: 1, padding: "14px 24px", border: "none",
                  borderLeft: i > 0 ? "1.5px solid var(--line)" : "none",
                  background: roleTab === key ? (key === "maestro" ? "var(--orange)" : "var(--navy)") : "#fff",
                  color: roleTab === key ? "#fff" : (key === "maestro" ? "var(--orange)" : "var(--navy)"),
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase" as const, cursor: "pointer",
                  transition: "background .2s, color .2s",
                }}
              >
                {key === "cliente" ? "SOY CLIENTE" : "SOY MAESTRO"}
              </button>
            ))}
          </div>
        </div>

        <div className="how-grid" style={{ opacity: stepsVisible ? 1 : 0, transform: stepsVisible ? "translateY(0)" : "translateY(6px)", transition: "opacity 0.2s ease, transform 0.2s ease" }}>
          {(roleTab === "cliente" ? STEPS_CLIENTE : STEPS_MAESTRO).map(step => (
            <div key={step.n} style={{ background: "#fff", border: "1px solid var(--line)", padding: "28px 22px", display: "flex", flexDirection: "column", gap: 14, overflow: "hidden", minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 52, fontWeight: 900, color: "var(--orange)", lineHeight: 1, letterSpacing: "-0.03em" }}>
                {step.n}
              </div>
              <div style={{ color: "var(--navy)" }}>
                <HowIcon iconKey={step.iconKey} size={30} />
              </div>
              <h3 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--ink)", margin: 0, lineHeight: 1.25 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.65, margin: 0, flex: 1 }}>
                {step.desc}
              </p>
              <div style={{ marginTop: 6 }}>
                <HowVisual visualKey={step.visualKey} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ background: "var(--navy)", padding: "28px 0" }}>
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "clamp(20px, 4vw, 52px)", flexWrap: "wrap" }}>
            {["100% Gratis para maestros", "Sin comisiones", "Contacto directo", "Maestros verificados"].map(stat => (
              <div key={stat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 18, height: 18, background: "var(--orange)", display: "grid", placeItems: "center", borderRadius: "50%", fontSize: 10, fontWeight: 900, color: "#fff", flexShrink: 0 }}>✓</span>
                <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>{stat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
