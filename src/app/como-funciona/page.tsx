"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ─── Animated counter ──────────────────────────────────────────────────── */
function StatCounter({ target, suffix = "", duration = 1400 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 40;
    const ms    = duration / steps;
    let step    = 0;
    const t     = setInterval(() => {
      step++;
      setCount(Math.round((target * step) / steps));
      if (step >= steps) clearInterval(t);
    }, ms);
    return () => clearInterval(t);
  }, [target, duration]);
  return <>{count}{suffix}</>;
}

/* ─── Step card ─────────────────────────────────────────────────────────── */
function StepCard({
  n, title, desc, accent,
}: { n: string; icon: string; title: string; desc: string; accent: string }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--line)",
      padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", background: accent,
        color: "#fff", display: "grid", placeItems: "center",
        fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: 13,
        flexShrink: 0, marginTop: 1,
      }}>
        {n}
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14, color: "var(--navy)", marginBottom: 3 }}>
          {title}
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

function ArrowSep({ color }: { color: string }) {
  return (
    <div style={{
      height: 16, display: "flex", alignItems: "center",
      paddingLeft: 10,
      color, fontSize: 14, lineHeight: 1,
      userSelect: "none", opacity: 0.6,
    }}>
      ↓
    </div>
  );
}

/* ─── Vertical timeline ─────────────────────────────────────────────────── */
function Timeline({
  steps, accent,
}: { steps: { n: string; icon: string; title: string; desc: string }[]; accent: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {steps.flatMap((s, i) => [
        <StepCard key={s.n} {...s} accent={accent} />,
        i < steps.length - 1
          ? <ArrowSep key={`a${i}`} color={accent} />
          : null,
      ])}
    </div>
  );
}

/* ─── Trust badge ───────────────────────────────────────────────────────── */
function TrustBadge({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      flex: "1 1 220px", background: "#fff", border: "1px solid var(--line)",
      padding: "24px 20px", display: "flex", flexDirection: "column", gap: 10,
    }}>
      <span style={{ fontSize: 34 }}>{icon}</span>
      <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 16, color: "var(--navy)" }}>
        {title}
      </div>
      <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

