"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Gift, Star, CheckCircle2 } from "lucide-react";

const SLIDES = [
  {
    key: "cliente",
    bgUrl: "https://res.cloudinary.com/dur4ffxqw/image/upload/v1781320539/ChatGPT_Image_12_jun_2026_11_14_35_p.m._ehnqce.png",
    bgPosition: "60% 15%",
    overlayDesktop: "linear-gradient(to right, rgba(248,245,240,0.96) 0%, rgba(248,245,240,0.96) 42%, rgba(248,245,240,0.4) 62%, transparent 80%)",
    overlayMobile: "linear-gradient(to bottom, rgba(248,245,240,0.55) 0%, rgba(248,245,240,0.72) 100%)",
    textSide: "left" as const,
  },
  {
    key: "maestro",
    bgUrl: "https://res.cloudinary.com/dur4ffxqw/image/upload/v1781490810/ChatGPT_Image_14_jun_2026_10_32_45_p.m._kmbeuf.png",
    bgPosition: "left center",
    overlayDesktop: "linear-gradient(to left, rgba(248,245,240,0.96) 0%, rgba(248,245,240,0.96) 42%, rgba(248,245,240,0.4) 62%, transparent 80%)",
    overlayMobile: "linear-gradient(to bottom, rgba(248,245,240,0.55) 0%, rgba(248,245,240,0.72) 100%)",
    textSide: "right" as const,
  },
];

function SlideCliente() {
  return (
    <div className="hero-text">
      <div style={{ marginBottom: 14 }}>
        <span className="hero-badge" style={{ color: "#FFFFFF", backgroundColor: "#1B2B4B" }}>
          <span style={{ width: 5, height: 5, background: "#F97316", borderRadius: "50%", flexShrink: 0 }} />
          ObraBien · Plataforma chilena
        </span>
      </div>
      <h1 style={{
        fontFamily: "var(--font-archivo), sans-serif",
        fontSize: "clamp(26px, 2.8vw, 44px)", fontWeight: 900, lineHeight: 1.05,
        color: "#1B2B4B", letterSpacing: "-0.025em", margin: "0 0 12px",
      }}>
        Encuentra<br />
        <span style={{ color: "#F97316" }}>maestros confiables</span><br />
        para tu proyecto.
      </h1>
      <p style={{ fontSize: 14.5, color: "#475569", margin: "0 0 16px", lineHeight: 1.6 }}>
        Albañiles, gasfiter, electricistas, carpinteros y más.
        Revisa perfiles, reseñas reales y contáctalos directo — sin intermediarios.
      </p>
      <div className="hero-trust" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { Icon: ShieldCheck, label: "Maestros verificados" },
          { Icon: Star,        label: "Calificaciones reales" },
          { Icon: Gift,        label: "100% gratis" },
        ].map(({ Icon, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, color: "#1B2B4B", fontSize: 13, fontWeight: 600 }}>
            <Icon size={15} color="#F97316" strokeWidth={2.2} />
            {label}
          </span>
        ))}
      </div>
      <div className="hero-cta-buttons" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { href: "/buscar",   bg: "#F97316", label: "Busca tu Maestro" },
          { href: "/registro", bg: "#1B2B4B", label: "Regístrate como Maestro" },
        ].map(({ href, bg, label }) => (
          <Link key={href} href={href} style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: bg, color: "#fff",
            width: 280, height: 52, borderRadius: 8,
            fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 15,
            textDecoration: "none", letterSpacing: "-0.01em", whiteSpace: "nowrap",
          }}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SlideMaestro() {
  const checks = ["Muestra tu trabajo", "Recibe consultas", "Más visibilidad", "100% Gratis"];
  return (
    <div className="hero-text hero-text-right">
      <div style={{ marginBottom: 14 }}>
        <span className="hero-badge" style={{ color: "#FFFFFF", backgroundColor: "#1B2B4B" }}>
          <span style={{ width: 5, height: 5, background: "#F97316", borderRadius: "50%", flexShrink: 0 }} />
          Para Maestros
        </span>
      </div>
      <h1 style={{
        fontFamily: "var(--font-archivo), sans-serif",
        fontSize: "clamp(26px, 2.8vw, 44px)", fontWeight: 900, lineHeight: 1.05,
        color: "#1B2B4B", letterSpacing: "-0.025em", margin: "0 0 12px",
      }}>
        ¿Eres maestro?<br />
        Regístrate<br />
        ahora <span style={{ color: "#F97316" }}>gratis.</span>
      </h1>
      <p style={{ fontSize: 14.5, color: "#475569", margin: "0 0 16px", lineHeight: 1.6 }}>
        Crea tu tarjeta digital profesional y recibe más clientes.
        Sin costos, sin intermediarios.
      </p>
      <div className="hero-trust" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {checks.map(label => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, color: "#1B2B4B", fontSize: 12.5, fontWeight: 600 }}>
            <CheckCircle2 size={14} color="#F97316" strokeWidth={2.2} />
            {label}
          </span>
        ))}
      </div>
      <div className="hero-cta-buttons" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/registro?tab=maestro" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: "#F97316", color: "#fff",
          width: 280, height: 52, borderRadius: 8,
          fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 15,
          textDecoration: "none", letterSpacing: "-0.01em", whiteSpace: "nowrap",
        }}>
          Regístrate como Maestro →
        </Link>
      </div>
    </div>
  );
}

const SLIDE_CONTENT = [<SlideCliente key="cliente" />, <SlideMaestro key="maestro" />];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const paused = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function goTo(idx: number) {
    if (idx === active) return;
    setVisible(false);
    setTimeout(() => {
      setActive(idx);
      setVisible(true);
    }, 400);
  }

  function next() { goTo((active + 1) % SLIDES.length); }
  function prev() { goTo((active - 1 + SLIDES.length) % SLIDES.length); }

  useEffect(() => {
    function tick() {
      if (!paused.current) next();
      timer.current = setTimeout(tick, 6000);
    }
    timer.current = setTimeout(tick, 6000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const slide = SLIDES[active];

  return (
    <section
      className="hero-section-img"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 400,
        margin: 0,
        overflow: "hidden",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        backgroundImage: `url(${slide.bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: slide.bgPosition,
        transition: "background-image 0s",
      }}
    >
      {/* Overlay desktop */}
      <div className="hero-overlay" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: slide.overlayDesktop,
      }} />

      {/* Content — fade transition */}
      <div style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
        width: "100%",
        display: "flex",
        justifyContent: slide.textSide === "right" ? "flex-end" : "flex-start",
      }}>
        {SLIDE_CONTENT[active]}
      </div>

      {/* Arrow: prev */}
      <button onClick={prev} aria-label="Anterior" className="hero-arrow hero-arrow-left">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Arrow: next */}
      <button onClick={next} aria-label="Siguiente" className="hero-arrow hero-arrow-right">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Dots */}
      <div style={{
        position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 8, zIndex: 10,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir a slide ${i + 1}`}
            style={{
              width: i === active ? 22 : 8,
              height: 8, borderRadius: 4, border: "none",
              background: i === active ? "#F97316" : "rgba(255,255,255,0.55)",
              cursor: "pointer", padding: 0,
              transition: "width 0.3s, background 0.3s",
            }}
          />
        ))}
      </div>
    </section>
  );
}
