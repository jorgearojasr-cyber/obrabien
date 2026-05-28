"use client";

import { useEffect, useRef } from "react";
import type { Master } from "@/lib/data";
import { LogoMark } from "@/components/LogoMark";

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.556 4.126 1.526 5.858L.057 23.1a.75.75 0 0 0 .914.914l5.242-1.469A11.947 11.947 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.687-.504-5.228-1.386l-.373-.218-3.866 1.083 1.083-3.866-.218-.373A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.68a8.14 8.14 0 0 0 4.77 1.52V6.75a4.85 4.85 0 0 1-1-.06z" />
    </svg>
  );
}
function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}
function VCardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM14 9h4M14 13h4M8 14c-1.5 0-3 .5-3 1.5V16h6v-.5C11 14.5 9.5 14 8 14Z" />
    </svg>
  );
}

const TAPE: React.CSSProperties = {
  height: 14,
  backgroundColor: "#E86C1C",
  backgroundImage: "repeating-linear-gradient(135deg, transparent 0 26px, #14375F 26px 30px)",
  flexShrink: 0,
};

const LINE = "1px solid #DCD9CF";

interface SocialLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

interface Props {
  m: Master;
  bg: string;
  fg: string;
}

export default function ProfessionalCard({ m, bg, fg }: Props) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = `${window.location.origin}/maestro/${m.id}`;
    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvas, url, {
        width: 130,
        margin: 1,
        color: { dark: "#0F2640", light: "#FFFFFF" },
      });
    });
  }, [m.id]);

  const downloadImage = async () => {
    const el = cardRef.current;
    if (!el) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
    const a = document.createElement("a");
    a.download = `tarjeta-${m.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const downloadVCard = () => {
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${m.name}`,
      `TEL;TYPE=CELL:${m.phone}`,
      `TITLE:${m.specialties.join(", ")}`,
      `NOTE:${m.description}`,
      `ADR;TYPE=WORK:;;${m.sector};;;;CL`,
      `URL:${window.location.href}`,
      "END:VCARD",
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${m.name.toLowerCase().replace(/\s+/g, "-")}.vcf`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const socialLinks: SocialLink[] = (
    [
      m.social?.whatsapp
        ? { href: `https://wa.me/${m.social.whatsapp.replace(/\D/g, "")}`, label: "WhatsApp", icon: <WhatsAppIcon />, color: "#25A55A", bg: "rgba(37,165,90,0.07)" }
        : null,
      m.social?.instagram
        ? { href: `https://instagram.com/${m.social.instagram}`, label: "Instagram", icon: <InstagramIcon />, color: "#E1306C", bg: "rgba(225,48,108,0.07)" }
        : null,
      m.social?.facebook
        ? { href: `https://facebook.com/${m.social.facebook}`, label: "Facebook", icon: <FacebookIcon />, color: "#1877F2", bg: "rgba(24,119,242,0.07)" }
        : null,
      m.social?.tiktok
        ? { href: `https://tiktok.com/@${m.social.tiktok}`, label: "TikTok", icon: <TikTokIcon />, color: "#0F2640", bg: "rgba(15,38,64,0.05)" }
        : null,
    ] as (SocialLink | null)[]
  ).filter((x): x is SocialLink => x !== null);

  const cols = socialLinks.length === 1 ? 1 : 2;

  return (
    <div style={{ width: 320 }}>

      {/* ── Card body captured by html2canvas ── */}
      <div
        ref={cardRef}
        style={{
          width: 320,
          background: "#fff",
          border: "1.5px solid #0F2640",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top tape */}
        <div style={TAPE} />

        {/* Header — navy */}
        <div style={{
          background: "#14375F",
          padding: "13px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <LogoMark size={30} navy="#fff" orange="#E86C1C" />
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 17, letterSpacing: "-0.02em" }}>
                <span style={{ color: "#fff" }}>OBRA</span>
                <span style={{ color: "#E86C1C" }}>BIEN</span>
              </div>
              <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.45)", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 3 }}>
                Maestros confiables
              </div>
            </div>
          </div>
          {m.verified && (
            <span style={{
              background: "#E86C1C", color: "#fff",
              padding: "3px 8px",
              fontSize: 9, fontFamily: "JetBrains Mono, monospace",
              textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700,
              whiteSpace: "nowrap",
            }}>
              ✓ Verificado
            </span>
          )}
        </div>

        {/* Avatar + identity */}
        <div style={{ padding: "22px 20px 18px", textAlign: "center", borderBottom: LINE }}>
          {/* Circular avatar */}
          <div style={{
            width: 86, height: 86,
            borderRadius: "50%",
            background: bg, color: fg,
            display: "grid", placeItems: "center",
            fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 27,
            border: "3px solid #fff",
            outline: "1.5px solid #0F2640",
            margin: "0 auto 14px",
          }}>
            {m.initials}
          </div>

          {/* Full name */}
          <div style={{
            fontFamily: "Archivo, sans-serif", fontWeight: 800,
            fontSize: 19, color: "#0F2640",
            letterSpacing: "-0.02em", lineHeight: 1.15,
            marginBottom: 10,
          }}>
            {m.name}
          </div>

          {/* Specialty chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginBottom: 10 }}>
            {m.specialties.map(sp => (
              <span key={sp} style={{
                background: "#E86C1C", color: "#fff",
                padding: "3px 10px", fontSize: 11.5, fontWeight: 600,
              }}>
                {sp}
              </span>
            ))}
          </div>

          {/* City */}
          <div style={{
            fontSize: 12.5, color: "#6B7C8F",
            display: "inline-flex", alignItems: "center", gap: 4,
            marginBottom: m.quote ? 14 : 0,
          }}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#6B7C8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" />
            </svg>
            {m.city}
          </div>

          {/* Quote */}
          {m.quote && (
            <div style={{
              fontSize: 12.5, color: "#2D4258",
              lineHeight: 1.6, fontStyle: "italic",
              padding: "12px 4px 0",
              textAlign: "center",
            }}>
              &ldquo;{m.quote}&rdquo;
            </div>
          )}
        </div>

        {/* Social buttons */}
        {socialLinks.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            borderBottom: LINE,
          }}>
            {socialLinks.map((s, i) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "12px 8px",
                  background: s.bg, color: s.color,
                  fontWeight: 700, fontSize: 12.5,
                  textDecoration: "none",
                  borderRight: cols === 2 && i % 2 === 0 ? LINE : "none",
                  borderBottom: cols === 2 && i < socialLinks.length - 2 ? LINE : "none",
                }}
              >
                {s.icon} {s.label}
              </a>
            ))}
          </div>
        )}

        {/* QR code */}
        <div style={{ padding: "18px 20px 0", textAlign: "center" }}>
          <canvas ref={qrRef} style={{ background: "#fff", display: "block", margin: "0 auto" }} />
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 9.5, color: "#9AA7B5",
            letterSpacing: "0.07em", textTransform: "uppercase",
            marginTop: 6, marginBottom: 16,
          }}>
            Escanea · ver perfil completo
          </div>
        </div>

        {/* Bottom tape */}
        <div style={TAPE} />
      </div>

      {/* Download buttons — outside cardRef */}
      <div style={{ display: "flex", marginTop: 8 }}>
        <button
          onClick={downloadImage}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "11px 8px",
            border: "1.5px solid #0F2640", borderRight: "none",
            background: "#0F2640", color: "#fff",
            fontSize: 12.5, fontWeight: 700, cursor: "pointer",
          }}
        >
          <DownloadIcon /> Guardar imagen
        </button>
        <button
          onClick={downloadVCard}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "11px 8px",
            border: "1.5px solid #0F2640",
            background: "#fff", color: "#0F2640",
            fontSize: 12.5, fontWeight: 700, cursor: "pointer",
          }}
        >
          <VCardIcon /> Guardar contacto
        </button>
      </div>
    </div>
  );
}
