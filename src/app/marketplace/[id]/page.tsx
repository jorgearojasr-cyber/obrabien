"use client";

import { use, useState, useRef } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListing, LISTINGS, TYPE_CONFIG, PLAN_CONFIG, formatPrice } from "@/lib/marketplace";

function BackIcon()      { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>; }
function LocationIcon()  { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>; }
function CalendarIcon()  { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>; }
function CheckIcon()     { return <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>; }
function WhatsAppIconLg(){ return <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.35C8.45 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>; }

function formatPhone(wa: string): string {
  const d = wa.replace(/\D/g, "");
  if (d.length >= 11) return `+${d.slice(0, 2)} ${d[2]} ${d.slice(3, 7)} ${d.slice(7)}`;
  return `+${d}`;
}

const TOTAL_SLIDES = 4;

export default function MarketplaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const listing = getListing(id);
  if (!listing) notFound();

  const [showPhone,   setShowPhone]   = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const typeCfg = TYPE_CONFIG[listing.type];
  const planCfg = PLAN_CONFIG[listing.plan];
  const whatsappUrl = `https://wa.me/${listing.seller.whatsapp}?text=${encodeURIComponent(`Hola, vi tu publicación "${listing.title}" en ObrabiEN y me interesa. ¿Podemos hablar?`)}`;
  const related = LISTINGS.filter(l => l.id !== listing.id && (l.type === listing.type || l.category === listing.category)).slice(0, 4);
  const roleLabel: Record<string, string> = { maestro: "Maestro", cliente: "Cliente", empresa: "Empresa" };
  const avatarBg = listing.seller.role === "maestro" ? "#E86C1C" : "#14375F";

  function handleGalleryScroll() {
    if (!galleryRef.current) return;
    const { scrollLeft, clientWidth } = galleryRef.current;
    setActiveSlide(Math.round(scrollLeft / clientWidth));
  }

  /* Reusable seller block (rendered in both mobile and desktop columns) */
  const sellerBlock = (
    <>
      <span className="label" style={{ display: "block", marginBottom: 14 }}>// Vendedor / Prestador</span>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, background: avatarBg, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0, fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 14 }}>
          {listing.seller.initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{listing.seller.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
            <span style={{
              padding: "1px 7px",
              background: listing.seller.role === "empresa" ? "rgba(20,55,95,0.08)" : listing.seller.role === "maestro" ? "rgba(232,108,28,0.12)" : "rgba(20,55,95,0.07)",
              color: listing.seller.role === "maestro" ? "#E86C1C" : "#14375F",
              fontSize: 9.5, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase" as const, letterSpacing: "0.07em",
            }}>
              {roleLabel[listing.seller.role]}
            </span>
            {listing.seller.verified && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 7px", background: "rgba(37,165,90,0.12)", color: "#1a8c4a", fontSize: 9.5, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>
                <CheckIcon /> Verificado
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="col gap-8">
        {(["Responde por WhatsApp", "Publicación verificada por ObrabiEN", listing.type === "arriendo" ? "Incluye condiciones de arriendo" : null] as (string | null)[])
          .filter(Boolean).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-soft)" }}>
              <span style={{ color: "#25a55a", flexShrink: 0 }}><CheckIcon /></span>
              {item}
            </div>
          ))}
      </div>
    </>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "70vh" }}>

      {/* Back bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "12px 0" }}>
        <div className="wrap">
          <Link href="/marketplace" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mute)", textDecoration: "none", fontWeight: 500 }}>
            <BackIcon /> Volver al marketplace
          </Link>
        </div>
      </div>

      {/* ───────────────── MOBILE LAYOUT ───────────────── */}
      <div className="mobile-only" style={{ paddingBottom: 48 }}>

        {/* 1. Gallery carousel — full bleed */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div ref={galleryRef} className="carousel-scroll" onScroll={handleGalleryScroll}>
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <div key={i} className="photo-ph" style={{ minWidth: "100%", aspectRatio: "4/3", flexShrink: 0, scrollSnapAlign: "start" }}>
                <div className="ph-label" style={{ fontSize: 11 }}>📷 Foto {i + 1} de {TOTAL_SLIDES}</div>
              </div>
            ))}
          </div>
          {/* Dot indicators */}
          <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6, pointerEvents: "none" }}>
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <div key={i} style={{
                height: 6, borderRadius: 3, transition: "width .2s, background .2s",
                width: i === activeSlide ? 20 : 6,
                background: i === activeSlide ? "#fff" : "rgba(255,255,255,0.5)",
              }} />
            ))}
          </div>
        </div>

        <div className="wrap" style={{ paddingTop: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* 2. Title / price / meta */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "18px 18px 16px" }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ padding: "3px 8px", background: typeCfg.bg, color: typeCfg.color, fontSize: 10, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em" }}>
                  {typeCfg.label}
                </span>
                <span style={{ padding: "3px 8px", background: "var(--bg-2)", color: "var(--mute)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}>
                  {listing.category}
                </span>
                {listing.featured && (
                  <span style={{ padding: "3px 8px", background: "var(--orange)", color: "#fff", fontSize: 10, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>★ DESTACADO</span>
                )}
                {listing.plan === "pro" && (
                  <span style={{ padding: "3px 8px", background: planCfg.bg, color: planCfg.color, fontSize: 10, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>PRO</span>
                )}
              </div>
              <h1 style={{ fontFamily: "Archivo, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--ink)", margin: "0 0 10px", lineHeight: 1.25 }}>
                {listing.title}
              </h1>
              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 28, color: listing.price ? "var(--orange)" : "var(--navy)", letterSpacing: "-0.02em", marginBottom: 10 }}>
                {formatPrice(listing)}
              </div>
              {listing.type === "arriendo" && listing.price && (
                <p style={{ fontSize: 12, color: "var(--mute)", margin: "0 0 8px" }}>Por {listing.priceUnit} · Consulta disponibilidad</p>
              )}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: "var(--mute)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><LocationIcon /> {listing.ciudad}, {listing.region}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><CalendarIcon /> {listing.publishedAt}</span>
              </div>
            </div>

            {/* 3. CTA buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "17px 16px", background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 17, textDecoration: "none" }}>
                <WhatsAppIconLg /> Contactar por WhatsApp
              </a>
              <button type="button" onClick={() => setShowPhone(s => !s)}
                style={{ padding: "14px 16px", background: "#fff", border: "2px solid var(--navy)", color: "var(--navy)", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}>
                📞 {showPhone ? formatPhone(listing.seller.whatsapp) : "Ver teléfono"}
              </button>
            </div>

            {/* 4. Description */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "18px 18px 16px" }}>
              <span className="label" style={{ display: "block", marginBottom: 12 }}>// Descripción</span>
              <div style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.75 }}>
                {listing.description.split("\n\n").map((para, i) => (
                  <p key={i} style={{ margin: "0 0 12px" }}>{para}</p>
                ))}
              </div>
              {listing.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                  {listing.tags.map(tag => (
                    <span key={tag} style={{ padding: "3px 10px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--mute)", fontSize: 12 }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Seller card */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "18px 18px 16px" }}>
              {sellerBlock}
            </div>

            {/* 6. Disclaimer */}
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", padding: "12px 14px" }}>
              <p style={{ fontSize: 12, color: "var(--mute)", margin: 0, lineHeight: 1.55 }}>
                ObrabiEN conecta compradores y vendedores, pero no interviene en transacciones ni garantiza los productos. Verifica siempre antes de pagar.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ───────────────── DESKTOP LAYOUT ───────────────── */}
      <div className="desktop-only" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr min(340px, 100%)", gap: 28, alignItems: "start" }}>

          {/* LEFT */}
          <div className="col gap-20">

            {/* Gallery */}
            <div style={{ background: "#fff", border: "1px solid var(--line)" }}>
              <div className="photo-ph" style={{ aspectRatio: "16/9", borderBottom: "1px solid var(--line)" }}>
                <div className="ph-label" style={{ fontSize: 12 }}>📷 Foto principal</div>
              </div>
              <div style={{ display: "flex", gap: 8, padding: 12, overflowX: "auto" }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="photo-ph" style={{ width: 80, height: 60, flexShrink: 0, opacity: i === 1 ? 1 : 0.5 }} />
                ))}
                <div style={{ width: 80, height: 60, flexShrink: 0, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--mute)", border: "1px dashed var(--line)" }}>
                  + fotos
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "22px 24px" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <span style={{ padding: "3px 10px", background: typeCfg.bg, color: typeCfg.color, fontSize: 10.5, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em" }}>{typeCfg.label}</span>
                <span style={{ padding: "3px 10px", background: "var(--bg-2)", color: "var(--mute)", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}>{listing.category}</span>
                {listing.featured && (
                  <span style={{ padding: "3px 10px", background: "var(--orange)", color: "#fff", fontSize: 10.5, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em" }}>★ DESTACADO</span>
                )}
                {listing.plan === "pro" && (
                  <span style={{ padding: "3px 10px", background: planCfg.bg, color: planCfg.color, fontSize: 10.5, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em" }}>PRO</span>
                )}
              </div>

              <h1 style={{ fontFamily: "Archivo, sans-serif", fontSize: "clamp(20px,2.8vw,26px)", fontWeight: 800, color: "var(--ink)", margin: "0 0 18px", lineHeight: 1.25 }}>
                {listing.title}
              </h1>

              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 28, color: listing.price ? "var(--orange)" : "var(--navy)", letterSpacing: "-0.02em", marginBottom: 18 }}>
                {formatPrice(listing)}
              </div>

              <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 13.5, color: "var(--mute)", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--line)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><LocationIcon /> {listing.ciudad}, {listing.region}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><CalendarIcon /> {listing.publishedAt}</span>
              </div>

              <span className="label" style={{ display: "block", marginBottom: 12 }}>// Descripción</span>
              <div style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.75 }}>
                {listing.description.split("\n\n").map((para, i) => (
                  <p key={i} style={{ margin: "0 0 14px" }}>{para}</p>
                ))}
              </div>

              {listing.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {listing.tags.map(tag => (
                    <span key={tag} style={{ padding: "3px 10px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--mute)", fontSize: 12 }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="col gap-16" style={{ position: "sticky", top: 88 }}>

            {/* Price + CTA */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 22px" }}>
              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 30, color: listing.price ? "var(--orange)" : "var(--navy)", letterSpacing: "-0.02em", marginBottom: 6 }}>
                {formatPrice(listing)}
              </div>
              {listing.type === "arriendo" && listing.price && (
                <p style={{ fontSize: 12.5, color: "var(--mute)", margin: "0 0 16px" }}>Precio por {listing.priceUnit}. Consulta disponibilidad.</p>
              )}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "14px", background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 16, textDecoration: "none", marginBottom: 10 }}>
                <WhatsAppIconLg /> Contactar por WhatsApp
              </a>
              <button type="button" onClick={() => setShowPhone(s => !s)}
                style={{ width: "100%", padding: "11px", background: "#fff", border: "2px solid var(--navy)", color: "var(--navy)", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 }}>
                📞 {showPhone ? formatPhone(listing.seller.whatsapp) : "Ver teléfono"}
              </button>
              <p style={{ fontSize: 12, color: "var(--mute)", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
                Se abrirá WhatsApp con un mensaje preparado para el vendedor.
              </p>
            </div>

            {/* Seller */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "18px 20px" }}>
              {sellerBlock}
            </div>

            {/* Disclaimer */}
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", padding: "12px 14px" }}>
              <p style={{ fontSize: 12, color: "var(--mute)", margin: 0, lineHeight: 1.55 }}>
                ObrabiEN conecta compradores y vendedores, pero no interviene en transacciones ni garantiza los productos. Verifica siempre antes de pagar.
              </p>
            </div>
          </div>
        </div>

        {/* Related listings */}
        {related.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <span className="label" style={{ display: "block", marginBottom: 16 }}>// Publicaciones relacionadas</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {related.map(l => {
                const tc = TYPE_CONFIG[l.type];
                return (
                  <Link key={l.id} href={`/marketplace/${l.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: "#fff", border: "1px solid var(--line)", overflow: "hidden", transition: "border-color .15s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--orange)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--line)"}>
                      <div className="photo-ph" style={{ height: 90 }}>
                        <div className="ph-label" style={{ fontSize: 10 }}>📷</div>
                      </div>
                      <div style={{ padding: "12px 14px" }}>
                        <span style={{ padding: "2px 7px", background: tc.bg, color: tc.color, fontSize: 9.5, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.07em" }}>{tc.label}</span>
                        <h4 style={{ fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--ink)", margin: "8px 0 6px", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {l.title}
                        </h4>
                        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 16, color: l.price ? "var(--orange)" : "var(--navy)" }}>
                          {formatPrice(l)}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Related listings — mobile (below the mobile layout section) */}
      {related.length > 0 && (
        <div className="mobile-only wrap" style={{ paddingBottom: 48 }}>
          <span className="label" style={{ display: "block", marginBottom: 14 }}>// Publicaciones relacionadas</span>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
            {related.map(l => {
              const tc = TYPE_CONFIG[l.type];
              return (
                <Link key={l.id} href={`/marketplace/${l.id}`} style={{ textDecoration: "none", flexShrink: 0, width: 200 }}>
                  <div style={{ background: "#fff", border: "1px solid var(--line)", overflow: "hidden" }}>
                    <div className="photo-ph" style={{ height: 80 }}>
                      <div className="ph-label" style={{ fontSize: 10 }}>📷</div>
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <span style={{ padding: "2px 6px", background: tc.bg, color: tc.color, fontSize: 9, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>{tc.label}</span>
                      <h4 style={{ fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--ink)", margin: "7px 0 5px", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {l.title}
                      </h4>
                      <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 15, color: l.price ? "var(--orange)" : "var(--navy)" }}>
                        {formatPrice(l)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
