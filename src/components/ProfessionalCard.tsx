"use client";

import { useEffect, useRef } from "react";
import type { Master } from "@/lib/data";
import { LogoMark } from "@/components/LogoMark";

const NAVY = "#1B2B4B";
const ORANGE = "#F97316";
const WA_GREEN = "#25D366";
const VER_GREEN = "#16A34A";
const CARD_BG = "#F8FAFC";
const BORDER = "#E2E8F0";

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

function InstagramIcon({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.68a8.14 8.14 0 0 0 4.77 1.52V6.75a4.85 4.85 0 0 1-1-.06z" />
    </svg>
  );
}

function FacebookIcon({ size = 40 }: { size?: number }) {
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

interface Props {
  m: Master;
  bg: string;
  fg: string;
  maestroId?: string;
}

export default function ProfessionalCard({ m, maestroId }: Props) {
  const qrRef = useRef<HTMLCanvasElement>(null);

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

  const mainSpecialty = m.specialties[0] ?? "";
  const otherSpecialties = m.specialties.slice(1);
  const specialtyEmoji = SPECIALTY_EMOJI[mainSpecialty] ?? "🛠️";
  // Two-column specialty layout only when there are 2+ additional specialties
  const showTwoColSpecialty = otherSpecialties.length >= 2;

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

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100%",
      background: "#F1F5F9",
      borderRadius: 16,
      padding: "12px 0",
    }}>
      <div style={{ width: 390, maxWidth: "100vw", fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
        <div style={{
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

          {/* 2. Avatar + Identity */}
          <div style={{ ...sep, background: CARD_BG, padding: "16px 16px 12px", textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 10 }}>
              <div style={{
                width: 80, height: 80,
                borderRadius: "50%",
                background: m.photoUrl ? "transparent" : ORANGE,
                color: "#fff",
                display: "grid", placeItems: "center",
                fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 26,
                border: `4px solid ${ORANGE}`,
                overflow: "hidden",
              }}>
                {m.photoUrl
                  /* eslint-disable-next-line @next/next/no-img-element */
                  ? <img src={m.photoUrl} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : m.initials}
              </div>
              <div style={{
                position: "absolute", bottom: 1, right: 1,
                width: 22, height: 22,
                background: VER_GREEN, borderRadius: "50%",
                border: "2px solid #fff",
                display: "grid", placeItems: "center",
                color: "#fff", fontSize: 10, fontWeight: 800,
              }}>✓</div>
            </div>

            <div style={{
              fontFamily: "Archivo, sans-serif", fontWeight: 800,
              fontSize: 18, color: NAVY,
              letterSpacing: "-0.02em", lineHeight: 1.15,
              marginBottom: 6,
            }}>
              {m.name}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 6 }}>
              <span style={{ display: "flex", gap: 1, color: "#F59E0B" }}>
                {[1,2,3,4,5].map(i => i <= Math.round(m.rating)
                  ? <StarFilled key={i} size={12} />
                  : <StarEmpty key={i} size={12} />
                )}
              </span>
              {m.rating > 0 ? (
                <span style={{ fontSize: 11, color: "#64748B", fontFamily: "JetBrains Mono, monospace" }}>
                  {m.rating.toFixed(1)} · {m.jobs} reseña{m.jobs !== 1 ? "s" : ""}
                </span>
              ) : (
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Sin reseñas aún</span>
              )}
            </div>

            {m.verified && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                color: VER_GREEN, fontSize: 11.5, fontWeight: 600,
              }}>
                <ShieldCheckIcon /> Maestro Verificado
              </div>
            )}
          </div>

          {/* 3. Specialty block */}
          {mainSpecialty && (
            <div style={{ ...sep, padding: "10px 12px" }}>
              <div style={{
                background: CARD_BG, borderRadius: 10, padding: "10px 12px",
                border: `1px solid ${BORDER}`,
                display: "flex",
                gap: showTwoColSpecialty ? 12 : 0,
                alignItems: showTwoColSpecialty ? "flex-start" : "center",
                justifyContent: showTwoColSpecialty ? "flex-start" : "center",
                flexDirection: showTwoColSpecialty ? "row" : "column",
                textAlign: showTwoColSpecialty ? "left" : "center",
              }}>
                {/* Main specialty */}
                <div style={{ flex: showTwoColSpecialty ? "0 0 auto" : undefined }}>
                  <div style={{ fontSize: showTwoColSpecialty ? 30 : 34, lineHeight: 1, marginBottom: 4 }}>
                    {specialtyEmoji}
                  </div>
                  <div style={{
                    fontSize: 8, fontFamily: "JetBrains Mono, monospace",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: ORANGE, fontWeight: 700, marginBottom: 2,
                  }}>
                    Especialista en
                  </div>
                  <div style={{
                    fontSize: showTwoColSpecialty ? 14 : 19,
                    fontFamily: "Archivo, sans-serif",
                    fontWeight: 800, color: NAVY, lineHeight: 1.2,
                  }}>
                    {mainSpecialty}
                  </div>
                </div>

                {/* Other specialties — only shown when 2+ */}
                {showTwoColSpecialty && (
                  <div style={{
                    flex: 1, borderLeft: `1px solid ${BORDER}`,
                    paddingLeft: 12, minWidth: 0,
                  }}>
                    <div style={{
                      fontSize: 9, color: "#94A3B8", fontWeight: 600,
                      marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      También realiza:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {otherSpecialties.map(sp => (
                        <div key={sp} style={{ fontSize: 11.5, color: "#475569", display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ color: ORANGE, fontWeight: 800, lineHeight: 1 }}>·</span>
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
              { icon: "📍", label: m.city || "Chile" },
              { icon: "💼", label: m.jobs > 0 ? `${m.jobs} trab.` : "Nuevo" },
              { icon: "⭐", label: m.rating > 0 ? `${m.rating.toFixed(1)} cal.` : "—" },
              { icon: "📅", label: yearsOnPlatform > 0 ? `${yearsOnPlatform} años` : "Nuevo" },
            ] as const).map((stat, i) => (
              <div key={i} style={{
                padding: "8px 3px", textAlign: "center",
                borderRight: i < 3 ? `1px solid ${BORDER}` : "none",
              }}>
                <div style={{ fontSize: 15, lineHeight: 1, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{
                  fontSize: 10, color: "#475569", fontWeight: 500,
                  lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  paddingInline: 2,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* 5. Availability banner */}
          <div style={{
            ...sep,
            padding: "8px 14px",
            background: m.atiendeUrgencias ? "#F0FDF4" : CARD_BG,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{m.atiendeUrgencias ? "🕐" : "📅"}</span>
            <span style={{
              fontSize: 11.5, fontWeight: 600,
              color: m.atiendeUrgencias ? VER_GREEN : "#64748B",
              lineHeight: 1.3,
            }}>
              {m.atiendeUrgencias
                ? "Disponible esta semana · Responde en menos de 1 hora"
                : "Consultar disponibilidad"}
            </span>
          </div>

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
              padding: "10px 16px",
              display: "flex", justifyContent: "space-evenly", alignItems: "center",
            }}>
              {otherSocials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    textDecoration: "none", color: s.color, flex: 1,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40 }}>
                    {s.icon}
                  </span>
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
                style={{ background: "#fff", display: "block", borderRadius: 5, flexShrink: 0 }}
              />
            </div>
          </div>

          {/* 9. Footer: Save contact */}
          <div style={{ padding: "10px 12px" }}>
            <button
              onClick={downloadVCard}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "10px 14px",
                border: `1.5px solid #CBD5E1`, borderRadius: 10,
                background: "#fff", color: "#475569",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter Tight', system-ui, sans-serif",
                transition: "background 0.15s",
              }}
            >
              <ContactIcon /> Guardar contacto
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
