"use client";

import { useState } from "react";

const COLLAPSE_CHARS = 400;

/* ── Lightbox ───────────────────────────────────────────────────────────────── */
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "zoom-out",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          position: "absolute", top: 20, right: 24,
          background: "none", border: "none",
          color: "#fff", fontSize: 30, lineHeight: 1,
          cursor: "pointer", fontWeight: 300,
        }}
      >
        ✕
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "92vw", maxHeight: "92vh",
          objectFit: "contain", display: "block", cursor: "default",
        }}
      />
    </div>
  );
}

/* ── Carousel ───────────────────────────────────────────────────────────────── */
function Carousel({ imagenes, onOpen }: { imagenes: string[]; onOpen: (src: string) => void }) {
  const [idx, setIdx] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);

  const total = imagenes.length;
  const single = total === 1;

  const prev = () => setIdx(i => (i - 1 + total) % total);
  const next = () => setIdx(i => (i + 1) % total);

  const handleTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return;
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 48) diff > 0 ? next() : prev();
    setTouchX(null);
  };

  const arrowStyle: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.42)", border: "none", color: "#fff",
    width: 38, height: 38, borderRadius: "50%",
    fontSize: 22, lineHeight: 1, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 2, transition: "background 0.15s",
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <style>{`
        .carousel-wrap { width: 50%; margin: 0 auto; }
        @media (max-width: 640px) { .carousel-wrap { width: 100%; } }
      `}</style>
      <span className="label" style={{ display: "block", marginBottom: 14 }}>// Imágenes</span>

      {/* Slide */}
      <div className="carousel-wrap">
      <div style={{ position: "relative" }}>
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => onOpen(imagenes[idx])}
          style={{ cursor: "zoom-in", overflow: "hidden", background: "#f4f4f4", lineHeight: 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagenes[idx]}
            alt=""
            style={{ width: "100%", height: "auto", maxHeight: 300, objectFit: "contain", display: "block" }}
          />
        </div>

        {!single && (
          <>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); prev(); }}
              style={{ ...arrowStyle, left: 10 }}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); next(); }}
              style={{ ...arrowStyle, right: 10 }}
              aria-label="Siguiente"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {!single && (
        <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 12 }}>
          {imagenes.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Imagen ${i + 1}`}
              style={{
                width: 8, height: 8, borderRadius: "50%",
                border: "none", padding: 0, cursor: "pointer",
                background: i === idx ? "var(--navy)" : "#ccc",
                transition: "background 0.2s",
              }}
            />
          ))}
        </div>
      )}
      </div>{/* /carousel-wrap */}
    </div>
  );
}

/* ── RecursoBody ────────────────────────────────────────────────────────────── */
export default function RecursoBody({
  contenido,
  imagenes,
}: {
  contenido: string | null;
  imagenes: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const isLong = (contenido?.length ?? 0) > COLLAPSE_CHARS;

  return (
    <>
      {imagenes.length > 0 && (
        <Carousel imagenes={imagenes} onOpen={setLightbox} />
      )}

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}

      {/* Collapsible content */}
      {contenido && (
        <div style={{ marginBottom: 28 }}>
          <div style={{
            background: "#fff", border: "1px solid var(--line)", padding: "28px 32px",
          }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  lineHeight: 1.8, fontSize: 15, color: "var(--ink)",
                  fontFamily: "var(--font-inter-tight),sans-serif",
                  whiteSpace: "pre-wrap",
                  maxHeight: expanded || !isLong ? "none" : "5.4em",
                  overflow: "hidden",
                }}
              >
                {contenido}
              </div>
              {!expanded && isLong && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: 52,
                  background: "linear-gradient(to bottom, transparent, #fff)",
                  pointerEvents: "none",
                }} />
              )}
            </div>
          </div>

          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              style={{
                marginTop: 10, background: "none", border: "none", padding: 0,
                cursor: "pointer", fontFamily: "var(--font-archivo),sans-serif",
                fontWeight: 700, fontSize: 14, color: "var(--orange)",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {expanded ? "Leer menos ↑" : "Leer más →"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
