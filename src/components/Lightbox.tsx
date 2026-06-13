"use client";

import { useEffect, useCallback } from "react";

export type LightboxPhoto = { url: string; label?: string | null };

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left" ? <path d="M15 18 9 12l6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

interface Props {
  fotos: LightboxPhoto[];
  active: number | null;
  onClose: () => void;
  onSetActive: (i: number) => void;
}

export default function Lightbox({ fotos, active, onClose, onSetActive }: Props) {
  const prev = useCallback(() => {
    if (active === null) return;
    onSetActive((active - 1 + fotos.length) % fotos.length);
  }, [active, fotos.length, onSetActive]);

  const next = useCallback(() => {
    if (active === null) return;
    onSetActive((active + 1) % fotos.length);
  }, [active, fotos.length, onSetActive]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onClose, prev, next]);

  useEffect(() => {
    document.body.style.overflow = active !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  if (active === null) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Counter */}
      {fotos.length > 1 && (
        <div style={{
          position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.6)", fontSize: 13,
          fontFamily: "var(--font-jetbrains), monospace",
          pointerEvents: "none",
        }}>
          {active + 1} / {fotos.length}
        </div>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        style={{ all: "unset", position: "absolute", top: 14, right: 18, color: "#fff", cursor: "pointer", padding: 8, lineHeight: 0, opacity: 0.8 }}
        aria-label="Cerrar"
      >
        <CloseIcon />
      </button>

      {/* Prev */}
      {fotos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          style={{ all: "unset", position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#fff", cursor: "pointer", padding: "12px 16px", opacity: 0.75, background: "rgba(255,255,255,0.08)", borderRadius: 4 }}
          aria-label="Anterior"
        >
          <ChevronIcon dir="left" />
        </button>
      )}

      {/* Image */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active}
          src={fotos[active].url}
          alt={fotos[active].label ?? `Foto ${active + 1}`}
          style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", display: "block", border: "1px solid rgba(255,255,255,0.1)" }}
        />
        {fotos[active].label && (
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "var(--font-jetbrains), monospace", textAlign: "center" }}>
            {fotos[active].label}
          </div>
        )}
      </div>

      {/* Next */}
      {fotos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          style={{ all: "unset", position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#fff", cursor: "pointer", padding: "12px 16px", opacity: 0.75, background: "rgba(255,255,255,0.08)", borderRadius: 4 }}
          aria-label="Siguiente"
        >
          <ChevronIcon dir="right" />
        </button>
      )}
    </div>
  );
}
