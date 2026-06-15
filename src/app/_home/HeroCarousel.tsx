"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Gift, Star, CheckCircle2 } from "lucide-react";

const SLIDES = [
  {
    key: "cliente",
    bgUrl: "https://res.cloudinary.com/dur4ffxqw/image/upload/v1781320539/ChatGPT_Image_12_jun_2026_11_14_35_p.m._ehnqce.png",
    bgPosition: "60% 15%",
    mobileBgUrl: "https://res.cloudinary.com/dur4ffxqw/image/upload/v1781493910/ChatGPT_Image_14_jun_2026_11_17_07_p.m._pni4za.png",
    mobilePosition: "center top",
    overlayDesktop: "linear-gradient(to right, rgba(248,245,240,0.96) 0%, rgba(248,245,240,0.96) 42%, rgba(248,245,240,0.4) 62%, transparent 80%)",
    textSide: "left" as const,
  },
  {
    key: "maestro",
    bgUrl: "https://res.cloudinary.com/dur4ffxqw/image/upload/v1781491567/ChatGPT_Image_14_jun_2026_10_45_58_p.m._hmnxpf.png",
    bgPosition: "center top",
    mobileBgUrl: "https://res.cloudinary.com/dur4ffxqw/image/upload/v1781493903/ChatGPT_Image_14_jun_2026_11_21_25_p.m._bjikej.png",
    mobilePosition: "center 60%",
    overlayDesktop: "linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(10,30,60,0.15) 40%, rgba(10,30,60,0.70) 65%, rgba(10,30,60,0.80) 100%)",
    textSide: "right" as const,
  },
];

/* ── Desktop slide content ─────────────────────────────────────────────────── */

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
  const checks = [
    "Muestra tu trabajo", "Recibe consultas",
    "Más visibilidad",    "100% Gratis",
  ];
  return (
    <div className="slide-maestro-card">
      <div style={{ marginBottom: 14 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "#F97316",
        }}>
          <span style={{ width: 5, height: 5, background: "#F97316", borderRadius: "50%" }} />
          PARA MAESTROS
        </span>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontFamily: "var(--font-archivo), sans-serif",
          fontSize: "clamp(24px, 2.6vw, 42px)", fontWeight: 900,
          lineHeight: 1.05, letterSpacing: "-0.03em", color: "#fff",
        }}>
          ¿Eres maestro?
        </div>
        <div style={{
          fontFamily: "var(--font-archivo), sans-serif",
          fontSize: "clamp(24px, 2.6vw, 42px)", fontWeight: 900,
          lineHeight: 1.05, letterSpacing: "-0.03em", color: "#F97316",
        }}>
          Regístrate gratis.
        </div>
      </div>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", margin: "0 0 18px", lineHeight: 1.6 }}>
        Crea tu tarjeta digital profesional y recibe más clientes.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: 22 }}>
        {checks.map(label => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 13, fontWeight: 500 }}>
            <CheckCircle2 size={13} color="#F97316" strokeWidth={2.2} style={{ flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>
      <Link href="/registro?tab=maestro" style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "#F97316", color: "#fff",
        fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 14.5,
        padding: "13px 24px", borderRadius: 8,
        textDecoration: "none", letterSpacing: "-0.01em", whiteSpace: "nowrap",
        alignSelf: "flex-start",
      }}>
        Regístrate como Maestro →
      </Link>
    </div>
  );
}

/* ── Mobile slide content ──────────────────────────────────────────────────── */

function MobileCliente() {
  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#F97316",
        }}>
          <span style={{ width: 5, height: 5, background: "#F97316", borderRadius: "50%" }} />
          ObraBien · Plataforma Chilena
        </span>
      </div>
      <div style={{
        fontFamily: "var(--font-archivo), sans-serif",
        fontSize: 26, fontWeight: 900, lineHeight: 1.1,
        letterSpacing: "-0.025em", color: "#fff", marginBottom: 8,
      }}>
        Encuentra maestros confiables.
      </div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, marginBottom: 18 }}>
        Albañiles, gasfiter, electricistas y más.
      </div>
      <Link href="/buscar" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F97316", color: "#fff",
        fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 15,
        height: 48, borderRadius: 8, textDecoration: "none",
        letterSpacing: "-0.01em",
      }}>
        Busca tu Maestro
      </Link>
    </>
  );
}