/* ─── FAQ item ──────────────────────────────────────────────────────────── */
function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderLeft: open ? "3px solid var(--orange)" : "1px solid var(--line)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", padding: "18px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 16, color: "var(--navy)", lineHeight: 1.3 }}>
          {q}
        </span>
        <span style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
          background: open ? "var(--orange)" : "var(--bg-2)", color: open ? "#fff" : "var(--mute)",
          display: "grid", placeItems: "center", fontSize: 16, transition: "all .2s",
          fontWeight: 700,
        }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 18px" }}>
          <p style={{ fontSize: 14.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.7, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Data ──────────────────────────────────────────────────────────────── */
const pasosCliente = [
  { n: "1", icon: "🔍", title: "Busca un maestro", desc: "Filtra por especialidad y ciudad. Ve calificaciones, fotos de trabajos y disponibilidad." },
  { n: "2", icon: "📋", title: "Revisa el perfil", desc: "Compara experiencia, reseñas reales de clientes y especialidades antes de contactar." },
  { n: "3", icon: "💬", title: "Contáctalo directo", desc: "Habla por WhatsApp sin intermediarios. Coordina el trabajo y el precio directamente." },
  { n: "4", icon: "✅", title: "Deja tu reseña", desc: "Una vez terminado el trabajo, califica al maestro para ayudar a otros clientes." },
];

const pasosMaestro = [
  { n: "1", icon: "📋", title: "Regístrate gratis", desc: "Crea tu perfil con especialidad, zona de trabajo, descripción y fotos de tus proyectos." },
  { n: "2", icon: "🪪", title: "Verifica tu identidad", desc: "Sube tu cédula de identidad para obtener el sello de maestro verificado." },
  { n: "3", icon: "🔔", title: "Aparece en búsquedas", desc: "Los clientes que buscan tu especialidad en tu zona verán tu perfil publicado." },
  { n: "4", icon: "💰", title: "Trabaja y cobra", desc: "Coordina directamente con el cliente, realiza el trabajo y cobra lo acordado." },
];

const trustBadges = [
  {
    icon: "🔒",
    title: "Maestros verificados",
    desc: "Verificamos la identidad de cada maestro con su cédula de identidad antes de publicar su perfil.",
  },
  {
    icon: "⭐",
    title: "Reseñas reales de clientes",
    desc: "Solo clientes que contrataron al maestro pueden dejar reseñas. Sin opiniones falsas.",
  },
  {
    icon: "💬",
    title: "Contacto directo por WhatsApp",
    desc: "Sin intermediarios ni comisiones. Hablas directo con el maestro y acuerdan el precio entre ustedes.",
  },
];

const testimonials = [
  {
    stars: 5,
    quote: "Encontré a un gasfiter en menos de 10 minutos. Llegó puntual, resolvió la cañería rota y el precio fue justo. Muy recomendable.",
    name: "María González",
    city: "Talca",
    service: "Gasfitería",
  },
  {
    stars: 5,
    quote: "Tenía miedo de contratar a alguien desconocido, pero el sello de verificado me dio confianza. El trabajo de cerámica quedó perfecto.",
    name: "Carlos Vega",
    city: "Maule",
    service: "Cerámica",
  },
];

const faqs = [
  {
    q: "¿ObraBien cobra comisión?",
    a: "No. ObraBien es completamente gratuito para los clientes, y los maestros tampoco pagan comisiones por los trabajos que consiguen. El contacto es directo entre cliente y maestro.",
  },
  {
    q: "¿Cómo sé si un maestro es confiable?",
    a: "Verificamos la identidad de cada maestro con su cédula de identidad antes de publicar su perfil. Además, las reseñas de clientes reales son visibles en el perfil. Los maestros verificados muestran un sello especial.",
  },
  {
    q: "¿Puedo publicar mi perfil gratis?",
    a: "Sí, completamente gratis. Regístrate, completa tu perfil con tu especialidad, zona de trabajo y fotos, y aparece en las búsquedas de clientes. Sin cobros mensuales ni comisiones.",
  },
  {
    q: "¿En qué ciudades funciona?",
    a: "Actualmente operamos en Talca y comunas aledañas de la Región del Maule. Estamos expandiéndonos gradualmente. Si tu ciudad aún no está disponible, puedes registrarte y te avisamos cuando lleguemos.",
  },
  {
    q: "¿Cómo dejo una reseña?",
    a: "Después de contratar a un maestro, visita su perfil público y usa el botón 'Dejar reseña'. Te pediremos que inicies sesión para verificar que eres un cliente real. Las reseñas anónimas no están permitidas.",
  },
];

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function ComoFunciona() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"cliente" | "maestro">("cliente");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ background: "var(--bg)" }}>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--navy)", padding: "52px 0 0" }}>
        <div className="wrap">
          <span className="label" style={{ color: "var(--orange)", marginBottom: 10, display: "block" }}>// Guía</span>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", color: "#fff", fontSize: "clamp(32px, 4vw, 54px)", fontWeight: 900, margin: "0 0 14px", lineHeight: 1.1 }}>
            ¿Cómo funciona<br />ObraBien?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16.5, maxWidth: 520, margin: 0, lineHeight: 1.6 }}>
            Conectamos a personas que necesitan trabajo en el hogar con maestros de oficio verificados. Simple, directo y gratis.
          </p>
          <div className="tape" style={{ marginTop: 44 }} />
        </div>
      </div>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap" style={{ paddingTop: 36, paddingBottom: 36 }}>
          <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            {[
              { big: null, numTarget: 11, numSuffix: "", label: "Maestros registrados", sub: "y creciendo" },
              { big: null, numTarget: 100, numSuffix: "%", label: "Gratis para clientes", sub: "sin comisiones ocultas" },
              { big: "Talca y alrededores", numTarget: null, numSuffix: "", label: "Zona de cobertura", sub: "expansión pronto" },
            ].map(({ big, numTarget, numSuffix, label, sub }, i, arr) => (
              <div key={label} style={{
                flex: "1 1 200px", padding: "20px 32px",
                borderRight: i < arr.length - 1 ? "1px solid var(--line)" : "none",
              }}>
                <div style={{
                  fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900,
                  fontSize: "clamp(36px, 4vw, 52px)", color: "var(--orange)", lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}>
                  {big ?? (numTarget !== null ? <StatCounter target={numTarget} suffix={numSuffix} /> : null)}
                </div>
                <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 15, color: "var(--navy)", marginTop: 8 }}>
                  {label}
                </div>
                <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 3, fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 60, paddingBottom: 80 }}>

        {/* ── Side-by-side: Para clientes / Para maestros ─────────────── */}
        <section style={{ marginBottom: 72 }}>

          {/* Mobile tab switcher */}
          {isMobile && (
            <div style={{ display: "flex", marginBottom: 28, border: "1px solid var(--line)" }}>
              <button
                onClick={() => setActiveTab("cliente")}
                style={{
                  flex: 1, padding: "13px 0", border: "none", cursor: "pointer",
                  background: activeTab === "cliente" ? "var(--orange)" : "#fff",
                  color: activeTab === "cliente" ? "#fff" : "var(--ink)",
                  fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14.5,
                  transition: "background .15s, color .15s",
                }}
              >
                Soy cliente
              </button>
              <button
                onClick={() => setActiveTab("maestro")}
                style={{
                  flex: 1, padding: "13px 0", border: "none", borderLeft: "1px solid var(--line)", cursor: "pointer",
                  background: activeTab === "maestro" ? "var(--navy)" : "#fff",
                  color: activeTab === "maestro" ? "#fff" : "var(--ink)",
                  fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14.5,
                  transition: "background .15s, color .15s",
                }}
              >
                Soy maestro
              </button>
            </div>
          )}

          {/* Two columns */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 0,
            alignItems: "start",
          }}>

            {/* Left — clientes */}
            <div style={{
              display: isMobile && activeTab !== "cliente" ? "none" : "flex",
              flexDirection: "column",
              paddingRight: isMobile ? 0 : 40,
              borderRight: isMobile ? "none" : "1px solid var(--line)",
            }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{
                  background: "var(--orange)", color: "#fff", padding: "4px 14px",
                  fontWeight: 700, fontSize: 12, fontFamily: "var(--font-jetbrains), monospace",
                  letterSpacing: "0.07em", textTransform: "uppercase",
                }}>Para clientes</span>
              </div>
              <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: "clamp(20px,2.5vw,28px)", color: "var(--navy)", margin: "0 0 24px", lineHeight: 1.15 }}>
                Contrata un maestro en 4 pasos
              </h2>
              <Timeline steps={pasosCliente} accent="var(--orange)" />
              <div style={{ marginTop: 24 }}>
                <Link href="/buscar" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "var(--orange)", color: "#fff", fontWeight: 700,
                  padding: "13px 26px", fontSize: 14, textDecoration: "none",
                }}>
                  Buscar un maestro →
                </Link>
              </div>
            </div>

            {/* Right — maestros */}
            <div style={{
              display: isMobile && activeTab !== "maestro" ? "none" : "flex",
              flexDirection: "column",
              paddingLeft: isMobile ? 0 : 40,
            }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{
                  background: "var(--navy)", color: "#fff", padding: "4px 14px",
                  fontWeight: 700, fontSize: 12, fontFamily: "var(--font-jetbrains), monospace",
                  letterSpacing: "0.07em", textTransform: "uppercase",
                }}>Para maestros</span>
              </div>
              <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: "clamp(20px,2.5vw,28px)", color: "var(--navy)", margin: "0 0 24px", lineHeight: 1.15 }}>
                Publica tu perfil y consigue clientes
              </h2>
              <Timeline steps={pasosMaestro} accent="var(--navy)" />
              <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <Link href="/registro" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "var(--navy)", color: "#fff", fontWeight: 700,
                  padding: "13px 26px", fontSize: 14, textDecoration: "none",
                }}>
                  Registrarme gratis →
                </Link>
                <span style={{ fontSize: 12.5, color: "var(--mute)" }}>Sin tarjeta · Sin contrato · 100% gratis</span>
              </div>
            </div>

          </div>
        </section>

        {/* ── Trust badges ────────────────────────────────────────────── */}
        <section style={{ marginBottom: 72, paddingTop: 56, borderTop: "1px solid var(--line)" }}>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>// Seguridad</span>
          <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: "clamp(22px,3vw,32px)", color: "var(--navy)", margin: "0 0 28px", lineHeight: 1.15 }}>
            ¿Por qué confiar en ObraBien?
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {trustBadges.map(b => <TrustBadge key={b.title} {...b} />)}
          </div>
        </section>

        {/* ── Testimonials ────────────────────────────────────────────── */}
        <section style={{ marginBottom: 72, paddingTop: 56, borderTop: "1px solid var(--line)" }}>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>// Testimonios</span>
          <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: "clamp(22px,3vw,32px)", color: "var(--navy)", margin: "0 0 28px", lineHeight: 1.15 }}>
            Lo que dicen nuestros clientes
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                flex: "1 1 300px", background: "#fff", border: "1px solid var(--line)",
                padding: "24px 22px", display: "flex", flexDirection: "column", gap: 14,
                borderTop: "3px solid var(--orange)",
              }}>
                {/* Stars */}
                <div style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} style={{ color: "#F59E0B", fontSize: 18 }}>★</span>
                  ))}
                </div>
                {/* Quote */}
                <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                {/* Author */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto" }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", background: "var(--navy)",
                    color: "#fff", display: "grid", placeItems: "center",
                    fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 14, flexShrink: 0,
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                      {t.city} · {t.service}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section style={{ paddingTop: 56, borderTop: "1px solid var(--line)" }}>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>// FAQ</span>
          <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: "clamp(22px,3vw,32px)", color: "var(--navy)", margin: "0 0 28px", lineHeight: 1.15 }}>
            Preguntas frecuentes
          </h2>
          <div className="col gap-8">
            {faqs.map(({ q, a }, i) => (
              <FaqItem
                key={i}
                q={q}
                a={a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>

          {/* Still have questions? */}
          <div style={{
            marginTop: 32, padding: "24px 28px", background: "var(--navy)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 16, flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 4 }}>
                ¿Tienes otra pregunta?
              </div>
              <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>
                Escríbenos directamente y te respondemos pronto.
              </div>
            </div>
            <a
              href="mailto:contacto@ObraBien.cl"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--orange)", color: "#fff", fontWeight: 700,
                padding: "12px 22px", fontSize: 14, textDecoration: "none", flexShrink: 0,
              }}
            >
              Contactar →
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
