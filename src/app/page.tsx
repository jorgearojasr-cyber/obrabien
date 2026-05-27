"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogoMark } from "@/components/LogoMark";
import { HomeSearch } from "@/components/HomeSearch";
import { SPECIALTIES, SAMPLE_MASTERS } from "@/lib/data";
import { getIllustration } from "@/components/SpecialtyIllustrations";
import { LISTINGS, TYPE_CONFIG, formatPrice, type MarketplaceListing } from "@/lib/marketplace";

/* ─── Icons (unchanged) ──────────────────────────────────────────────────── */
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
      <path d="M12 17.3 5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6L18.2 21z" />
    </svg>
  );
}
function ChevronLeft() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
}
function ChevronRight() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;
}

function SpecialtyIcon({ name, size = 22 }: { name: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "Albañil": return <svg {...p}><rect x="3" y="5" width="6" height="4" /><rect x="9" y="5" width="6" height="4" /><rect x="15" y="5" width="6" height="4" /><rect x="6" y="9" width="6" height="4" style={{ color: "var(--orange)" }} /><rect x="12" y="9" width="6" height="4" /><rect x="3" y="13" width="6" height="4" /><rect x="9" y="13" width="6" height="4" /><rect x="15" y="13" width="6" height="4" /></svg>;
    case "Gasfiter": return <svg {...p}><path d="M4 4v6h5a3 3 0 0 1 3 3v7" /><path d="M2 4h4M2 10h4M10 20h4" /><rect x="14" y="6" width="6" height="3" rx="0.5" /><path d="M17 9v2" /></svg>;
    case "Electricista": return <svg {...p}><path d="M13 2 L4 14 H11 L10 22 L20 10 H13 Z" fill="currentColor" strokeWidth="1.4" /></svg>;
    case "Carpintero": return <svg {...p}><path d="M13 3 L21 7 L18 13 L10 9 Z" fill="currentColor" /><path d="M10 9 L3 20" strokeWidth="2.2" /></svg>;
    case "Pintor": return <svg {...p}><rect x="3" y="4" width="14" height="5" rx="1" fill="currentColor" /><path d="M17 6h2v3h-7v3M12 12 L12 20" /><circle cx="12" cy="22" r="1" fill="currentColor" /></svg>;
    case "Ceramista": return <svg {...p}><rect x="3" y="3" width="8" height="8" rx="0.5" /><rect x="13" y="3" width="8" height="8" rx="0.5" fill="currentColor" /><rect x="3" y="13" width="8" height="8" rx="0.5" fill="currentColor" /><rect x="13" y="13" width="8" height="8" rx="0.5" /></svg>;
    case "Soldador": return <svg {...p}><path d="M6 4 H18 V12 A6 6 0 0 1 12 18 A6 6 0 0 1 6 12 Z" /><rect x="9" y="8" width="6" height="3" rx="0.4" fill="currentColor" /></svg>;
    case "Techumbre": return <svg {...p}><path d="M2 12 L12 4 L22 12" strokeWidth="2.2" /><path d="M5 11 V20 H19 V11M10 20 V14 H14 V20" /></svg>;
    case "Yesero": return <svg {...p}><path d="M3 21 L9 15" strokeWidth="2.2" /><path d="M9 15 L19 5 A2 2 0 0 0 17 3 L7 13 Z" fill="currentColor" /></svg>;
    case "Drywall": return <svg {...p}><rect x="3" y="5" width="18" height="3" rx="0.4" /><rect x="3" y="10" width="18" height="3" rx="0.4" /><rect x="3" y="15" width="18" height="3" rx="0.4" fill="currentColor" /></svg>;
    case "Instalador de pisos flotantes": return <svg {...p}><rect x="3" y="4" width="18" height="4" /><path d="M8 4 V8 M14 4 V8" /><rect x="3" y="10" width="18" height="4" fill="currentColor" /><rect x="3" y="16" width="18" height="4" /></svg>;
    case "Instalador de ventanas termopanel": return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M12 3 V21 M3 12 H21" /><rect x="4.5" y="4.5" width="6" height="6" fill="currentColor" opacity="0.85" /></svg>;
    case "Instalador de cámaras": return <svg {...p}><rect x="3" y="6" width="13" height="7" rx="1.5" /><path d="M16 8 L21 5 V14 L16 11 Z" fill="currentColor" /><circle cx="7" cy="9.5" r="1.4" fill="currentColor" /></svg>;
    case "Aire acondicionado": return <svg {...p}><rect x="3" y="5" width="18" height="8" rx="1.5" /><path d="M5 9 H19M7 16 q1 1.5 0 3 M12 16 q1 1.5 0 3 M17 16 q1 1.5 0 3" /></svg>;
    case "Mantención de jardines": return <svg {...p}><path d="M4 20 C 4 6 18 4 20 4 C 20 6 18 20 4 20 Z" fill="currentColor" /><path d="M4 20 L20 4" stroke="white" strokeOpacity="0.8" /></svg>;
    case "Excavaciones": return <svg {...p}><rect x="3" y="14" width="14" height="4" rx="1" /><circle cx="6" cy="20" r="1.6" /><circle cx="14" cy="20" r="1.6" /><path d="M8 14 V10 L13 7M13 7 L20 3 L21 5 L17 11 Z" fill="currentColor" /></svg>;
    case "Paneles solares": return <svg {...p}><circle cx="6" cy="6" r="2.4" fill="currentColor" /><path d="M6 1.5 V2.5 M6 9.5 V10.5 M1.5 6 H2.5 M9.5 6 H10.5" /><path d="M9 13 L21 11 L23 19 L11 21 Z M13 12.4 L15 20.6 M17 11.6 L19 19.8 M9.7 16 L22 14 M10.4 19 L22.7 17" /></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

/* ─── Static data ────────────────────────────────────────────────────────── */
const featuredAll = SAMPLE_MASTERS.filter(m => m.verified);
const featured = featuredAll.slice(0, 3);
const stats = { total: SAMPLE_MASTERS.length, cities: new Set(SAMPLE_MASTERS.map(m => m.city)).size };

const STEPS_CLIENTE = [
  { n: "01", iconKey: "doc",     title: "Describe tu proyecto",       desc: "Cuéntanos qué necesitas. Albañilería, gasfitería, electricidad — tenemos el especialista.",       visualKey: "free-chip"   },
  { n: "02", iconKey: "profile", title: "Revisa perfiles reales",     desc: "Ve fotos de trabajos anteriores, calificaciones reales de clientes y años de experiencia.",       visualKey: "rating-card" },
  { n: "03", iconKey: "wa",      title: "Contacta directo",           desc: "Sin intermediarios. Habla directo con el maestro por WhatsApp y coordina los detalles.",           visualKey: "wa-btn"      },
  { n: "04", iconKey: "star",    title: "Califica tu experiencia",    desc: "Después del trabajo, deja tu reseña. Ayudas a otros y construyes la reputación del maestro.",     visualKey: "stars"       },
];
const STEPS_MAESTRO = [
  { n: "01", iconKey: "helmet",  title: "Crea tu perfil profesional", desc: "Sube tus trabajos, especialidades, zona de cobertura y formas de pago. Gratis y en minutos.",   visualKey: "free-maestro" },
  { n: "02", iconKey: "shield",  title: "Verifica tu identidad",      desc: "Sube tu cédula y obtén el badge VERIFICADO. Los clientes confían más en maestros verificados.",  visualKey: "verified"     },
  { n: "03", iconKey: "bell",    title: "Recibe solicitudes",         desc: "Cuando alguien busque tu especialidad en tu zona, te llegará una notificación por WhatsApp.",    visualKey: "wa-notif"     },
  { n: "04", iconKey: "trophy",  title: "Construye tu reputación",    desc: "Cada trabajo bien hecho suma estrellas y reseñas. Tu perfil crece y recibes más clientes.",     visualKey: "progress"     },
];

const COMUNIDAD_POSTS = [
  { title: "¿Cuánto cobrar por metro cuadrado de pintura interior?", category: "Precios y tarifas", author: "Pedro R.", time: "Hace 2h", replies: 12 },
  { title: "Problema con humedad en muro de hormigón, ¿qué producto usar?", category: "Técnicas y materiales", author: "María C.", time: "Hace 5h", replies: 8 },
  { title: "¿Vale la pena certificarse como instalador eléctrico en 2025?", category: "Formación y certificaciones", author: "Carlos M.", time: "Hace 1 día", replies: 23 },
];

/* ─── FadeIn wrapper (IntersectionObserver) ──────────────────────────────── */
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(22px)",
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ─── How-it-works step icons ────────────────────────────────────────────── */
function HowIcon({ iconKey, size = 28 }: { iconKey: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (iconKey) {
    case "doc":     return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><path d="M10 13l2 2 4-4" stroke="var(--orange)" strokeWidth="2"/></svg>;
    case "profile": return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
    case "wa":      return <svg {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
    case "star":    return <svg {...p} fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>;
    case "helmet":  return <svg {...p}><path d="M12 2a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z" fill="currentColor" strokeWidth="1.5"/><path d="M3 11v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><line x1="9" y1="15" x2="9" y2="18"/><line x1="15" y1="15" x2="15" y2="18"/><line x1="7" y1="18" x2="17" y2="18"/></svg>;
    case "shield":  return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4" strokeWidth="2"/></svg>;
    case "bell":    return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case "trophy":  return <svg {...p}><polyline points="8,21 12,17 16,21"/><line x1="12" y1="17" x2="12" y2="12"/><path d="M7 4H3v3a4 4 0 0 0 4 4"/><path d="M17 4h4v3a4 4 0 0 1-4 4"/><rect x="7" y="2" width="10" height="10" rx="1"/></svg>;
    default:        return <svg {...p}><circle cx="12" cy="12" r="9"/></svg>;
  }
}

function HowVisual({ visualKey }: { visualKey: string }) {
  switch (visualKey) {
    case "free-chip":
      return <div style={{ display: "inline-flex", alignItems: "center", background: "var(--bg)", border: "1px solid var(--line)", padding: "5px 10px", fontSize: 11, fontFamily: "var(--font-jetbrains), monospace", color: "var(--ink-soft)", letterSpacing: "0.03em", lineHeight: 1.4 }}>✓ Sin costo · Sin registro obligatorio</div>;
    case "rating-card":
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg)", border: "1px solid var(--line)", padding: "8px 10px" }}>
          <div style={{ width: 28, height: 28, background: "var(--navy)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 10.5, flexShrink: 0 }}>JP</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink)" }}>Juan P.</div>
            <div style={{ fontSize: 11, color: "var(--orange)", fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700 }}>★ 4.8</div>
          </div>
          <span style={{ background: "var(--ink)", color: "var(--orange)", fontSize: 8, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, letterSpacing: "0.08em", padding: "2px 5px", flexShrink: 0 }}>VERIFICADO</span>
        </div>
      );
    case "wa-btn":
      return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#25D366", color: "#fff", padding: "7px 12px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-archivo), sans-serif" }}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.6 5.8L0 24l6.3-1.6C7.9 23.4 9.9 24 12 24c6.6 0 12-5.4 12-12S18.6 0 12 0zm3.9 16.7c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.7-4.5-3.9-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9 1-2.2.3-.3.5-.3.7-.3h.5c.2 0 .3 0 .5.4.2.4.6 1.5.7 1.6.1.1.1.3 0 .4-.1.1-.2.3-.3.4-.1.1-.3.2-.4.3-.1.2-.2.3-.1.5.2.3.7.9 1.2 1.5.8.7 1.5.9 1.7 1 .3.1.4.1.5-.1.2-.2.6-.7.7-.9.2-.2.3-.1.5 0l1.7.8c.2.1.3.2.4.3 0 .2-.1.5-.2.8z"/></svg>
          Contactar por WhatsApp
        </div>
      );
    case "stars":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", gap: 1 }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: "var(--orange)", fontSize: 18 }}>★</span>)}</div>
          <div style={{ fontSize: 10.5, fontFamily: "var(--font-jetbrains), monospace", color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reseña verificada ✓</div>
        </div>
      );
    case "free-maestro":
      return <div style={{ display: "inline-flex", alignItems: "center", background: "var(--orange)", color: "#fff", padding: "5px 10px", fontSize: 11, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1.4 }}>100% Gratis · Sin comisiones</div>;
    case "verified":
      return <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--ink)", color: "var(--orange)", padding: "6px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em" }}>✓ VERIFICADO</div>;
    case "wa-notif":
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid var(--line)", padding: "8px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", maxWidth: 210 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#25D366", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>WhatsApp</div>
            <div style={{ fontSize: 10.5, color: "var(--mute)" }}>Nueva solicitud en tu zona</div>
          </div>
        </div>
      );
    case "progress":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nivel Pro</span>
            <span style={{ fontSize: 11, color: "var(--orange)", fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700 }}>78%</span>
          </div>
          <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "78%", background: "var(--orange)", borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 10.5, color: "var(--mute-2)", fontFamily: "var(--font-jetbrains), monospace" }}>4 reseñas · 142 trabajos</div>
        </div>
      );
    default: return null;
  }
}