function MobileMaestro() {
  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#F97316",
        }}>
          <span style={{ width: 5, height: 5, background: "#F97316", borderRadius: "50%" }} />
          Para Maestros
        </span>
      </div>
      <div style={{
        fontFamily: "var(--font-archivo), sans-serif",
        fontSize: 26, fontWeight: 900, lineHeight: 1.1,
        letterSpacing: "-0.025em", color: "#fff", marginBottom: 2,
      }}>
        ¿Eres maestro?
      </div>
      <div style={{
        fontFamily: "var(--font-archivo), sans-serif",
        fontSize: 26, fontWeight: 900, lineHeight: 1.1,
        letterSpacing: "-0.025em", color: "#F97316", marginBottom: 8,
      }}>
        Regístrate gratis.
      </div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, marginBottom: 18 }}>
        Crea tu tarjeta digital y recibe más clientes.
      </div>
      <Link href="/registro?tab=maestro" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F97316", color: "#fff",
        fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 15,
        height: 48, borderRadius: 8, textDecoration: "none",
        letterSpacing: "-0.01em",
      }}>
        Regístrate como Maestro →
      </Link>
    </>
  );
}

/* ── Dots ──────────────────────────────────────────────────────────────────── */

function Dots({ active, total, goTo }: { active: number; total: number; goTo: (i: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
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
  );
}

/* ── Main carousel ─────────────────────────────────────────────────────────── */

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
    <div
      className="hero-carousel"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {/* ── DESKTOP layout ─────────────────────────────────────────────────── */}
      <div className="hero-desktop-layout hero-section-img" style={{ borderRadius: 12 }}>
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.bgUrl}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: slide.bgPosition,
            pointerEvents: "none",
          }}
        />
        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: slide.overlayDesktop,
        }} />
        {/* Content */}
        <div style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease",
          width: "100%",
          position: slide.textSide === "right" ? "absolute" : "relative",
          inset: slide.textSide === "right" ? 0 : undefined,
          display: "flex",
          alignItems: slide.textSide === "right" ? "center" : undefined,
          justifyContent: slide.textSide === "right" ? "flex-end" : "flex-start",
          zIndex: 2,
        }}>
          {active === 0 ? <SlideCliente /> : <SlideMaestro />}
        </div>
        {/* Arrows */}
        <button onClick={prev} aria-label="Anterior" className="hero-arrow hero-arrow-left">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button onClick={next} aria-label="Siguiente" className="hero-arrow hero-arrow-right">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        {/* Dots */}
        <div style={{
          position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
          zIndex: 10,
        }}>
          <Dots active={active} total={SLIDES.length} goTo={goTo} />
        </div>
      </div>

      {/* ── MOBILE layout ──────────────────────────────────────────────────── */}
      <div className="hero-mobile-layout" style={{ borderRadius: 12, overflow: "hidden" }}>
        {/* Image strip */}
        <div className="hero-mobile-img-strip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.mobileBgUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: slide.mobilePosition }}
          />
          {/* Fade hacia el fondo del texto */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: "40%", zIndex: 1,
            background: "linear-gradient(to bottom, transparent, #0A1E3C)",
            pointerEvents: "none",
          }} />
        </div>
        {/* Text area */}
        <div
          className="hero-mobile-text"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          {active === 0 ? <MobileCliente /> : <MobileMaestro />}
          {/* Dots */}
          <div style={{ marginTop: 20 }}>
            <Dots active={active} total={SLIDES.length} goTo={goTo} />
          </div>
        </div>
      </div>
    </div>
  );
}
