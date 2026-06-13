"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";

export type Recurso = {
  id: string;
  titulo: string;
  descripcion: string | null;
  contenido: string | null;
  tipo: string;
  categoria: string;
  url: string | null;
  video_url: string | null;
  pdf_url: string | null;
  imagenes_extra: string[] | null;
  imagen_url: string | null;
  para_quien: string;
  destacado: boolean;
  estado: string | null;
  created_at: string;
};

/* ── Constants ──────────────────────────────────────────────────────────────── */

const TABS = [
  { key: "todos",      label: "Todos" },
  { key: "normativas", label: "📐 Normativas y Permisos" },
  { key: "oficios",    label: "🔨 Oficios y Construcción" },
  { key: "finanzas",   label: "💰 Finanzas y Presupuestos" },
  { key: "contratos",  label: "📄 Contratos y Documentos" },
  { key: "negocios",   label: "🚀 Negocios y Emprendimiento" },
  { key: "materiales", label: "🏗️ Materiales de Construcción" },
  { key: "seguridad",  label: "⚠️ Seguridad y Prevención de Riesgos" },
  { key: "guias",      label: "📚 Guías y Manuales" },
];

const TIPO_CFG: Record<string, { label: string; color: string; bg: string }> = {
  "video":    { label: "VIDEO",    color: "#DC2626", bg: "#FEF2F2" },
  "pdf":      { label: "PDF",      color: "#14375F", bg: "rgba(20,55,95,0.1)" },
  "guía":     { label: "GUÍA",     color: "#15803d", bg: "rgba(34,197,94,0.1)" },
  "artículo": { label: "ARTÍCULO", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
};

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

const PAGE_SIZE = 9;

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
  return m?.[1] ?? null;
}

function getActionUrl(r: Recurso): string | null {
  if (r.tipo === "video") return r.video_url || r.url || null;
  if (r.tipo === "pdf")   return r.pdf_url   || r.url || null;
  return r.url || null;
}

function isProximamente(r: Recurso): boolean {
  return r.estado === "proximamente" || (!r.estado && !getActionUrl(r));
}

function getThumbnail(r: Recurso): string | null {
  if (r.imagen_url) return r.imagen_url;
  if (r.tipo === "video") {
    const src = r.video_url || r.url || "";
    if (src) {
      const id = getYouTubeId(src);
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
  }
  if (r.imagenes_extra?.length) return r.imagenes_extra[0];
  return null;
}

function tipoCfg(tipo: string) {
  return TIPO_CFG[tipo.toLowerCase()] ?? { label: tipo.toUpperCase(), color: "var(--mute)", bg: "var(--bg-2)" };
}

/* ── Icons ──────────────────────────────────────────────────────────────────── */
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="rgba(255,255,255,0.95)">
      <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.55)" />
      <polygon points="10,8 18,12 10,16" fill="white" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

/* ── ProximamenteBadge ──────────────────────────────────────────────────────── */
function ProximamenteBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "rgba(245,158,11,0.12)", color: "#92400e",
      padding: "2px 8px", fontSize: 9.5,
      fontFamily: "var(--font-jetbrains),monospace", fontWeight: 700, letterSpacing: "0.08em",
    }}>
      PRÓXIMAMENTE
    </span>
  );
}

/* ── ResourceThumbnail ──────────────────────────────────────────────────────── */
function ResourceThumbnail({ r, height = 180 }: { r: Recurso; height?: number }) {
  const thumb = getThumbnail(r);
  const isVideo = r.tipo === "video";
  const cfg = tipoCfg(r.tipo);

  return (
    <div style={{
      height, background: thumb ? "transparent" : cfg.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", flexShrink: 0,
      color: cfg.color,
    }}>
      {thumb ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          {isVideo && !isProximamente(r) && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PlayIcon />
            </div>
          )}
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {r.tipo === "pdf" ? <PdfIcon /> : (
            <span style={{ fontSize: 36 }}>{CATS[r.categoria]?.emoji ?? "📄"}</span>
          )}
        </div>
      )}
      {isProximamente(r) && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(255,255,255,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 11, fontFamily: "var(--font-jetbrains),monospace", fontWeight: 700, color: "#92400e", letterSpacing: "0.1em" }}>
            PRÓXIMAMENTE
          </span>
        </div>
      )}
    </div>
  );
}

