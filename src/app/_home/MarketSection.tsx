"use client";

import { useState } from "react";
import Link from "next/link";
import { LISTINGS, TYPE_CONFIG, formatPrice, type MarketplaceListing } from "@/lib/marketplace";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function MkpMiniCard({ listing }: { listing: MarketplaceListing }) {
  const tc = TYPE_CONFIG[listing.type];
  return (
    <Link href={`/marketplace/${listing.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#fff", border: `1px solid ${listing.featured ? "var(--orange)" : "var(--line)"}`,
        padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8,
        height: "100%", transition: "box-shadow .15s, border-color .15s",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ padding: "2px 7px", background: tc.bg, color: tc.color, fontSize: 9.5, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.07em", flexShrink: 0 }}>
            {tc.label}
          </span>
          {listing.featured && (
            <span style={{ padding: "2px 7px", background: "var(--orange)", color: "#fff", fontSize: 9.5, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", flexShrink: 0 }}>★</span>
          )}
          <span style={{ fontSize: 11.5, color: "var(--mute)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {listing.category}
          </span>
        </div>
        <h4 style={{ fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: 14.5, color: "var(--ink)", margin: 0, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
          {listing.title}
        </h4>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 19, color: listing.price ? "var(--orange)" : "var(--navy)", letterSpacing: "-0.02em", marginTop: "auto" }}>
          {formatPrice(listing)}
        </div>
        <div style={{ fontSize: 12, color: "var(--mute)" }}>📍 {listing.ciudad}</div>
      </div>
    </Link>
  );
}

export default function MarketSection() {
  const [mkpTab, setMkpTab] = useState<"venta" | "arriendo" | "servicio">("venta");
  const mkpListings = LISTINGS.filter(l => l.type === mkpTab).slice(0, 4);

  return (
    <section className="block" style={{ background: "var(--bg)", borderTop: "1px solid var(--line)" }}>
      <div className="wrap">
        <div className="row between center wrap-flex gap-12" style={{ marginBottom: 28 }}>
          <div>
            <span className="label">// Marketplace</span>
            <h2 className="display" style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, marginTop: 6, color: "var(--navy)" }}>
              Compra, vende y arrienda en el rubro.
            </h2>
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--line)", marginBottom: 24 }}>
          {(["venta", "arriendo", "servicio"] as const).map((tab, i) => {
            const labels = ["Venta", "Arriendo", "Servicios"];
            const active = mkpTab === tab;
            return (
              <button key={tab} onClick={() => setMkpTab(tab)}
                style={{ padding: "10px 22px", border: "none", background: "transparent", fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14.5, color: active ? "var(--orange)" : "var(--mute)", borderBottom: `2px solid ${active ? "var(--orange)" : "transparent"}`, marginBottom: -2, cursor: "pointer", whiteSpace: "nowrap", transition: "color .15s" }}>
                {labels[i]}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))", gap: 14, marginBottom: 28 }}>
          {mkpListings.map(l => <MkpMiniCard key={l.id} listing={l} />)}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/marketplace"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Ver marketplace <ArrowIcon />
          </Link>
          <Link href="/marketplace/publicar"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", background: "var(--orange)", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Publicar gratis
          </Link>
        </div>
      </div>
    </section>
  );
}
