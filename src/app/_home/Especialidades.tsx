"use client";

import Link from "next/link";
import { useRef } from "react";

const SPECS = [
  {
    slug: "Albañil",
    desc: "Desde obras hasta remodelaciones",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="14" width="20" height="4" rx="1"/><rect x="4" y="10" width="16" height="4" rx="1"/><rect x="6" y="6" width="12" height="4" rx="1"/>
      </svg>
    ),
  },
  {
    slug: "Gasfiter",
    desc: "Instalaciones y reparaciones de agua y gas",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3-3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0z"/><path d="M5 17l4-4m5-5-3 3"/><path d="M2 22l7-7"/>
      </svg>
    ),
  },
  {
    slug: "Electricista",
    desc: "Instalaciones y certificaciones eléctricas",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
      </svg>
    ),
  },
  {
    slug: "Carpintero",
    desc: "Muebles, puertas y estructuras de madera",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v4H3z"/><path d="M8 7v14"/><path d="M16 7v14"/><path d="M3 14h18"/>
      </svg>
    ),
  },
  {
    slug: "Pintor",
    desc: "Interiores, exteriores y barniz",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M12 11v4"/><path d="M8 15h8"/><path d="M10 19h4v2h-4z"/>
      </svg>
    ),
  },
  {
    slug: "Ceramista",
    desc: "Pisos, muros y revestimientos",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>
      </svg>
    ),
  },
  {
    slug: "Techumbres",
    desc: "Cubiertas, techos y reparaciones",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    slug: "Soldadura",
    desc: "Metal, rejas y estructuras metálicas",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v6m0 0-3-3m3 3 3-3"/><path d="M5 12H2l4 8h12l4-8h-3"/><circle cx="12" cy="15" r="3"/>
      </svg>
    ),
  },
];

export default function Especialidades() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  }

  return (
    <section style={{ background: "#F8F8F6", padding: "48px 0 44px" }}>
      <div className="wrap">
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
          <h2 style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 800, fontSize: "clamp(18px, 2.5vw, 24px)",
            color: "var(--navy)", letterSpacing: "-0.02em", margin: 0,
          }}>
            Especialidades más buscadas
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/buscar" style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 12, fontWeight: 700, color: "var(--orange)",
              textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}>
              Ver todas →
            </Link>
            {/* Desktop scroll arrows */}
            <div className="esp-arrows">
              {(["left", "right"] as const).map(dir => (
                <button key={dir} onClick={() => scroll(dir)} aria-label={dir === "left" ? "Anterior" : "Siguiente"} style={{
                  width: 34, height: 34, borderRadius: "50%",
                  border: "1.5px solid var(--line)", background: "#fff",
                  display: "grid", placeItems: "center", cursor: "pointer",
                  color: "var(--navy)", flexShrink: 0,
                  transition: "border-color .15s, background .15s",
                }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div ref={scrollRef} className="esp-carousel no-scrollbar">
          {SPECS.map(({ slug, desc, icon }) => (
            <Link key={slug} href={`/buscar?esp=${encodeURIComponent(slug)}`} style={{ textDecoration: "none", flexShrink: 0 }}>
              <div className="esp-card">
                <div style={{ color: "var(--orange)", marginBottom: 12 }}>{icon}</div>
                <div style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700, fontSize: 14, color: "var(--navy)",
                  marginBottom: 5, letterSpacing: "-0.01em",
                }}>
                  {slug}
                </div>
                <div style={{ fontSize: 12, color: "var(--mute)", lineHeight: 1.5 }}>
                  {desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