/* ── ActionButton ───────────────────────────────────────────────────────────── */
function ActionButton({ r, featured = false }: { r: Recurso; featured?: boolean }) {
  const coming = isProximamente(r);
  const pad = featured ? "10px 20px" : "8px 14px";
  const fsize = featured ? 13.5 : 12.5;

  if (coming) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "var(--bg-2)", color: "var(--mute)",
        padding: pad, fontSize: fsize, fontWeight: 700,
      }}>
        Próximamente
      </span>
    );
  }

  return (
    <Link
      href={`/recursos/${r.id}`}
      style={{
        display: "inline-flex", alignItems: "center", gap: featured ? 7 : 6,
        background: "var(--navy)", color: "#fff",
        padding: pad, fontSize: fsize, fontWeight: 700,
        textDecoration: "none",
      }}
    >
      {r.tipo === "pdf" ? "Ver PDF" : r.tipo === "video" ? "Ver video" : "Ver recurso"}
      {" "}<ArrowIcon />
    </Link>
  );
}

/* ── ResourceCard (grid) ────────────────────────────────────────────────────── */
function ResourceCard({ r }: { r: Recurso }) {
  const cfg = tipoCfg(r.tipo);
  const [hovered, setHovered] = useState(false);
  const coming = isProximamente(r);

  return (
    <div
      style={{
        background: "#fff", border: `1px solid ${hovered ? "var(--navy)" : "var(--line)"}`,
        boxShadow: hovered ? "0 3px 14px rgba(0,0,0,0.07)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        display: "flex", flexDirection: "column", overflow: "hidden",
        height: "100%",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ResourceThumbnail r={r} height={160} />

      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 9.5, fontFamily: "var(--font-jetbrains),monospace", fontWeight: 700,
            letterSpacing: "0.1em", color: cfg.color, background: cfg.bg, padding: "2px 8px",
          }}>
            {cfg.label}
          </span>
          <span style={{
            fontSize: 9.5, fontFamily: "var(--font-jetbrains),monospace", fontWeight: 700,
            letterSpacing: "0.08em", color: "var(--mute)", background: "var(--bg-2)", padding: "2px 8px",
          }}>
            {CATS[r.categoria]?.emoji ?? ""} {CATS[r.categoria]?.label ?? r.categoria}
          </span>
          {coming && <ProximamenteBadge />}
        </div>

        <h3 style={{ fontFamily: "var(--font-archivo),sans-serif", fontWeight: 700, fontSize: 15, color: "var(--ink)", margin: "0 0 7px", lineHeight: 1.35 }}>
          {r.titulo}
        </h3>

        {(r.descripcion || r.contenido) && (
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--mute)", lineHeight: 1.55, flex: 1 }}>
            {r.descripcion || (r.contenido ?? "").slice(0, 140) + ((r.contenido?.length ?? 0) > 140 ? "…" : "")}
          </p>
        )}

        <div style={{ marginTop: "auto" }}>
          <ActionButton r={r} />
        </div>
      </div>
    </div>
  );
}

