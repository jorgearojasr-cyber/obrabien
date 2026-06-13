"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListing, rowToListing, LISTINGS, TYPE_CONFIG, PLAN_CONFIG, formatPrice, type MarketplaceListing } from "@/lib/marketplace";
import { ConsultasSection } from "./ConsultasSection";

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

function PhotoCarousel({ urls, alt, style }: { urls: string[]; alt: string; style?: React.CSSProperties }) {
  const [idx, setIdx] = useState(0);
  const n = urls.length;

  if (n === 0) {
    return (
      <div className="photo-ph" style={style}>
        <div className="ph-label" style={{ fontSize: 12 }}>📷 Sin foto</div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", ...style }}>
      {/* Main image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={urls[idx]} alt={`${alt} ${idx + 1}`}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

      {/* Arrows */}
      {n > 1 && (
        <>
          <button type="button" onClick={() => setIdx(i => (i - 1 + n) % n)}
            style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.45)", color: "#fff", border: "none", cursor: "pointer", fontSize: 16, display: "grid", placeItems: "center", lineHeight: 1 }}>
            ‹
          </button>
          <button type="button" onClick={() => setIdx(i => (i + 1) % n)}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.45)", color: "#fff", border: "none", cursor: "pointer", fontSize: 16, display: "grid", placeItems: "center", lineHeight: 1 }}>
            ›
          </button>
        </>
      )}

      {/* Dots */}
      {n > 1 && (
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
          {urls.map((_, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)}
              style={{ width: i === idx ? 18 : 8, height: 8, borderRadius: 4, background: i === idx ? "#fff" : "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", padding: 0, transition: "width .2s" }} />
          ))}
        </div>
      )}

      {/* Counter badge */}
      {n > 1 && (
        <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, fontFamily: "JetBrains Mono, monospace", padding: "2px 7px", borderRadius: 3 }}>
          {idx + 1}/{n}
        </div>
      )}
    </div>
  );
}

