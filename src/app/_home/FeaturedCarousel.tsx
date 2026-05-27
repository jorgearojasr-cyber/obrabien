"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { SAMPLE_MASTERS } from "@/lib/data";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
      <path d="M12 17.3 5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6L18.2 21z" />
    </svg>
  );
}
function ChevronLeft() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
}
function ChevronRight() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;
}

const featuredAll = SAMPLE_MASTERS.filter(m => m.verified);
const featured = featuredAll.slice(0, 3);

export default function FeaturedCarousel() {
  const [slide, setSlide] = useState(0);
  const [slideDesktop, setSlideDesktop] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const desktopMax = Math.max(0, featuredAll.length - 3);

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % featured.length), 4000);
  }, []);

  useEffect(() => {
    restartTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [restartTimer]);

  function goSlide(idx: number) {
    setSlide(idx);
    restartTimer();
  }

  function goDesktopSlide(idx: number) {
    const clamped = Math.max(0, Math.min(idx, desktopMax));
    setSlideDesktop(clamped);
    const el = desktopScrollRef.current;
    if (!el) return;
    const gap = 16;
    const cardW = (el.clientWidth - gap * 2) / 3;
    el.scrollTo({ left: clamped * (cardW + gap), behavior: "smooth" });
  }

  return (
    <section className="block" style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div className="wrap">
        <div className="row between center wrap-flex gap-12" style={{ marginBottom: 32 }}>
          <div>
            <span className="label">// Maestros destacados</span>
            <h2 className="display" style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, marginTop: 6 }}>
              Profesionales verificados.
            </h2>
          </div>
          <Link href="/buscar" className="btn" style={{ textDecoration: "none" }}>
            Ver todos los maestros <ArrowIcon />
          </Link>
        </div>

        {/* Desktop: 3 cards visible, navigate 1 at a time */}
        <div className="desktop-only" style={{ position: "relative" }}>
          <div
            ref={desktopScrollRef}
            className="no-scrollbar"
            style={{ display: "flex", width: "100%", gap: 16, overflowX: "auto" }}
          >
            {featuredAll.map(m => (
              <div key={m.id} style={{ flex: "0 0 calc((100% - 32px) / 3)", minWidth: 0 }}>
                <Link href={`/maestro/${m.id}`} className="card hoverable col"
                  style={{ textDecoration: "none", padding: 0, borderRadius: 10, display: "flex", flexDirection: "column", height: "100%" }}>
                  <div className="row gap-12" style={{ padding: 20, borderBottom: "1px solid var(--line)" }}>
                    <div style={{
                      width: 64, height: 64, background: "#14375F", color: "#fff",
                      display: "grid", placeItems: "center", fontFamily: "var(--font-archivo), sans-serif",
                      fontWeight: 800, fontSize: 22, flexShrink: 0, border: "1px solid var(--ink)",
                    }}>
                      {m.initials}
                    </div>
                    <div className="col gap-4" style={{ flex: 1, minWidth: 0 }}>
                      <div className="row center gap-6 wrap-flex">
                        <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 15.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                        {m.verified && <span className="verified"><CheckIcon /> Verificado</span>}
                      </div>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 600 }}>
                        <StarIcon /> {m.rating.toFixed(1)} <span style={{ color: "var(--mute)", fontWeight: 500 }}>· {m.jobs} trabajos</span>
                      </span>
                      <span style={{ fontSize: 12, color: "var(--mute)" }}>📍 {m.city} · {m.sector}</span>
                    </div>
                  </div>
                  <div className="col gap-8" style={{ padding: 20, flex: 1 }}>
                    <div className="row gap-6 wrap-flex">
                      {m.specialties.slice(0, 2).map(sp => <span key={sp} className="chip">{sp}</span>)}
                    </div>
                    <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {m.description}
                    </p>
                    <div className="row between center" style={{ marginTop: "auto", paddingTop: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--mute)" }}>🕐 {m.schedule.split("·")[0].trim()}</span>
                      <span style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 4 }}>
                        Ver perfil <ArrowIcon />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <button onClick={() => goDesktopSlide(slideDesktop - 1)}
            style={{ position: "absolute", top: "50%", left: -20, transform: "translateY(-50%)", width: 38, height: 38, background: "#fff", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 2, opacity: slideDesktop === 0 ? 0.35 : 1, transition: "opacity .2s" }}
            aria-label="Anterior">
            <ChevronLeft />
          </button>
          <button onClick={() => goDesktopSlide(slideDesktop + 1)}
            style={{ position: "absolute", top: "50%", right: -20, transform: "translateY(-50%)", width: 38, height: 38, background: "#fff", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 2, opacity: slideDesktop >= desktopMax ? 0.35 : 1, transition: "opacity .2s" }}
            aria-label="Siguiente">
            <ChevronRight />
          </button>
        </div>

        {/* Desktop dots */}
        <div className="desktop-only" style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 22 }}>
          {Array.from({ length: desktopMax + 1 }, (_, i) => (
            <button key={i} onClick={() => goDesktopSlide(i)} aria-label={`Ir a posición ${i + 1}`}
              style={{ width: i === slideDesktop ? 24 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer", padding: 0, transition: "all .25s", background: i === slideDesktop ? "var(--orange)" : "var(--line)" }} />
          ))}
        </div>

        {/* Mobile: 1 card at a time */}
        <div className="mobile-only" style={{ position: "relative" }}>
          <div style={{ overflow: "hidden" }}>
            <div style={{
              display: "flex",
              transform: `translateX(-${slide * 100}%)`,
              transition: "transform 0.45s cubic-bezier(.25,.46,.45,.94)",
            }}>
              {featured.map(m => (
                <div key={m.id} style={{ minWidth: "100%", paddingBottom: 4 }}>
                  <Link href={`/maestro/${m.id}`} className="card hoverable col"
                    style={{ textDecoration: "none", padding: 0, borderRadius: 10, display: "flex", flexDirection: "column" }}>
                    <div className="row gap-12" style={{ padding: 20, borderBottom: "1px solid var(--line)" }}>
                      <div style={{
                        width: 64, height: 64, background: "#14375F", color: "#fff",
                        display: "grid", placeItems: "center", fontFamily: "var(--font-archivo), sans-serif",
                        fontWeight: 800, fontSize: 22, flexShrink: 0, border: "1px solid var(--ink)",
                      }}>
                        {m.initials}
                      </div>
                      <div className="col gap-4" style={{ flex: 1, minWidth: 0 }}>
                        <div className="row center gap-6 wrap-flex">
                          <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 17, fontWeight: 700 }}>{m.name}</span>
                          {m.verified && <span className="verified"><CheckIcon /> Verificado</span>}
                        </div>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 600 }}>
                          <StarIcon /> {m.rating.toFixed(1)} <span style={{ color: "var(--mute)", fontWeight: 500 }}>· {m.jobs} trabajos</span>
                        </span>
                        <span style={{ fontSize: 13, color: "var(--mute)" }}>📍 {m.city} · {m.sector}</span>
                      </div>
                    </div>
                    <div className="col gap-8" style={{ padding: 20 }}>
                      <div className="row gap-6 wrap-flex">
                        {m.specialties.map(sp => <span key={sp} className="chip">{sp}</span>)}
                      </div>
                      <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                        {m.description}
                      </p>
                      <div className="row between center" style={{ marginTop: 4 }}>
                        <span style={{ fontSize: 12, color: "var(--mute)" }}>🕐 {m.schedule.split("·")[0].trim()}</span>
                        <span style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
                          Ver perfil <ArrowIcon />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => goSlide((slide + featured.length - 1) % featured.length)}
            style={{ position: "absolute", top: "50%", left: -20, transform: "translateY(-50%)", width: 38, height: 38, background: "#fff", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 2 }}
            aria-label="Anterior">
            <ChevronLeft />
          </button>
          <button onClick={() => goSlide((slide + 1) % featured.length)}
            style={{ position: "absolute", top: "50%", right: -20, transform: "translateY(-50%)", width: 38, height: 38, background: "#fff", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 2 }}
            aria-label="Siguiente">
            <ChevronRight />
          </button>
        </div>

        {/* Mobile dots */}
        <div className="mobile-only" style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 22 }}>
          {featured.map((_, i) => (
            <button key={i} onClick={() => goSlide(i)} aria-label={`Ir a maestro ${i + 1}`}
              style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer", padding: 0, transition: "all .25s", background: i === slide ? "var(--orange)" : "var(--line)" }} />
          ))}
        </div>
      </div>
    </section>
  );
}