/* ── FeaturedCard (horizontal, larger) ─────────────────────────────────────── */
function FeaturedCard({ r }: { r: Recurso }) {
  const cfg = tipoCfg(r.tipo);
  const [hovered, setHovered] = useState(false);
  const coming = isProximamente(r);

  return (
    <div
      className="featured-card"
      style={{
        background: "#fff", border: `1.5px solid ${hovered ? "var(--navy)" : "var(--line)"}`,
        boxShadow: hovered ? "0 4px 18px rgba(0,0,0,0.09)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="featured-card-thumb">
        <ResourceThumbnail r={r} height={210} />
      </div>

      <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 9, fontFamily: "var(--font-jetbrains),monospace", fontWeight: 700,
              letterSpacing: "0.12em", background: "var(--orange)", color: "#fff", padding: "2px 8px",
            }}>
              DESTACADO
            </span>
            <span style={{
              fontSize: 9.5, fontFamily: "var(--font-jetbrains),monospace", fontWeight: 700,
              letterSpacing: "0.1em", color: cfg.color, background: cfg.bg, padding: "2px 8px",
            }}>
              {cfg.label}
            </span>
            {coming && <ProximamenteBadge />}
          </div>
          <h3 style={{ fontFamily: "var(--font-archivo),sans-serif", fontWeight: 800, fontSize: 18, color: "var(--navy)", margin: "0 0 8px", lineHeight: 1.3 }}>
            {r.titulo}
          </h3>
          {(r.descripcion || r.contenido) && (
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--mute)", lineHeight: 1.6 }}>
              {r.descripcion || (r.contenido ?? "").slice(0, 160) + ((r.contenido?.length ?? 0) > 160 ? "…" : "")}
            </p>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <ActionButton r={r} featured />
        </div>
      </div>
    </div>
  );
}

/* ── HorizontalCarousel ─────────────────────────────────────────────────────── */
function HorizontalCarousel({ recursos }: { recursos: Recurso[] }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * ref.current.clientWidth * 0.78, behavior: "smooth" });
  }

  const btnStyle: React.CSSProperties = {
    flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
    background: "var(--navy)", border: "none", color: "#fff",
    fontSize: 20, lineHeight: 1, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    alignSelf: "center", transition: "opacity 0.15s",
  };

  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 10 }}>
      <button type="button" onClick={() => scroll(-1)} style={btnStyle} aria-label="Anterior">‹</button>

      <div
        ref={ref}
        style={{
          flex: 1, display: "flex", gap: 16,
          overflowX: "auto", scrollSnapType: "x mandatory",
          scrollbarWidth: "none", paddingBottom: 4,
        }}
      >
        <style>{`.hcarousel-hide::-webkit-scrollbar{display:none}`}</style>
        {recursos.map(r => (
          <div key={r.id} style={{ flexShrink: 0, width: "calc(33.333% - 11px)", minWidth: 240, scrollSnapAlign: "start" }}>
            <ResourceCard r={r} />
          </div>
        ))}
      </div>

      <button type="button" onClick={() => scroll(1)} style={btnStyle} aria-label="Siguiente">›</button>
    </div>
  );
}