export default function MarketplaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [listing,       setListing]       = useState<MarketplaceListing | null>(() => getListing(id) ?? null);
  const [status,        setStatus]        = useState<"ok" | "loading" | "notfound">(() => getListing(id) ? "ok" : "loading");
  const [sellerClerkId, setSellerClerkId] = useState<string | null>(null);
  const [showPhone,     setShowPhone]     = useState(false);
  const [fotosUrls,     setFotosUrls]     = useState<string[]>([]);

  useEffect(() => {
    if (status !== "loading") return;
    fetch(`/api/marketplace/item?id=${encodeURIComponent(id)}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: { item?: Record<string, unknown> }) => {
        if (!d.item) { setStatus("notfound"); return; }
        const mapped = rowToListing(d.item);
        setListing(mapped);
        setSellerClerkId((d.item.clerk_user_id as string) || null);
        const allUrls = mapped.fotosUrls?.length
          ? mapped.fotosUrls
          : mapped.photoUrl ? [mapped.photoUrl] : [];
        setFotosUrls(allUrls);
        setStatus("ok");
      })
      .catch(() => setStatus("notfound"));
  }, [id, status]);

  if (status === "loading") {
    return (
      <div style={{ background: "var(--bg)", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--mute)", fontSize: 14 }}>Cargando…</span>
      </div>
    );
  }

  if (status === "notfound" || !listing) notFound();

  // For static listings (no DB fetch), derive fotosUrls from photoUrl
  const displayFotos = fotosUrls.length > 0
    ? fotosUrls
    : listing.photoUrl ? [listing.photoUrl] : [];

  const typeCfg = TYPE_CONFIG[listing.type];
  const planCfg = PLAN_CONFIG[listing.plan];
  const whatsappUrl = `https://wa.me/${listing.seller.whatsapp}?text=${encodeURIComponent(`Hola, vi tu publicación "${listing.title}" en ObraBien y me interesa. ¿Podemos hablar?`)}`;
  const related = LISTINGS.filter(l => l.id !== listing.id && (l.type === listing.type || l.category === listing.category)).slice(0, 4);
  const roleLabel: Record<string, string> = { maestro: "Maestro", cliente: "Cliente", empresa: "Empresa" };
  const avatarBg = listing.seller.role === "maestro" ? "#E86C1C" : "#14375F";

  const sellerBlock = (
    <>
      <span className="label" style={{ display: "block", marginBottom: 14 }}>// Vendedor / Prestador</span>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, overflow: "hidden", background: avatarBg, display: "grid", placeItems: "center" }}>
          {listing.seller.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.seller.photoUrl} alt={listing.seller.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ color: "#fff", fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 14 }}>
              {listing.seller.initials}
            </span>
          )}
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
              {roleLabel[listing.seller.role] ?? "Usuario"}
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
        {(["Responde por WhatsApp", "Publicación verificada por ObraBien", listing.type === "arriendo" ? "Incluye condiciones de arriendo" : null] as (string | null)[])
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

      {/* ─────────────────── MOBILE LAYOUT ─────────────────── */}
      <div className="mobile-only" style={{ paddingBottom: 48 }}>

        {/* Photo */}
        <PhotoCarousel urls={displayFotos} alt={listing.title} style={{ aspectRatio: "4/3", height: "auto" }} />

        <div className="wrap" style={{ paddingTop: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Title / price / meta */}
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
                {(listing.ciudad || listing.region) && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <LocationIcon /> {[listing.ciudad, listing.region].filter(Boolean).join(", ")}
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><CalendarIcon /> {listing.publishedAt}</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "17px 16px", background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 17, textDecoration: "none" }}>
                <WhatsAppIconLg /> Contactar por WhatsApp
              </a>
              {listing.seller.whatsapp && (
                <button type="button" onClick={() => setShowPhone(s => !s)}
                  style={{ padding: "14px 16px", background: "#fff", border: "2px solid var(--navy)", color: "var(--navy)", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}>
                  📞 {showPhone ? formatPhone(listing.seller.whatsapp) : "Ver teléfono"}
                </button>
              )}
            </div>

            {/* Description */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "18px 18px 16px" }}>
              <span className="label" style={{ display: "block", marginBottom: 12 }}>// Descripción</span>
              {listing.description ? (
                <div style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.75 }}>
                  {listing.description.split("\n\n").map((para, i) => (
                    <p key={i} style={{ margin: "0 0 12px" }}>{para}</p>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--mute)", fontSize: 14, margin: 0 }}>Sin descripción adicional.</p>
              )}
              {listing.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                  {listing.tags.map(tag => (
                    <span key={tag} style={{ padding: "3px 10px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--mute)", fontSize: 12 }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Seller card */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "18px 18px 16px" }}>
              {sellerBlock}
            </div>

            {/* Consultas */}
            <ConsultasSection itemId={listing.id} sellerName={listing.seller.name} sellerClerkId={sellerClerkId} />

            {/* Disclaimer */}
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", padding: "12px 14px" }}>
              <p style={{ fontSize: 12, color: "var(--mute)", margin: 0, lineHeight: 1.55 }}>
                ObraBien conecta compradores y vendedores, pero no interviene en transacciones ni garantiza los productos. Verifica siempre antes de pagar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────── DESKTOP LAYOUT ─────────────────── */}
      <div className="desktop-only" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr min(340px, 100%)", gap: 28, alignItems: "start" }}>

          {/* LEFT */}
          <div className="col gap-20">

            {/* Photo */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", overflow: "hidden" }}>
              <PhotoCarousel
                urls={displayFotos}
                alt={listing.title}
                style={{ aspectRatio: "16/9", height: "auto" }}
              />
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
                {(listing.ciudad || listing.region) && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <LocationIcon /> {[listing.ciudad, listing.region].filter(Boolean).join(", ")}
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><CalendarIcon /> {listing.publishedAt}</span>
              </div>

              <span className="label" style={{ display: "block", marginBottom: 12 }}>// Descripción</span>
              {listing.description ? (
                <div style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.75 }}>
                  {listing.description.split("\n\n").map((para, i) => (
                    <p key={i} style={{ margin: "0 0 14px" }}>{para}</p>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--mute)", fontSize: 14, margin: 0 }}>Sin descripción adicional.</p>
              )}

              {listing.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {listing.tags.map(tag => (
                    <span key={tag} style={{ padding: "3px 10px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--mute)", fontSize: 12 }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Consultas */}
            <ConsultasSection itemId={listing.id} sellerName={listing.seller.name} sellerClerkId={sellerClerkId} />
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
              {listing.seller.whatsapp && (
                <button type="button" onClick={() => setShowPhone(s => !s)}
                  style={{ width: "100%", padding: "11px", background: "#fff", border: "2px solid var(--navy)", color: "var(--navy)", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 }}>
                  📞 {showPhone ? formatPhone(listing.seller.whatsapp) : "Ver teléfono"}
                </button>
              )}
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
                ObraBien conecta compradores y vendedores, pero no interviene en transacciones ni garantiza los productos. Verifica siempre antes de pagar.
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
                      {l.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.photoUrl} alt={l.title} style={{ height: 90, width: "100%", objectFit: "cover", display: "block" }} />
                      ) : (
                        <div className="photo-ph" style={{ height: 90 }}>
                          <div className="ph-label" style={{ fontSize: 10 }}>📷</div>
                        </div>
                      )}
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

      {/* Related listings — mobile */}
      {related.length > 0 && (
        <div className="mobile-only wrap" style={{ paddingBottom: 48 }}>
          <span className="label" style={{ display: "block", marginBottom: 14 }}>// Publicaciones relacionadas</span>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
            {related.map(l => {
              const tc = TYPE_CONFIG[l.type];
              return (
                <Link key={l.id} href={`/marketplace/${l.id}`} style={{ textDecoration: "none", flexShrink: 0, width: 200 }}>
                  <div style={{ background: "#fff", border: "1px solid var(--line)", overflow: "hidden" }}>
                    {l.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.photoUrl} alt={l.title} style={{ height: 80, width: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div className="photo-ph" style={{ height: 80 }}>
                        <div className="ph-label" style={{ fontSize: 10 }}>📷</div>
                      </div>
                    )}
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

