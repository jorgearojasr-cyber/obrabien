"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { LISTINGS, TYPE_CONFIG, PLAN_CONFIG, CAT_MAP, formatPrice, rowToListing, type MarketplaceListing, type ListingType } from "@/lib/marketplace";
import { REGIONS } from "@/lib/data";

/* ── Icons ──────────────────────────────────────────────────────────────── */
function PlusIcon()      { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>; }
function LocationIcon()  { return <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>; }
function CalendarIcon()  { return <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>; }
function FilterIcon()    { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>; }
function WhatsAppIcon()  { return <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>; }

const TABS: { id: "todos" | ListingType; label: string }[] = [
  { id: "todos",    label: "Todos" },
  { id: "venta",    label: "Venta" },
  { id: "arriendo", label: "Arriendo" },
  { id: "servicio", label: "Servicios" },
];

/* ── Listing card ───────────────────────────────────────────────────────── */
function ListingCard({ listing }: { listing: MarketplaceListing }) {
  const typeCfg = TYPE_CONFIG[listing.type];
  const planCfg = PLAN_CONFIG[listing.plan];
  const isService = listing.type === "servicio";

  return (
    <div style={{
      background: "#fff", border: `1px solid ${listing.featured ? "var(--orange)" : "var(--line)"}`,
      display: "flex", flexDirection: "column", overflow: "hidden",
      transition: "border-color .15s, box-shadow .15s",
      position: "relative",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
    >
      {/* Photo */}
      {listing.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={listing.photoUrl} alt={listing.title}
          style={{ height: 130, width: "100%", objectFit: "cover", flexShrink: 0, display: "block" }} />
      ) : (
        <div className="photo-ph" style={{ height: 130, flexShrink: 0 }}>
          <div className="ph-label">{isService ? "🛠 Servicio" : "📷 Foto del producto"}</div>
        </div>
      )}

      {/* Badges overlay */}
      <div style={{
        position: "absolute", top: 10, left: 10,
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        <span style={{
          padding: "3px 8px", background: typeCfg.bg, color: typeCfg.color,
          fontSize: 10, fontWeight: 800, fontFamily: "JetBrains Mono, monospace",
          letterSpacing: "0.08em",
        }}>
          {typeCfg.label}
        </span>
        {listing.featured && (
          <span style={{
            padding: "3px 8px", background: "var(--orange)", color: "#fff",
            fontSize: 10, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em",
          }}>
            ★ DESTACADO
          </span>
        )}
        {listing.plan === "gratis" && (
          <span style={{
            padding: "3px 8px", background: planCfg.bg, color: planCfg.color,
            fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.07em",
          }}>
            GRATIS
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 12, color: "var(--mute)", margin: 0 }}>{listing.category}</p>
        <h3 style={{
          fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: 15,
          color: "var(--ink)", margin: 0, lineHeight: 1.3,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {listing.title}
        </h3>

        {/* Price */}
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 20, color: listing.price ? "var(--orange)" : "var(--navy)", letterSpacing: "-0.02em" }}>
          {formatPrice(listing)}
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--mute)", marginTop: "auto", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <LocationIcon /> {listing.ciudad}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CalendarIcon /> {listing.publishedAt}
          </span>
          {(listing.consultaCount ?? 0) > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--navy)", fontWeight: 600 }}>
              💬 {listing.consultaCount}
            </span>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
        <Link href={`/marketplace/${listing.id}`}
          style={{
            flex: 1, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            border: "1.5px solid var(--ink)", background: "var(--ink)", color: "#fff",
            fontSize: 12.5, fontWeight: 600, textDecoration: "none",
          }}>
          Ver más
        </Link>
        <a
          href={`https://wa.me/${listing.seller.whatsapp}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            flex: 1, height: 36, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            border: "1.5px solid #25D366", background: "#25D366", color: "#fff",
            fontSize: 12.5, fontWeight: 600, textDecoration: "none",
          }}>
          <WhatsAppIcon /> WhatsApp
        </a>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function MarketplacePage() {
  const [tab,      setTab]      = useState<"todos" | ListingType>("todos");
  const [category, setCategory] = useState("todas");
  const [region,   setRegion]   = useState("todas");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [dbListings, setDbListings] = useState<MarketplaceListing[]>([]);
  useEffect(() => {
    fetch("/api/marketplace/listings")
      .then(r => r.json())
      .then((d: { items?: Record<string, unknown>[] }) =>
        setDbListings((d.items ?? []).map(rowToListing))
      )
      .catch(() => {});
  }, []);

  // Combine: real DB listings first, then static demos
  const allListings = useMemo(() =>
    dbListings.length > 0 ? dbListings : LISTINGS,
  [dbListings]);

  const cats = tab === "todos" ? [] : CAT_MAP[tab] ?? [];

  const filtered = useMemo(() => {
    return allListings.filter(l => {
      if (tab !== "todos" && l.type !== tab) return false;
      if (category !== "todas" && l.category !== category) return false;
      if (region !== "todas" && l.region !== region) return false;
      if (priceMin && l.price !== null && l.price < Number(priceMin)) return false;
      if (priceMax && l.price !== null && l.price > Number(priceMax)) return false;
      return true;
    }).sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [allListings, tab, category, region, priceMin, priceMax]);

  const stats = {
    venta:    allListings.filter(l => l.type === "venta").length,
    arriendo: allListings.filter(l => l.type === "arriendo").length,
    servicio: allListings.filter(l => l.type === "servicio").length,
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "70vh", overflowX: "hidden" }}>

      {/* ── Hero ── */}
      <div style={{ background: "var(--navy)", color: "#fff", padding: "48px 0 40px" }}>
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <div>
              <span className="label" style={{ color: "rgba(255,255,255,0.5)", marginBottom: 10, display: "block" }}>// Marketplace</span>
              <h1 style={{ color: "#fff", fontSize: "clamp(26px,4vw,40px)", margin: "0 0 10px" }}>
                Marketplace ObraBien
              </h1>
              <p style={{ color: "rgba(255,255,255,0.65)", margin: 0, fontSize: 15.5, maxWidth: 500 }}>
                Compra, vende y arrienda en el rubro de la construcción. Herramientas, materiales, equipos y servicios.
              </p>
            </div>
            <Link href="/marketplace/publicar"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 22px", background: "var(--orange)", color: "#fff",
                fontWeight: 700, fontSize: 15, textDecoration: "none", flexShrink: 0,
              }}>
              <PlusIcon /> Publicar gratis
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 28, marginTop: 32, flexWrap: "wrap" }}>
            {[
              { label: "En venta",   value: stats.venta,    color: "#25a55a" },
              { label: "En arriendo",value: stats.arriendo,  color: "rgba(255,255,255,0.7)" },
              { label: "Servicios",  value: stats.servicio,  color: "#a78bfa" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.03em", color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tape" />

      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 64 }}>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--line)", marginBottom: 24, overflowX: "auto", scrollbarWidth: "none" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setCategory("todas"); }}
              style={{
                padding: "10px 22px", border: "none", background: "transparent",
                fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: 14.5,
                color: tab === t.id ? "var(--orange)" : "var(--mute)",
                borderBottom: `2px solid ${tab === t.id ? "var(--orange)" : "transparent"}`,
                marginBottom: -2, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "color .15s",
              }}>
              {t.label}
              {t.id !== "todos" && (
                <span style={{
                  marginLeft: 6, fontSize: 11, fontFamily: "JetBrains Mono, monospace",
                  color: tab === t.id ? "var(--orange)" : "var(--mute-2)",
                }}>
                  ({LISTINGS.filter(l => l.type === t.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Filters ── */}
        <div style={{
          background: "#fff", border: "1px solid var(--line)", padding: "14px 18px",
          marginBottom: 24,
        }}>
          {/* Mobile toggle */}
          <button className="mobile-only" onClick={() => setShowFilters(!showFilters)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              background: "none", border: "none", fontWeight: 600, fontSize: 14,
              color: "var(--ink)", cursor: "pointer",
            }}>
            <FilterIcon /> Filtros {showFilters ? "▲" : "▼"}
          </button>

          <div className="desktop-only" style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <FilterRow cats={cats} category={category} setCategory={setCategory} region={region} setRegion={setRegion} priceMin={priceMin} setPriceMin={setPriceMin} priceMax={priceMax} setPriceMax={setPriceMax} />
          </div>

          {showFilters && (
            <div className="mobile-only" style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <FilterRow cats={cats} category={category} setCategory={setCategory} region={region} setRegion={setRegion} priceMin={priceMin} setPriceMin={setPriceMin} priceMax={priceMax} setPriceMax={setPriceMax} />
            </div>
          )}
        </div>

        {/* ── Results header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 13.5, color: "var(--mute)" }}>
            <strong style={{ color: "var(--ink)" }}>{filtered.length}</strong> publicaciones encontradas
          </span>
          {(category !== "todas" || region !== "todas" || priceMin || priceMax) && (
            <button onClick={() => { setCategory("todas"); setRegion("todas"); setPriceMin(""); setPriceMax(""); }}
              style={{ background: "none", border: "none", color: "var(--orange)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Limpiar filtros ×
            </button>
          )}
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 0", color: "var(--mute)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 15, margin: "0 0 16px" }}>No hay publicaciones con esos filtros.</p>
            <Link href="/marketplace/publicar" style={{ color: "var(--orange)", fontWeight: 700 }}>
              ¿Quieres publicar algo?
            </Link>
          </div>
        ) : (
          <div className="mkp-cards-grid">
            {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}

        {/* ── CTA Publicar ── */}
        <div style={{
          marginTop: 56, background: "var(--navy)", padding: "32px 36px",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap",
        }}>
          <div>
            <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 6 }}>
              ¿Tienes algo para vender, arrendar o un servicio que ofrecer?
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: 0 }}>
              La primera publicación es siempre gratis. Sin comisiones.
            </p>
          </div>
          <Link href="/marketplace/publicar"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 26px", background: "var(--orange)", color: "#fff",
              fontWeight: 700, fontSize: 15, textDecoration: "none", flexShrink: 0,
            }}>
            <PlusIcon /> Publicar gratis ahora
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Filter controls (shared desktop/mobile) ────────────────────────────── */
function FilterRow({ cats, category, setCategory, region, setRegion, priceMin, setPriceMin, priceMax, setPriceMax }: {
  cats: string[]; category: string; setCategory: (v: string) => void;
  region: string; setRegion: (v: string) => void;
  priceMin: string; setPriceMin: (v: string) => void;
  priceMax: string; setPriceMax: (v: string) => void;
}) {
  return (
    <>
      {cats.length > 0 && (
        <div className="field" style={{ flex: "1 1 180px", marginBottom: 0 }}>
          <label>Categoría</label>
          <select className="ob-select" value={category} onChange={e => setCategory(e.target.value)} style={{ height: 40, marginTop: 4 }}>
            <option value="todas">Todas las categorías</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}
      <div className="field" style={{ flex: "1 1 180px", marginBottom: 0 }}>
        <label>Región</label>
        <select className="ob-select" value={region} onChange={e => setRegion(e.target.value)} style={{ height: 40, marginTop: 4 }}>
          <option value="todas">Todas las regiones</option>
          {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
        </select>
      </div>
      <div className="field" style={{ flex: "0 1 130px", marginBottom: 0 }}>
        <label>Precio mín.</label>
        <input className="ob-input" type="number" placeholder="$0" value={priceMin} onChange={e => setPriceMin(e.target.value)} style={{ height: 40, marginTop: 4 }} />
      </div>
      <div className="field" style={{ flex: "0 1 130px", marginBottom: 0 }}>
        <label>Precio máx.</label>
        <input className="ob-input" type="number" placeholder="Sin límite" value={priceMax} onChange={e => setPriceMax(e.target.value)} style={{ height: 40, marginTop: 4 }} />
      </div>
    </>
  );
}
