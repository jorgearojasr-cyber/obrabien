"use client";

import { useEffect, useRef, useState } from "react";
import type { Master } from "@/lib/data";
import { LogoMark } from "@/components/LogoMark";

const NAVY = "#1B2B4B";
const ORANGE = "#F97316";
const WA_GREEN = "#25D366";
const VER_GREEN = "#16A34A";
const CARD_BG = "#F8FAFC";
const BORDER = "#E2E8F0";

function getEspecialidadIcon(especialidad: string): string {
  const s = especialidad.toLowerCase();
  if (s.includes("electr")) return "⚡";
  if (s.includes("gasfiter") || s.includes("gasfitería") || s.includes("plomer") || s.includes("cañer")) return "🔧";
  if (s.includes("pintur") || s.includes("enlucid") || s.includes("yeso")) return "🎨";
  if (s.includes("albañil") || s.includes("construct") || s.includes("hormigón")) return "🧱";
  if (s.includes("ventana") || s.includes("vidrio") || s.includes("aluminio")) return "🪟";
  if (s.includes("techumb") || s.includes("techo") || s.includes("zinc")) return "🏠";
  if (s.includes("carpint") || s.includes("madera") || s.includes("mueble")) return "🪵";
  if (s.includes("cerraj") || s.includes("puerta") || s.includes("candado")) return "🔑";
  if (s.includes("jardin") || s.includes("pasto") || s.includes("poda")) return "🌿";
  if (s.includes("solar") || s.includes("panel")) return "☀️";
  if (s.includes("aire") || s.includes("clima") || s.includes("refriger")) return "❄️";
  if (s.includes("soldad") || s.includes("fierr") || s.includes("metal")) return "⚙️";
  if (s.includes("cerami") || s.includes("porcelan") || s.includes("piso") || s.includes("baldos")) return "🔲";
  if (s.includes("cámara") || s.includes("seguridad") || s.includes("alarma")) return "📷";
  if (s.includes("gas ") || s.includes("calefon") || s.includes("caldera")) return "🔥";
  return "🔨";
}

const SPECIALTY_EMOJI: Record<string, string> = {
  "Albañil": "🧱",
  "Gasfiter": "🔧",
  "Electricista": "⚡",
  "Carpintero": "🪵",
  "Pintor": "🎨",
  "Ceramista": "🏺",
  "Soldador": "🔥",
  "Techumbre": "🏠",
  "Yesero": "🏗️",
  "Drywall": "🏗️",
  "Instalación de pisos": "🪟",
  "Instalación de ventanas": "🪟",
  "Instalador de cámaras": "📷",
  "Aire acondicionado": "❄️",
  "Mantención de jardines": "🌿",
  "Excavaciones": "🚜",
  "Paneles solares": "☀️",
  "Maestro multifunción": "🛠️",
};

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.556 4.126 1.526 5.858L.057 23.1a.75.75 0 0 0 .914.914l5.242-1.469A11.947 11.947 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.687-.504-5.228-1.386l-.373-.218-3.866 1.083 1.083-3.866-.218-.373A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function InstagramIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="40%" stopColor="#e6683c" />
          <stop offset="65%" stopColor="#dc2743" />
          <stop offset="85%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.68a8.14 8.14 0 0 0 4.77 1.52V6.75a4.85 4.85 0 0 1-1-.06z" />
    </svg>
  );
}

function FacebookIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function StarFilled({ size = 12 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M12 17.3 5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6L18.2 21z" /></svg>;
}

function StarEmpty({ size = 12 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 17.3 5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6L18.2 21z" /></svg>;
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

interface Props {
  m: Master;
  bg: string;
  fg: string;
  maestroId?: string;
}

export default function ProfessionalCard({ m, maestroId }: Props) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const qrModalRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (!photoOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPhotoOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [photoOpen]);

  useEffect(() => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = `${window.location.origin}/maestro/${m.id}`;
    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvas, url, {
        width: 80,
        margin: 1,
        color: { dark: NAVY, light: "#FFFFFF" },
      });
    });
  }, [m.id]);

  useEffect(() => {
    const canvas = qrModalRef.current;
    if (!canvas || !qrOpen) return;
    const url = `${window.location.origin}/maestro/${m.id}`;
    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvas, url, {
        width: 280,
        margin: 2,
        color: { dark: NAVY, light: "#FFFFFF" },
      });
    });
  }, [m.id, qrOpen]);

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

  const trackWhatsApp = () => {
    if (maestroId) {
      fetch("/api/track-contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maestro_id: maestroId }),
      }).catch(() => {});
    }
  };

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/maestro/${m.id ?? maestroId}` : "";

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Mira el perfil de ${m.name} en ObraBien: ${profileUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setShareOpen(false);
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(profileUrl); } catch { /* ignore */ }
    setToastMsg("¡Enlace copiado!");
    setTimeout(() => setToastMsg(""), 2500);
    setShareOpen(false);
  };

  const captureCard = async () => {
    const el = cardRef.current;
    if (!el) return null;
    el.scrollIntoView({ block: "start", behavior: "instant" });
    await new Promise(r => setTimeout(r, 80));
    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(el, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
      width: el.scrollWidth,
      height: el.scrollHeight,
      windowWidth: el.scrollWidth,
    });
  };

  const slug = m.name.toLowerCase().replace(/\s+/g, "-");

  const downloadPNG = async () => {
    setShareOpen(false);
    const canvas = await captureCard();
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `tarjeta-${slug}-obrabien.png`;
    a.click();
  };

  const downloadPDF = async () => {
    setShareOpen(false);
    const canvas = await captureCard();
    if (!canvas) return;
    const { jsPDF } = await import("jspdf");
    const pdfW = 390;
    const pdfH = Math.round((canvas.height / canvas.width) * pdfW);
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [pdfW, pdfH] });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`tarjeta-${slug}-obrabien.pdf`);
  };

  const showQrLarge = () => {
    setShareOpen(false);
    setQrOpen(true);
  };

  const mainSpecialty = m.specialties[0] ?? "";
  const otherSpecialties = m.specialties.slice(1);
  const specialtyEmoji = SPECIALTY_EMOJI[mainSpecialty] ?? "🛠️";
  // Two-column specialty layout when there is 1+ additional specialty
  const showTwoColSpecialty = otherSpecialties.length >= 1;

  const whatsappUrl = m.social?.whatsapp
    ? `https://wa.me/${m.social.whatsapp.replace(/\D/g, "")}`
    : m.phone
    ? `https://wa.me/${m.phone.replace(/\D/g, "")}`
    : null;

  const otherSocials = [
    m.social?.instagram
      ? { label: "Instagram", icon: <InstagramIcon />, href: `https://instagram.com/${m.social.instagram}`, color: "#E1306C" }
      : null,
    m.social?.facebook
      ? { label: "Facebook", icon: <FacebookIcon />, href: `https://facebook.com/${m.social.facebook}`, color: "#1877F2" }
      : null,
    m.social?.tiktok
      ? { label: "TikTok", icon: <TikTokIcon />, href: `https://tiktok.com/@${m.social.tiktok}`, color: "#010101" }
      : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null);

  const yearsOnPlatform = m.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(m.createdAt).getTime()) / (365.25 * 24 * 3600 * 1000)))
    : m.yearsExp;

  const sep: React.CSSProperties = { borderBottom: `1px solid ${BORDER}` };

  return (<>
    <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 3px rgba(22,163,74,0.25)} 50%{box-shadow:0 0 0 6px rgba(22,163,74,0.10)} }`}</style>
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      height: "auto",
      background: "#F1F5F9",
      borderRadius: 16,
      padding: "12px 0",
    }}>
      <div style={{ width: "100%", maxWidth: 420, fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
        <div ref={cardRef} style={{
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(27,43,75,0.10)",
          border: `1px solid ${BORDER}`,
        }}>

          {/* 1. Header */}
          <div style={{
            background: NAVY,
            padding: "11px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LogoMark size={26} navy="#fff" orange={ORANGE} />
              <div style={{ lineHeight: 1 }}>
                <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 15, letterSpacing: "-0.02em" }}>
                  <span style={{ color: "#fff" }}>OBRA</span>
                  <span style={{ color: ORANGE }}>BIEN</span>
                </div>
                <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>
                  Maestros confiables
                </div>
              </div>
            </div>
            {m.verified && (
              <span style={{
                background: ORANGE, color: "#fff",
                padding: "3px 10px", borderRadius: 20,
                fontSize: 9, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
                textTransform: "uppercase", letterSpacing: "0.07em",
                whiteSpace: "nowrap",
              }}>
                ✓ VERIFICADO
              </span>
            )}
          </div>

          {/* 2. Avatar + Identity — horizontal layout */}
          <div style={{ ...sep, background: CARD_BG, padding: "16px 16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

              {/* LEFT — photo, never shrinks */}
              <div style={{ position: "relative", flexShrink: 0, width: 120, height: 120 }}>
                <div
                  onClick={() => m.photoUrl && setPhotoOpen(true)}
                  title={m.photoUrl ? "Ver foto" : undefined}
                  style={{
                    width: 120, height: 120,
                    borderRadius: "50%",
                    background: m.photoUrl ? "transparent" : ORANGE,
                    color: "#fff",
                    display: "grid", placeItems: "center",
                    fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 36,
                    border: `3px solid ${ORANGE}`,
                    overflow: "hidden",
                    cursor: m.photoUrl ? "pointer" : "default",
                  }}
                >
                  {m.photoUrl
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img src={m.photoUrl} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    : m.initials}
                </div>
                <div style={{
                  position: "absolute", bottom: 2, right: 2,
                  width: 24, height: 24,
                  background: VER_GREEN, borderRadius: "50%",
                  border: "2px solid #fff",
                  display: "grid", placeItems: "center",
                  color: "#fff", fontSize: 11, fontWeight: 800,
                }}>✓</div>
              </div>

              {/* RIGHT — name, phone, location — clipped so nothing overflows */}
              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                {/* Name: up to 2 lines, tight leading */}
                <div style={{
                  fontFamily: "Archivo, sans-serif", fontWeight: 700,
                  fontSize: 16, color: NAVY,
                  letterSpacing: "-0.02em", lineHeight: 1.25,
                  marginBottom: 6,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const,
                  overflow: "hidden",
                }}>
                  {m.name}
                </div>

                {/* Phone */}
                {(() => {
                  const raw = (m.social?.whatsapp || m.phone || "").replace(/\D/g, "");
                  if (!raw) return null;
                  const national = raw.startsWith("56") && raw.length >= 10 ? raw.slice(2) : raw;
                  const tel = `+56${national}`;
                  const display = national.startsWith("9") && national.length === 9
                    ? `+56 ${national[0]} ${national.slice(1, 5)} ${national.slice(5)}`
                    : `+56 ${national}`;
                  return (
                    <a href={`tel:${tel}`} style={{
                      display: "flex", alignItems: "center", gap: 4,
                      color: NAVY, fontSize: 13, fontWeight: 600,
                      textDecoration: "none", marginBottom: 4,
                    }}>
                      <span style={{ fontSize: 13, color: "#E11D48", flexShrink: 0 }}>📞</span>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{display}</span>
                    </a>
                  );
                })()}

                {/* Location — first city only */}
                {m.city && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748B" }}>
                    <span style={{ color: "#E11D48", fontSize: 12, flexShrink: 0 }}>📍</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.city}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Specialty block */}
          {mainSpecialty && (
            <div style={{ ...sep, padding: "10px 12px" }}>
              <div style={{
                background: CARD_BG, borderRadius: 10, padding: "8px 10px",
                border: `1px solid ${BORDER}`,
                display: "flex",
                gap: showTwoColSpecialty ? 12 : 0,
                alignItems: showTwoColSpecialty ? "flex-start" : "center",
                justifyContent: showTwoColSpecialty ? "flex-start" : "center",
                flexDirection: showTwoColSpecialty ? "row" : "column",
                textAlign: showTwoColSpecialty ? "left" : "center",
              }}>
                {/* Main specialty */}
                <div style={{ flex: showTwoColSpecialty ? "0 0 50%" : undefined, display: "flex", flexDirection: "column", alignItems: showTwoColSpecialty ? "flex-start" : "center" }}>
                  <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 4 }}>
                    {specialtyEmoji}
                  </div>
                  <div style={{
                    fontSize: 8, fontFamily: "JetBrains Mono, monospace",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: ORANGE, fontWeight: 700, marginBottom: 3,
                  }}>
                    Especialista en
                  </div>
                  <div style={{
                    fontSize: 15,
                    fontFamily: "Archivo, sans-serif",
                    fontWeight: 800, color: NAVY, lineHeight: 1.2,
                  }}>
                    {mainSpecialty}
                  </div>
                </div>

                {/* Other specialties with emoji per specialty */}
                {showTwoColSpecialty && (
                  <div style={{
                    flex: "0 0 50%", borderLeft: `1px solid ${BORDER}`,
                    paddingLeft: 12, minWidth: 0,
                  }}>
                    <div style={{
                      fontSize: 8, color: "#94A3B8", fontWeight: 700,
                      marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                      También realiza:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {otherSpecialties.map(sp => (
                        <div key={sp} style={{ fontSize: 11.5, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 16, flexShrink: 0 }}>{getEspecialidadIcon(sp)}</span>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Stats row */}
          <div style={{
            ...sep,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            background: "#fff",
          }}>
            {([
              { icon: "📍", iconColor: "#E11D48", value: m.city || "Chile",                                sub: "UBICACIÓN",    valueColor: "#475569" },
              { icon: "🕐", iconColor: "#3B82F6", value: m.yearsExp > 0 ? `${m.yearsExp} años` : "—",    sub: "EXPERIENCIA",  valueColor: "#475569" },
              { icon: "⭐", iconColor: "#F59E0B", value: m.rating > 0 ? m.rating.toFixed(1) : "—",        sub: m.jobs > 0 ? `${m.jobs} reseña${m.jobs !== 1 ? "s" : ""}` : "Sin reseñas", valueColor: "#475569" },
              { icon: "✅", iconColor: VER_GREEN,  value: m.verified ? "Perfil verif." : "No verif.",      sub: "OBRABIEN",     valueColor: m.verified ? VER_GREEN : "#94A3B8" },
            ]).map((stat, i) => (
              <div key={i} style={{
                padding: "8px 3px", textAlign: "center",
                borderRight: i < 3 ? `1px solid ${BORDER}` : "none",
              }}>
                <div style={{ fontSize: 20, lineHeight: 1, marginBottom: 3 }}>{stat.icon}</div>
                <div style={{
                  fontSize: 10.5, fontWeight: 700, color: stat.valueColor,
                  lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  paddingInline: 2, marginBottom: 2,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: 8.5, color: "#94A3B8", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  paddingInline: 2,
                }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>

          {/* 5. Availability banner */}
          {(() => {
            const isAvail = (m.disponibilidad ?? "disponible") !== "no_disponible";
            const showUrgencias = isAvail && m.atiendeUrgencias;
            const cellStyle: React.CSSProperties = {
              padding: "9px 10px", textAlign: "center",
              fontSize: 11.5, fontWeight: 600, lineHeight: 1.3,
              color: isAvail ? VER_GREEN : "#64748B",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            };
            return (
              <div style={{
                ...sep,
                background: isAvail ? "#F0FDF4" : CARD_BG,
                display: "grid",
                gridTemplateColumns: showUrgencias ? "1fr 1fr" : "1fr",
              }}>
                <div style={cellStyle}>
                  {isAvail ? (
                    <>
                      <span style={{
                        width: 9, height: 9, borderRadius: "50%",
                        background: VER_GREEN, flexShrink: 0,
                        boxShadow: `0 0 0 3px rgba(22,163,74,0.25)`,
                        animation: "pulse 2s infinite",
                        display: "inline-block",
                      }} />
                      Disponible esta semana
                    </>
                  ) : "⚪ Consultar disponibilidad"}
                </div>
                {showUrgencias && (
                  <div style={{ ...cellStyle, borderLeft: "1px solid rgba(0,0,0,0.1)", color: "#DC2626", gap: 5 }}>
                    <span style={{ fontSize: 15 }}>🚨</span> Atiende urgencias
                  </div>
                )}
              </div>
            );
          })()}

          {/* 6. WhatsApp CTA */}
          {whatsappUrl && (
            <div style={{ ...sep, padding: "12px 14px" }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackWhatsApp}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                  background: WA_GREEN, color: "#fff",
                  borderRadius: 12, height: 48,
                  fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 14,
                  textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.03em",
                  width: "100%",
                  boxShadow: "0 2px 8px rgba(37,211,102,0.30)",
                }}
              >
                <WhatsAppIcon size={20} /> Contactar por WhatsApp
              </a>
            </div>
          )}

          {/* 7. Other social media */}
          {otherSocials.length > 0 && (
            <div style={{
              ...sep,
              padding: "12px 16px",
              display: "flex", justifyContent: "space-evenly", alignItems: "center",
            }}>
              {otherSocials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    textDecoration: "none", flex: 1,
                  }}
                >
                  {s.icon}
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>{s.label}</span>
                </a>
              ))}
            </div>
          )}

          {/* 8. QR section */}
          <div style={{ ...sep, padding: "10px 12px" }}>
            <div style={{
              background: CARD_BG, borderRadius: 10, padding: "10px 12px",
              border: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                <div style={{ color: NAVY, flexShrink: 0 }}>
                  <MobileIcon />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: "Archivo, sans-serif", fontWeight: 700,
                    fontSize: 12.5, color: NAVY, marginBottom: 2,
                  }}>
                    Ver perfil completo
                  </div>
                  <div style={{ fontSize: 10, color: "#94A3B8", lineHeight: 1.35 }}>
                    Escanea para ver galería y reseñas
                  </div>
                </div>
              </div>
              <canvas
                ref={qrRef}
                onClick={() => setQrOpen(true)}
                title="Toca para ampliar"
                style={{ background: "#fff", display: "block", borderRadius: 5, flexShrink: 0, cursor: "pointer" }}
              />
            </div>
          </div>

          {/* 9. Footer: Save contact + Share */}
          <div style={{ padding: "10px 12px", display: "flex", gap: 8 }}>
            <button
              onClick={downloadVCard}
              style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px 10px",
                border: `1.5px solid #CBD5E1`, borderRadius: 10,
                background: "#fff", color: "#475569",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter Tight', system-ui, sans-serif",
              }}
            >
              <ContactIcon /> Guardar contacto
            </button>
            <button
              onClick={() => setShareOpen(true)}
              style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px 10px",
                border: `1.5px solid #CBD5E1`, borderRadius: 10,
                background: "#fff", color: "#475569",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter Tight', system-ui, sans-serif",
              }}
            >
              <ShareIcon /> Compartir perfil
            </button>
          </div>

        </div>
      </div>
    </div>

      {/* Photo lightbox */}
      {photoOpen && m.photoUrl && (
        <div
          onClick={() => setPhotoOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9998,
            background: "rgba(0,0,0,0.90)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          {/* Close button */}
          <button
            onClick={e => { e.stopPropagation(); setPhotoOpen(false); }}
            aria-label="Cerrar"
            style={{
              position: "absolute", top: 16, right: 16,
              width: 36, height: 36, background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)", color: "#fff",
              borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", fontSize: 20, lineHeight: 1,
            }}
          >×</button>
          {/* Photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={m.photoUrl}
            alt={m.name}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 320, maxHeight: 320,
              width: "80vw", height: "80vw",
              borderRadius: "50%", objectFit: "cover",
              display: "block", cursor: "default",
              border: `4px solid ${ORANGE}`,
              boxShadow: "0 0 40px rgba(0,0,0,0.6)",
            }}
          />
        </div>
      )}

      {/* QR modal */}
      {qrOpen && (
        <div
          onClick={() => setQrOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 20, cursor: "pointer",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 16, padding: 28,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
              boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
              cursor: "default",
            }}
          >
            <canvas ref={qrModalRef} style={{ display: "block", borderRadius: 8 }} />
            <p style={{
              margin: 0, fontSize: 14, fontWeight: 600, color: NAVY,
              fontFamily: "'Inter Tight', system-ui, sans-serif",
              textAlign: "center",
            }}>
              Escanea para ver el perfil completo
            </p>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
            Toca fuera para cerrar
          </p>
        </div>
      )}

      {/* Share bottom sheet */}
      {shareOpen && (
        <div
          onClick={() => setShareOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 480,
              background: "#fff",
              borderRadius: "16px 16px 0 0",
              padding: "8px 0 24px",
              boxShadow: "0 -4px 32px rgba(0,0,0,0.18)",
            }}
          >
            {/* drag handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 14px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#CBD5E1" }} />
            </div>
            <p style={{
              margin: "0 0 12px", textAlign: "center",
              fontSize: 13, fontWeight: 700, color: NAVY,
              fontFamily: "'Inter Tight', system-ui, sans-serif",
              letterSpacing: "0.01em",
            }}>Compartir perfil</p>
            {[
              { emoji: "💬", label: "Compartir por WhatsApp", action: shareWhatsApp, color: WA_GREEN },
              { emoji: "🔗", label: "Copiar enlace",          action: copyLink,      color: "#3B82F6" },
              { emoji: "🖼️", label: "Descargar imagen (PNG)", action: downloadPNG,   color: "#7C3AED" },
              { emoji: "📄", label: "Descargar PDF",          action: downloadPDF,   color: "#DC2626" },
              { emoji: "📱", label: "Mostrar código QR",      action: showQrLarge,   color: NAVY },
            ].map(({ emoji, label, action, color }) => (
              <button
                key={label}
                onClick={action}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 24px", background: "none", border: "none",
                  cursor: "pointer", textAlign: "left",
                  fontFamily: "'Inter Tight', system-ui, sans-serif",
                  fontSize: 14, fontWeight: 500, color: "#1E293B",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <span style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: color + "18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>{emoji}</span>
                {label}
              </button>
            ))}
            <button
              onClick={() => setShareOpen(false)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                padding: "14px 24px", background: "none", border: "none",
                cursor: "pointer",
                fontFamily: "'Inter Tight', system-ui, sans-serif",
                fontSize: 14, fontWeight: 600, color: "#94A3B8",
                marginTop: 4,
              }}
            >Cancelar</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          zIndex: 10000,
          background: "#1E293B", color: "#fff",
          padding: "10px 20px", borderRadius: 10,
          fontSize: 13, fontWeight: 600,
          fontFamily: "'Inter Tight', system-ui, sans-serif",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          pointerEvents: "none",
        }}>{toastMsg}</div>
      )}
  </>);
}