/* ─── Marketplace mini card ──────────────────────────────────────────────── */
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

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function Home() {
  const [slide,        setSlide]        = useState(0);
  const [mkpTab,       setMkpTab]       = useState<"venta" | "arriendo" | "servicio">("venta");
  const [roleTab,      setRoleTab]      = useState<"cliente" | "maestro">("cliente");
  const [stepsVisible, setStepsVisible] = useState(true);
  const [slideDesktop, setSlideDesktop] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const desktopMax = Math.max(0, featuredAll.length - 3);

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % featured.length), 4000);
  }, []);

  useEffect(() => {
    restartTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [restartTimer]);

  function goSlide(idx: number) {
    setSlide(idx);
    restartTimer();
  }

  function handleRoleChange(role: "cliente" | "maestro") {
    if (role === roleTab) return;
    setStepsVisible(false);
    setTimeout(() => { setRoleTab(role); setStepsVisible(true); }, 200);
  }

  function goDesktopSlide(idx: number) {
    const clamped = Math.max(0, Math.min(idx, desktopMax));
    setSlideDesktop(clamped);
    const el = desktopScrollRef.current;
    if (!el) return;
    const gap = 16;
    const cardW = (el.clientWidth - gap * 2) / 3;
    el.scrollTo({ left: clamped * (cardW + gap), behavior: "smooth" });
  }

  const mkpListings = LISTINGS.filter(l => l.type === mkpTab).slice(0, 4);

  return (
    <main>
      <HomeSearch />

      {/* ═══════════════════════════════════════════════════════
          SECCIÓN 1 — HERO (sin cambios)
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "var(--bg)", position: "relative", overflow: "hidden" }}>
        <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>
          <div className="row gap-32 wrap-flex" style={{ alignItems: "center" }}>
            {/* Left — copy */}
            <div style={{ flex: "1.1 1 460px", minWidth: 280 }}>
              <div className="row center gap-8 wrap-flex" style={{ marginBottom: 22 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--navy)", color: "#fff",
                  padding: "5px 12px", borderRadius: 999,
                  fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5,
                  letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
                }}>
                  <span style={{ width: 6, height: 6, background: "var(--orange)", borderRadius: "50%" }} />
                  OBRABIEN · Plataforma chilena
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {stats.total} maestros · {stats.cities} ciudades
                </span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontSize: "clamp(36px, 5.2vw, 64px)", fontWeight: 900, lineHeight: 1.02,
                color: "var(--navy)", letterSpacing: "-0.025em", margin: 0,
              }}>
                Encuentra<br />
                <span style={{ color: "var(--orange)" }}>maestros confiables</span><br />
                para tu proyecto.
              </h1>

              <p style={{ fontSize: 17.5, color: "var(--ink-soft)", maxWidth: 520, marginTop: 22, lineHeight: 1.6 }}>
                Albañiles, gasfiter, electricistas, carpinteros y más.
                Revisa el perfil, las reseñas y contáctalos directamente — sin intermediarios.
              </p>

              <div className="row gap-10 wrap-flex" style={{ marginTop: 26 }}>
                <Link href="/buscar" className="btn btn-lg"
                  style={{ background: "var(--orange)", borderColor: "var(--orange)", color: "#fff", borderRadius: 10, fontWeight: 700, padding: "0 24px", textDecoration: "none" }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                  Buscar maestros
                </Link>
                <Link href="/registro" className="btn btn-lg"
                  style={{ background: "#fff", borderColor: "var(--navy)", color: "var(--navy)", borderRadius: 10, fontWeight: 700, padding: "0 24px", textDecoration: "none" }}>
                  ⛑ Registrarme como maestro
                </Link>
              </div>

              {/* Trust row */}
              <div className="row center gap-16 wrap-flex" style={{ marginTop: 26, fontSize: 12.5, color: "var(--mute)" }}>
                {[
                  { bg: "var(--navy)", color: "var(--orange)", text: "✓", label: "Maestros verificados" },
                  { bg: "var(--orange)", color: "#fff", text: "%", label: "100% gratis" },
                  { bg: "var(--navy)", color: "#fff", text: "★", label: "Calificaciones reales" },
                ].map(({ bg, color, text, label }) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 18, height: 18, background: bg, color, display: "grid", placeItems: "center", borderRadius: "50%", fontSize: 11, fontWeight: 900 }}>{text}</span>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — hero image */}
            <div style={{ flex: "0.85 1 340px", minWidth: 240, maxWidth: 380, position: "relative" }}>
              <div style={{
                position: "relative", aspectRatio: "4/5", background: "var(--navy)",
                borderRadius: 18, overflow: "hidden",
                boxShadow: "0 20px 40px rgba(14,39,66,0.18), 0 4px 10px rgba(14,39,66,0.08)",
              }}>
                <Image
                  src="/assets/hero-worker.png"
                  alt="Maestro de la construcción con casco"
                  fill style={{ objectFit: "cover" }}
                  priority
                />
                <div style={{
                  position: "absolute", inset: "auto 0 0 0", height: "40%",
                  background: "linear-gradient(180deg, transparent 0%, rgba(14,39,66,0.55) 100%)",
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", left: 14, right: 14, bottom: 14,
                  background: "rgba(255,255,255,0.96)", backdropFilter: "blur(6px)",
                  border: "1.5px solid var(--navy)", borderRadius: 12,
                  padding: "9px 12px", display: "flex", alignItems: "center", gap: 10,
                }}>
                  <LogoMark size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 12.5, color: "var(--navy)", lineHeight: 1.15, textTransform: "uppercase", textAlign: "center" }}>
                      Nuevas oportunidades
                    </div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9.5, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2, textAlign: "center" }}>
                      Están esperando por ti
                    </div>
                  </div>
                </div>
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  background: "var(--orange)", color: "#fff", padding: "5px 11px",
                  fontFamily: "var(--font-jetbrains), monospace", fontSize: 9.5,
                  fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  borderBottomLeftRadius: 12,
                }}>
                  Verificados ✓
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="tape" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECCIÓN 2 — CÓMO FUNCIONA
      ══════════════════════════════════════════════════════════ */}
      <FadeIn>
        <section style={{ background: "#fff" }}>
          <div className="wrap" style={{ paddingTop: 72, paddingBottom: 64 }}>

            {/* Header */}
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 52px" }}>
              <span style={{ display: "inline-block", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.15em", fontWeight: 700, color: "var(--orange)", marginBottom: 14 }}>
                // ASÍ FUNCIONA
              </span>
              <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, color: "var(--navy)", lineHeight: 1.1, letterSpacing: "-0.025em", margin: "0 0 18px" }}>
                La forma más fácil de conectar<br />con maestros verificados.
              </h2>
              <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.65, margin: 0 }}>
                Encuentra especialistas reales, revisa sus trabajos, calificaciones y experiencia.
                Contáctalos directo, sin intermediarios ni comisiones.
              </p>
            </div>

            {/* Role tabs */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 52 }}>
              <div style={{ display: "flex", border: "1.5px solid var(--navy)", overflow: "hidden" }}>
                {(["cliente", "maestro"] as const).map((key, i) => (
                  <button key={key} onClick={() => handleRoleChange(key)}
                    style={{
                      padding: "14px 36px", border: "none",
                      borderLeft: i > 0 ? "1.5px solid var(--navy)" : "none",
                      background: roleTab === key ? "var(--navy)" : "#fff",
                      color: roleTab === key ? "#fff" : "var(--navy)",
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
                      textTransform: "uppercase" as const, cursor: "pointer",
                      transition: "background .2s, color .2s",
                    }}
                  >
                    {key === "cliente" ? "SOY CLIENTE" : "SOY MAESTRO"}
                  </button>
                ))}
              </div>
            </div>

            {/* Steps grid */}
            <div className="how-grid" style={{ opacity: stepsVisible ? 1 : 0, transform: stepsVisible ? "translateY(0)" : "translateY(6px)", transition: "opacity 0.2s ease, transform 0.2s ease" }}>
              {(roleTab === "cliente" ? STEPS_CLIENTE : STEPS_MAESTRO).map(step => (
                <div key={step.n} style={{ background: "#fff", border: "1px solid var(--line)", padding: "28px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 52, fontWeight: 900, color: "var(--orange)", lineHeight: 1, letterSpacing: "-0.03em" }}>
                    {step.n}
                  </div>
                  <div style={{ color: "var(--navy)" }}>
                    <HowIcon iconKey={step.iconKey} size={30} />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--ink)", margin: 0, lineHeight: 1.25 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.65, margin: 0, flex: 1 }}>
                    {step.desc}
                  </p>
                  <div style={{ marginTop: 6 }}>
                    <HowVisual visualKey={step.visualKey} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust bar — full-width navy */}
          <div style={{ background: "var(--navy)", padding: "28px 0" }}>
            <div className="wrap">
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "clamp(20px, 4vw, 52px)", flexWrap: "wrap" }}>
                {["100% Gratis para maestros", "Sin comisiones", "Contacto directo", "Maestros verificados"].map(stat => (
                  <div key={stat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 18, height: 18, background: "var(--orange)", display: "grid", placeItems: "center", borderRadius: "50%", fontSize: 10, fontWeight: 900, color: "#fff", flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>{stat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════════════════════
          SECCIÓN 3 — MAESTROS DESTACADOS (carrusel)
      ══════════════════════════════════════════════════════════ */}
      <FadeIn>
        <section className="block" style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="wrap">
            <div className="row between center wrap-flex gap-12" style={{ marginBottom: 32 }}>
              <div>
                <span className="label">// Maestros destacados</span>
                <h2 className="display" style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, marginTop: 6 }}>
                  Profesionales verificados.
                </h2>
              </div>
              <Link href="/buscar" className="btn" style={{ textDecoration: "none" }}>
                Ver todos los maestros <ArrowIcon />
              </Link>
            </div>

            {/* ── Desktop: 3 cards visible, navigate 1 at a time ── */}
            <div className="desktop-only" style={{ position: "relative" }}>
              <div
                ref={desktopScrollRef}
                className="no-scrollbar"
                style={{ display: "flex", width: "100%", gap: 16, overflowX: "auto" }}
              >
                {featuredAll.map(m => (
                  <div key={m.id} style={{ flex: "0 0 calc((100% - 32px) / 3)", minWidth: 0 }}>
                    <Link href={`/maestro/${m.id}`} className="card hoverable col"
                      style={{ textDecoration: "none", padding: 0, borderRadius: 10, display: "flex", flexDirection: "column", height: "100%" }}>
                      <div className="row gap-12" style={{ padding: 20, borderBottom: "1px solid var(--line)" }}>
                        <div style={{
                          width: 64, height: 64, background: "#14375F", color: "#fff",
                          display: "grid", placeItems: "center", fontFamily: "var(--font-archivo), sans-serif",
                          fontWeight: 800, fontSize: 22, flexShrink: 0, border: "1px solid var(--ink)",
                        }}>
                          {m.initials}
                        </div>
                        <div className="col gap-4" style={{ flex: 1, minWidth: 0 }}>
                          <div className="row center gap-6 wrap-flex">
                            <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 15.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                            {m.verified && <span className="verified"><CheckIcon /> Verificado</span>}
                          </div>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 600 }}>
                            <StarIcon /> {m.rating.toFixed(1)} <span style={{ color: "var(--mute)", fontWeight: 500 }}>· {m.jobs} trabajos</span>
                          </span>
                          <span style={{ fontSize: 12, color: "var(--mute)" }}>📍 {m.city} · {m.sector}</span>
                        </div>
                      </div>
                      <div className="col gap-8" style={{ padding: 20, flex: 1 }}>
                        <div className="row gap-6 wrap-flex">
                          {m.specialties.slice(0, 2).map(sp => <span key={sp} className="chip">{sp}</span>)}
                        </div>
                        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                          {m.description}
                        </p>
                        <div className="row between center" style={{ marginTop: "auto", paddingTop: 8 }}>
                          <span style={{ fontSize: 12, color: "var(--mute)" }}>🕐 {m.schedule.split("·")[0].trim()}</span>
                          <span style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 4 }}>
                            Ver perfil <ArrowIcon />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              <button onClick={() => goDesktopSlide(slideDesktop - 1)}
                style={{ position: "absolute", top: "50%", left: -20, transform: "translateY(-50%)", width: 38, height: 38, background: "#fff", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 2, opacity: slideDesktop === 0 ? 0.35 : 1, transition: "opacity .2s" }}
                aria-label="Anterior">
                <ChevronLeft />
              </button>
              <button onClick={() => goDesktopSlide(slideDesktop + 1)}
                style={{ position: "absolute", top: "50%", right: -20, transform: "translateY(-50%)", width: 38, height: 38, background: "#fff", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 2, opacity: slideDesktop >= desktopMax ? 0.35 : 1, transition: "opacity .2s" }}
                aria-label="Siguiente">
                <ChevronRight />
              </button>
            </div>

            {/* Desktop dots */}
            <div className="desktop-only" style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 22 }}>
              {Array.from({ length: desktopMax + 1 }, (_, i) => (
                <button key={i} onClick={() => goDesktopSlide(i)} aria-label={`Ir a posición ${i + 1}`}
                  style={{ width: i === slideDesktop ? 24 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer", padding: 0, transition: "all .25s", background: i === slideDesktop ? "var(--orange)" : "var(--line)" }} />
              ))}
            </div>

            {/* ── Mobile: 1 card at a time ── */}
            <div className="mobile-only" style={{ position: "relative" }}>
              <div style={{ overflow: "hidden" }}>
                <div style={{
                  display: "flex",
                  transform: `translateX(-${slide * 100}%)`,
                  transition: "transform 0.45s cubic-bezier(.25,.46,.45,.94)",
                }}>
                  {featured.map(m => (
                    <div key={m.id} style={{ minWidth: "100%", paddingBottom: 4 }}>
                      <Link href={`/maestro/${m.id}`} className="card hoverable col"
                        style={{ textDecoration: "none", padding: 0, borderRadius: 10, display: "flex", flexDirection: "column" }}>
                        <div className="row gap-12" style={{ padding: 20, borderBottom: "1px solid var(--line)" }}>
                          <div style={{
                            width: 64, height: 64, background: "#14375F", color: "#fff",
                            display: "grid", placeItems: "center", fontFamily: "var(--font-archivo), sans-serif",
                            fontWeight: 800, fontSize: 22, flexShrink: 0, border: "1px solid var(--ink)",
                          }}>
                            {m.initials}
                          </div>
                          <div className="col gap-4" style={{ flex: 1, minWidth: 0 }}>
                            <div className="row center gap-6 wrap-flex">
                              <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 17, fontWeight: 700 }}>{m.name}</span>
                              {m.verified && <span className="verified"><CheckIcon /> Verificado</span>}
                            </div>
                            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 600 }}>
                              <StarIcon /> {m.rating.toFixed(1)} <span style={{ color: "var(--mute)", fontWeight: 500 }}>· {m.jobs} trabajos</span>
                            </span>
                            <span style={{ fontSize: 13, color: "var(--mute)" }}>📍 {m.city} · {m.sector}</span>
                          </div>
                        </div>
                        <div className="col gap-8" style={{ padding: 20 }}>
                          <div className="row gap-6 wrap-flex">
                            {m.specialties.map(sp => <span key={sp} className="chip">{sp}</span>)}
                          </div>
                          <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                            {m.description}
                          </p>
                          <div className="row between center" style={{ marginTop: 4 }}>
                            <span style={{ fontSize: 12, color: "var(--mute)" }}>🕐 {m.schedule.split("·")[0].trim()}</span>
                            <span style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
                              Ver perfil <ArrowIcon />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => goSlide((slide + featured.length - 1) % featured.length)}
                style={{ position: "absolute", top: "50%", left: -20, transform: "translateY(-50%)", width: 38, height: 38, background: "#fff", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 2 }}
                aria-label="Anterior">
                <ChevronLeft />
              </button>
              <button onClick={() => goSlide((slide + 1) % featured.length)}
                style={{ position: "absolute", top: "50%", right: -20, transform: "translateY(-50%)", width: 38, height: 38, background: "#fff", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 2 }}
                aria-label="Siguiente">
                <ChevronRight />
              </button>
            </div>

            {/* Mobile dots */}
            <div className="mobile-only" style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 22 }}>
              {featured.map((_, i) => (
                <button key={i} onClick={() => goSlide(i)} aria-label={`Ir a maestro ${i + 1}`}
                  style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer", padding: 0, transition: "all .25s", background: i === slide ? "var(--orange)" : "var(--line)" }} />
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════════════════════
          SECCIÓN 4 — ESPECIALIDADES (sin cambios)
      ══════════════════════════════════════════════════════════ */}
      <FadeIn>
        <section className="block">
          <div className="wrap">
            <div className="row between center wrap-flex gap-12" style={{ marginBottom: 32 }}>
              <div>
                <span className="label">// Especialidades</span>
                <h2 className="display" style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, marginTop: 6 }}>
                  Todos los oficios de la construcción.
                </h2>
              </div>
            </div>

            <div className="spec-grid">
              {SPECIALTIES.map((s, idx) => {
                const count = SAMPLE_MASTERS.filter(m => m.specialties.includes(s)).length;
                const num   = String(idx + 1).padStart(2, "0");
                return (
                  <Link key={s} href={`/buscar?esp=${encodeURIComponent(s)}`}
                    className="spec-card"
                    aria-label={`Buscar ${s} — ${count} ${count === 1 ? "maestro" : "maestros"}`}
                  >
                    <span className="spec-card-illust-wrap">
                      {getIllustration(s)}
                    </span>
                    <div className="spec-card-info">
                      <div className="spec-card-meta">
                        <span className="spec-card-num">#{num}</span>
                        <span className="spec-card-icon">
                          <SpecialtyIcon name={s} size={13} />
                        </span>
                        <span className="spec-card-name">{s}</span>
                      </div>
                      <div className={"spec-card-count" + (count === 0 ? " is-zero" : "")}>
                        <strong>{count}</strong> {count === 1 ? "maestro" : "maestros"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════════════════════
          SECCIÓN 5 — COMUNIDAD
      ══════════════════════════════════════════════════════════ */}
      <FadeIn>
        <section style={{ background: "var(--navy)", color: "#fff" }}>
          <div className="tape-thin" />
          <div className="wrap" style={{ paddingTop: 56, paddingBottom: 64 }}>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 36 }}>
              <div>
                <span className="label" style={{ color: "rgba(255,255,255,0.45)" }}>// Comunidad</span>
                <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, color: "#fff", margin: "6px 0 0", letterSpacing: "-0.02em" }}>
                  El foro del rubro<br />de la construcción.
                </h2>
              </div>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                {[
                  { value: "1.240", label: "Maestros activos" },
                  { value: "3.890", label: "Preguntas resueltas" },
                ].map(({ value, label }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: 34, color: "var(--orange)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                      {value}
                    </div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Post cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
              {COMUNIDAD_POSTS.map((p, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 38, height: 38, background: "rgba(232,108,28,0.2)", border: "1px solid rgba(232,108,28,0.4)",
                    display: "grid", placeItems: "center", flexShrink: 0, fontSize: 16,
                  }}>
                    💬
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
                      {p.category}
                    </div>
                    <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {p.title}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                    <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)" }}>{p.time}</span>
                    <span style={{ fontSize: 12, color: "var(--orange)", fontFamily: "var(--font-jetbrains), monospace", fontWeight: 600 }}>{p.replies} resp.</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <Link href="/comunidad"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--orange)", color: "#fff", fontWeight: 700, fontSize: 16, padding: "14px 32px", textDecoration: "none" }}>
                Entrar a la comunidad <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════════════════════
          SECCIÓN 6 — MARKETPLACE
      ══════════════════════════════════════════════════════════ */}
      <FadeIn>
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

            {/* Tabs */}
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

            {/* Mini cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))", gap: 14, marginBottom: 28 }}>
              {mkpListings.map(l => <MkpMiniCard key={l.id} listing={l} />)}
            </div>

            {/* CTAs */}
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
      </FadeIn>

      {/* ═══════════════════════════════════════════════════════
          SECCIÓN 7 — CTA FINAL
      ══════════════════════════════════════════════════════════ */}
      <FadeIn>
        <section style={{ background: "var(--navy)", color: "#fff", paddingBottom: 72 }}>
          <div className="tape" />
          <div className="wrap" style={{ paddingTop: 72, textAlign: "center" }}>

            <span className="label" style={{ color: "var(--orange)", marginBottom: 12, display: "block" }}>// ¿Eres maestro?</span>
            <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(32px,5vw,60px)", color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.05, margin: "0 0 16px" }}>
              Únete gratis.
            </h2>
            <p style={{ fontSize: 17.5, color: "rgba(255,255,255,0.65)", maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.6 }}>
              Sin comisiones. Sin intermediarios. Solo tú y tus clientes.
            </p>

            <Link href="/registro"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--orange)", color: "#fff", fontWeight: 800, fontSize: 17, padding: "16px 36px", textDecoration: "none", letterSpacing: "-0.01em" }}>
              ⛑ Registrarme como maestro
            </Link>

            {/* Stats */}
            <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap", marginTop: 52 }}>
              {[
                { value: "10+", label: "Maestros verificados" },
                { value: "6",   label: "Ciudades" },
                { value: "100%", label: "Gratis" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: 42, color: "var(--orange)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>
    </main>
  );
}