/* ── ResultsGrid (category + search) ───────────────────────────────────────── */
function ResultsGrid({
  items, total, page, onPage,
}: {
  items: Recurso[]; total: number; page: number; onPage: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const paginationBtn: React.CSSProperties = {
    height: 40, padding: "0 20px", border: "1.5px solid var(--line)",
    background: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
    fontFamily: "var(--font-archivo),sans-serif", color: "var(--navy)",
  };
  const disabledBtn: React.CSSProperties = {
    ...paginationBtn, color: "var(--mute)", cursor: "default", opacity: 0.5,
  };

  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16, marginBottom: totalPages > 1 ? 32 : 0,
      }}>
        {items.map(r => <ResourceCard key={r.id} r={r} />)}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 8 }}>
          <button
            style={page === 0 ? disabledBtn : paginationBtn}
            disabled={page === 0}
            onClick={() => { onPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: 13.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains),monospace", whiteSpace: "nowrap" }}>
            Página {page + 1} de {totalPages}
          </span>
          <button
            style={page >= totalPages - 1 ? disabledBtn : paginationBtn}
            disabled={page >= totalPages - 1}
            onClick={() => { onPage(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */

export default function RecursosContent({ recursos }: { recursos: Recurso[] }) {
  const [activeTab, setActiveTab]   = useState("todos");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(0);

  const visible = useMemo(
    () => recursos.filter(r => !r.estado || r.estado !== "borrador"),
    [recursos],
  );

  const isSearching    = search.trim().length > 0;
  const isCategoryView = !isSearching && activeTab !== "todos";
  const isDefaultView  = !isSearching && activeTab === "todos";

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = search.toLowerCase();
    return visible.filter(r =>
      r.titulo.toLowerCase().includes(q) ||
      (r.descripcion ?? "").toLowerCase().includes(q) ||
      (r.contenido   ?? "").toLowerCase().includes(q),
    );
  }, [visible, search, isSearching]);

  const categoryResults = useMemo(
    () => (isCategoryView ? visible.filter(r => r.categoria === activeTab) : []),
    [visible, activeTab, isCategoryView],
  );

  const featured      = useMemo(() => visible.filter(r => r.destacado).slice(0, 3),  [visible]);
  const carouselItems = useMemo(() => visible.filter(r => !r.destacado).slice(0, 9), [visible]);

  const activeResults = isSearching ? searchResults : categoryResults;
  const pageItems     = activeResults.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleTabChange(key: string) {
    setActiveTab(key);
    setPage(0);
  }

  function handleSearch(val: string) {
    setSearch(val);
    setPage(0);
  }

  return (
    <>
      {/* Hero */}
      <div style={{ background: "var(--navy)", padding: "40px 0 36px" }}>
        <div className="wrap">
          <span className="label" style={{ color: "var(--orange)" }}>// Centro de recursos</span>
          <h1 style={{ fontFamily: "var(--font-archivo),sans-serif", color: "#fff", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, margin: "6px 0 8px" }}>
            Aprende con ObraBien
          </h1>
          <p style={{ color: "#9AA7B5", fontSize: 16, margin: 0, maxWidth: 520 }}>
            Todo lo que necesitas saber para trabajar y contratar mejor.
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "14px 0" }}>
        <div className="wrap">
          <div style={{ position: "relative", maxWidth: 520 }}>
            <span style={{
              position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
              fontSize: 15, pointerEvents: "none", userSelect: "none",
            }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Buscar guías, manuales, artículos..."
              style={{
                width: "100%", height: 44, paddingLeft: 40, paddingRight: search ? 40 : 12,
                border: "1.5px solid var(--line)", fontSize: 14, color: "var(--ink)",
                background: "#fff", outline: "none", boxSizing: "border-box",
                fontFamily: "var(--font-archivo),sans-serif",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearch("")}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 20, color: "var(--mute)", lineHeight: 1, padding: 2,
                }}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)", overflowX: "auto" }}>
        <div className="wrap" style={{ display: "flex", gap: 0 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              style={{
                height: 48, padding: "0 20px", border: "none", background: "transparent",
                fontWeight: activeTab === t.key && !isSearching ? 700 : 500,
                fontSize: 14, cursor: "pointer", whiteSpace: "nowrap",
                color: activeTab === t.key && !isSearching ? "var(--navy)" : "var(--mute)",
                borderBottom: `2.5px solid ${activeTab === t.key && !isSearching ? "var(--orange)" : "transparent"}`,
                transition: "color 0.15s, border-color 0.15s",
                fontFamily: "var(--font-archivo),sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 64 }}>

        {/* ── Search results ── */}
        {isSearching && (
          searchResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 24px", background: "#fff", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 15, color: "var(--mute)", margin: 0 }}>
                No encontramos recursos para &ldquo;<strong>{search}</strong>&rdquo;
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: "var(--mute)", marginBottom: 20, fontFamily: "var(--font-jetbrains),monospace" }}>
                // {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} para &ldquo;{search}&rdquo;
              </p>
              <ResultsGrid items={pageItems} total={searchResults.length} page={page} onPage={setPage} />
            </>
          )
        )}

        {/* ── Category view ── */}
        {isCategoryView && (
          categoryResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 24px", background: "#fff", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
              <p style={{ fontSize: 15, color: "var(--mute)", margin: 0 }}>
                No hay recursos en esta categoría todavía. ¡Vuelve pronto!
              </p>
            </div>
          ) : (
            <ResultsGrid items={pageItems} total={categoryResults.length} page={page} onPage={setPage} />
          )
        )}

        {/* ── Default view: destacados + carousel ── */}
        {isDefaultView && (
          <>
            {featured.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <span className="label" style={{ display: "block", marginBottom: 16 }}>// Destacados</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {featured.map(r => <FeaturedCard key={r.id} r={r} />)}
                </div>
              </div>
            )}

            {carouselItems.length > 0 && (
              <div>
                <span className="label" style={{ display: "block", marginBottom: 16 }}>// Todos los recursos</span>
                <HorizontalCarousel recursos={carouselItems} />
              </div>
            )}

            {featured.length === 0 && carouselItems.length === 0 && (
              <div style={{ textAlign: "center", padding: "64px 24px", background: "#fff", border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
                <p style={{ fontSize: 15, color: "var(--mute)", margin: 0 }}>
                  Aún no hay recursos publicados. ¡Vuelve pronto!
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </>
  );
}
