"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export type RecursoDestacado = {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  categoria: string;
  imagen_url: string | null;
  video_url: string | null;
  imagenes_extra: string[] | null;
};

/* ── Constants ──────────────────────────────────────────────────────────────── */

const CATS: Record<string, { emoji: string; label: string }> = {
  normativas: { emoji: "📐", label: "Normativas y Permisos" },
  oficios:    { emoji: "🔨", label: "Oficios y Construcción" },
  finanzas:   { emoji: "💰", label: "Finanzas y Presupuestos" },
  contratos:  { emoji: "📄", label: "Contratos y Documentos" },
  negocios:   { emoji: "🚀", label: "Negocios y Emprendimiento" },
  materiales: { emoji: "🏗️", label: "Materiales de Construcción" },
  seguridad:  { emoji: "⚠️", label: "Seguridad y Prevención de Riesgos" },
  guias:      { emoji: "📚", label: "Guías y Manuales" },
};

const TIPO_CFG: Record<string, { label: string; color: string; bg: string }> = {
  "video":    { label: "VIDEO",    color: "#DC2626", bg: "#FEF2F2" },
  "pdf":      { label: "PDF",      color: "#14375F", bg: "rgba(20,55,95,0.1)" },
  "guía":     { label: "GUÍA",     color: "#15803d", bg: "rgba(34,197,94,0.1)" },
  "artículo": { label: "ARTÍCULO", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
};

const AUTO_MS = 4000;

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function getThumbnail(r: RecursoDestacado): string | null {
  if (r.imagen_url) return r.imagen_url;
  if (r.tipo === "video" && r.video_url) {
    const m = r.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
    if (m) return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
  }
  if (r.imagenes_extra?.length) return r.imagenes_extra[0];
  return null;
}

function tipoCfg(tipo: string) {
  return TIPO_CFG[tipo.toLowerCase()] ?? { label: tipo.toUpperCase(), color: "var(--mute)", bg: "var(--bg-2)" };
}

/* ── ResourceCard ───────────────────────────────────────────────────────────── */
function ResourceCard({ r }: { r: RecursoDestacado }) {
  const thumb = getThumbnail(r);
  const cfg   = tipoCfg(r.tipo);
  const cat   = CATS[r.categoria];

  return (
    <Link
      href={`/recursos/${r.id}`}
      style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid var(--line)", textDecoration: "none", overflow: "hidden", height: "100%" }}
    >
      {/* Thumbnail */}
      <div style={{ height: 170, background: thumb ? "transparent" : cfg.bg, overflow: "hidden", flexShrink: 0, position: "relative" }}>
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
            {cat?.emoji ?? "📄"}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9.5, fontFamily: "var(--font-jetbrains),monospace", fontWeight: 700, letterSpacing: "0.1em", color: cfg.color, background: cfg.bg, padding: "2px 7px" }}>
            {cfg.label}
          </span>
          {cat && (
            <span style={{ fontSize: 9.5, fontFamily: "var(--font-jetbrains),monospace", fontWeight: 700, letterSpacing: "0.07em", color: "var(--mute)", background: "var(--bg-2)", padding: "2px 7px" }}>
              {cat.emoji} {cat.label}
            </span>
          )}
        </div>

        <h3 style={{ fontFamily: "var(--font-archivo),sans-serif", fontWeight: 700, fontSize: 15, color: "var(--navy)", margin: "0 0 6px", lineHeight: 1.3 }}>
          {r.titulo}
        </h3>

        {r.descripcion && (
          <p style={{
            margin: "0 0 14px", fontSize: 13, color: "var(--mute)", lineHeight: 1.55, flex: 1,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
          }}>
            {r.descripcion}
          </p>
        )}

        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: "auto", fontSize: 12.5, fontWeight: 700, color: "var(--navy)" }}>
          Ver recurso →
        </span>
      </div>
    </Link>
  );
}

/* ── AprendeSection ─────────────────────────────────────────────────────────── */
export default function AprendeSection({ recursos }: { recursos: RecursoDestacado[] }) {
  const total = recursos.length;
  const [idx, setIdx]     = useState(0);
  const [fade, setFade]   = useState(false);
  const [autoKey, setAutoKey] = useState(0); // reset interval on manual nav

  function advance(newIdx: number) {
    setFade(true);
    setTimeout(() => { setIdx(newIdx); setFade(false); }, 220);
  }

  function go(dir: 1 | -1) {
    advance((idx + dir + total) % total);
    setAutoKey(k => k + 1);
  }

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => {
      advance((idx + 1) % total);
    }, AUTO_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, total, autoKey]);

  if (total === 0) return null;

  const cards = Array.from({ length: Math.min(3, total) }, (_, i) => recursos[(idx + i) % total]);

  const arrowBtn: React.CSSProperties = {
    flexShrink: 0, width: 38, height: 38, borderRadius: "50%",
    background: "var(--navy)", border: "none", color: "#fff",
    fontSize: 22, lineHeight: 1, cursor: "pointer", alignSelf: "center",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <section style={{ background: "var(--bg)", padding: "64px 0" }}>
      <style>{`
        .aprende-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .aprende-card-extra { }
        @media (max-width: 640px) {
          .aprende-grid { grid-template-columns: 1fr; }
          .aprende-card-extra { display: none !important; }
        }
      `}</style>

      <div className="wrap">

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{
            display: "inline-block",
            fontFamily: "var(--font-jetbrains),monospace", fontWeight: 700,
            fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--orange)", marginBottom: 10,
          }}>
            // Centro de recursos
          </span>
          <h2 style={{
            fontFamily: "var(--font-archivo),sans-serif", fontWeight: 800,
            fontSize: "clamp(26px,4vw,40px)", color: "var(--navy)",
            margin: "0 0 10px", letterSpacing: "-0.02em",
          }}>
            Aprende con ObraBien
          </h2>
          <p style={{ fontSize: 16, color: "var(--mute)", margin: 0 }}>
            Guías, manuales y artículos para trabajar mejor
          </p>
        </div>

        {/* Carousel row: arrow + grid + arrow */}
        <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
          {total > 1 && (
            <button type="button" onClick={() => go(-1)} style={arrowBtn} aria-label="Anterior">‹</button>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="aprende-grid"
              style={{ opacity: fade ? 0 : 1, transition: "opacity 0.22s" }}
            >
              {cards.map((r, i) => (
                <div key={r.id} className={i > 0 ? "aprende-card-extra" : ""} style={{ height: "100%" }}>
                  <ResourceCard r={r} />
                </div>
              ))}
            </div>
          </div>

          {total > 1 && (
            <button type="button" onClick={() => go(1)} style={arrowBtn} aria-label="Siguiente">›</button>
          )}
        </div>

        {/* Dots */}
        {total > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 20 }}>
            {recursos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { advance(i); setAutoKey(k => k + 1); }}
                aria-label={`Ir a recurso ${i + 1}`}
                style={{
                  width: 8, height: 8, borderRadius: "50%", border: "none", padding: 0,
                  cursor: "pointer", background: i === idx ? "var(--navy)" : "#ccc",
                  transition: "background 0.2s",
                }}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Link
            href="/recursos"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--orange)", color: "#fff",
              fontFamily: "var(--font-archivo),sans-serif", fontWeight: 700,
              fontSize: 15, padding: "13px 28px", textDecoration: "none",
            }}
          >
            Ver todos los recursos →
          </Link>
        </div>

      </div>
    </section>
  );
}
