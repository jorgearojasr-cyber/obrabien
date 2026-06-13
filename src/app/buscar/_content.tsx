"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { REGIONS, SPECIALTIES, type Master } from "@/lib/data";
import { useFavorites } from "@/hooks/useFavorites";

/* ── Icons ─────────────────────────────────────────────────────────────────── */
function StarFilled({ size = 13 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M12 17.3 5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6L18.2 21z" /></svg>;
}
function StarEmpty({ size = 13 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 17.3 5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6L18.2 21z" /></svg>;
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>;
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
}
function CloseIcon({ size = 12 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>;
}
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function FilterIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>;
}
function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.556 4.126 1.526 5.858L.057 23.1a.75.75 0 0 0 .914.914l5.242-1.469A11.947 11.947 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.687-.504-5.228-1.386l-.373-.218-3.866 1.083 1.083-3.866-.218-.373A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

/* ── Urgency categories ─────────────────────────────────────────────────────── */
const URGENCIA_CATS = ["Gasfitería","Electricidad","Cerrajería","Techumbre","Instalación de ventanas","Otros"] as const;
const URGENCIA_MATCH: Record<string, string[]> = {
  "Gasfitería":              ["Gasfitería", "Gasfiter"],
  "Electricidad":            ["Electricidad", "Electricista"],
  "Cerrajería":              ["Cerrajería"],
  "Techumbre":               ["Techumbre", "Techumbres"],
  "Instalación de ventanas": ["Instalación de ventanas"],
  "Otros":                   [],
};

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const AV_COLORS: [string, string][] = [["#14375F", "#fff"], ["#E86C1C", "#fff"], ["#ECEAE3", "#14375F"]];

function Stars({ count, size = 12 }: { count: number; size?: number }) {
  return (
    <span style={{ display: "flex", gap: 1, color: count > 0 ? "#F59E0B" : "#D1D5DB" }}>
      {[1,2,3,4,5].map(i => i <= count ? <StarFilled key={i} size={size} /> : <StarEmpty key={i} size={size} />)}
    </span>
  );
}

function availDot(status?: string) {
  if (status === "ocupado") return "#F59E0B";
  if (status === "no_disponible") return "#9CA3AF";
  return "#22C55E";
}

/* ── FilterSection (reused in drawer) ──────────────────────────────────────── */
function FilterSection({
  title, children, collapsible = false, defaultOpen = true,
}: {
  title: string; children: React.ReactNode; collapsible?: boolean; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid #E2E8F0", padding: "14px 0" }}>
      <div
        onClick={() => collapsible && setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: collapsible ? "pointer" : "default",
          marginBottom: !collapsible || open ? 10 : 0,
        }}
      >
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mute)" }}>
          // {title}
        </span>
        {collapsible && <ChevronDown open={open} />}
      </div>
      {(!collapsible || open) && children}
    </div>
  );
}

/* ── SidebarFilters (used in "Más filtros" drawer) ──────────────────────────── */
type FiltersProps = {
  allMaestros: Master[];
  soloVerificados: boolean; setSoloVerificados: (v: boolean) => void;
  minRating: number; setMinRating: (v: number) => void;
  soloDisponibles: boolean; setSoloDisponibles: (v: boolean) => void;
  region: string; setRegion: (v: string) => void;
  ciudad: string; setCiudad: (v: string) => void;
  especialidades: string[]; toggleEspecialidad: (sp: string) => void;
  minExp: number; setMinExp: (v: number) => void;
  urgenciaCategoria: string; setUrgenciaCategoria: (v: string) => void;
  activeCount: number; onClearAll: () => void;
  radioPrefix?: string;
};

function SidebarFilters(p: FiltersProps) {
  const rp = p.radioPrefix ?? "sb";
  const [specSearch, setSpecSearch] = useState("");

  const specialtyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of p.allMaestros) for (const sp of m.specialties) counts[sp] = (counts[sp] ?? 0) + 1;
    return counts;
  }, [p.allMaestros]);

  const allSpecs = useMemo(() =>
    Object.entries(specialtyCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    [specialtyCounts]
  );
  const visibleSpecs = useMemo(() => {
    const q = specSearch.toLowerCase();
    return q ? allSpecs.filter(s => s.name.toLowerCase().includes(q)) : allSpecs;
  }, [allSpecs, specSearch]);

  const citiesInRegion = useMemo(() => REGIONS.find(r => r.name === p.region)?.cities ?? [], [p.region]);

  const RL: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "3px 0", fontSize: 13, color: "var(--ink)" };
  const CB: React.CSSProperties = { width: 15, height: 15, accentColor: "#1B2B4B", cursor: "pointer", flexShrink: 0 };

  return (
    <>
      {p.activeCount > 0 && (
        <div style={{ padding: "10px 0 0" }}>
          <button onClick={p.onClearAll} style={{ width: "100%", padding: "7px 12px", background: "none", border: "1px solid #E2E8F0", fontSize: 12, color: "var(--mute)", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace" }}>
            Limpiar {p.activeCount} filtro{p.activeCount !== 1 ? "s" : ""}
          </button>
        </div>
      )}
      <FilterSection title="Verificación">
        <label style={RL}>
          <input type="checkbox" style={CB} checked={p.soloVerificados} onChange={e => p.setSoloVerificados(e.target.checked)} />
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>Solo maestros verificados</span>
        </label>
      </FilterSection>
      <FilterSection title="Calificación mínima">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {([{ val: 0, label: "Cualquier calificación" }, { val: 3, label: "3+ estrellas" }, { val: 4, label: "4+ estrellas" }, { val: 5, label: "5 estrellas" }] as const).map(({ val, label }) => (
            <label key={val} style={RL}>
              <input type="radio" name={`${rp}-minRating`} style={CB} checked={p.minRating === val} onChange={() => p.setMinRating(val)} />
              {val > 0 ? <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Stars count={val} size={12} /><span style={{ fontSize: 12.5 }}>{label}</span></span> : <span style={{ fontSize: 12.5 }}>{label}</span>}
            </label>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Disponibilidad">
        <label style={RL}>
          <input type="checkbox" style={CB} checked={p.soloDisponibles} onChange={e => p.setSoloDisponibles(e.target.checked)} />
          <span style={{ fontSize: 13 }}>Ocultar no disponibles</span>
        </label>
      </FilterSection>
      <FilterSection title="Urgencias 🚨">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={RL}><input type="radio" name={`${rp}-urgencia`} style={CB} checked={p.urgenciaCategoria === ""} onChange={() => p.setUrgenciaCategoria("")} /><span style={{ fontSize: 12.5 }}>Sin filtro</span></label>
          {URGENCIA_CATS.map(cat => (
            <label key={cat} style={{ ...RL, color: p.urgenciaCategoria === cat ? "#DC2626" : "var(--ink)" }}>
              <input type="radio" name={`${rp}-urgencia`} style={{ ...CB, accentColor: "#DC2626" }} checked={p.urgenciaCategoria === cat} onChange={() => p.setUrgenciaCategoria(cat)} />
              <span style={{ fontSize: 12.5, fontWeight: p.urgenciaCategoria === cat ? 700 : 400 }}>{cat}</span>
            </label>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Región" collapsible defaultOpen={!!p.region}>
        <select value={p.region} onChange={e => { p.setRegion(e.target.value); p.setCiudad(""); }} style={{ width: "100%", height: 38, border: "1.5px solid #E2E8F0", padding: "0 8px", fontSize: 13, background: "#fff", cursor: "pointer" }}>
          <option value="">Toda Chile</option>
          {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
        </select>
        {p.region && citiesInRegion.length > 0 && (
          <select value={p.ciudad} onChange={e => p.setCiudad(e.target.value)} style={{ width: "100%", height: 38, border: "1.5px solid #E2E8F0", padding: "0 8px", fontSize: 13, background: "#fff", cursor: "pointer", marginTop: 8 }}>
            <option value="">Toda la región</option>
            {citiesInRegion.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </FilterSection>
      <FilterSection title="Especialidad" collapsible defaultOpen={p.especialidades.length > 0}>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--mute)", display: "flex" }}><SearchIcon /></span>
          <input value={specSearch} onChange={e => setSpecSearch(e.target.value)} placeholder="Buscar especialidad..." style={{ width: "100%", height: 34, border: "1.5px solid #E2E8F0", paddingLeft: 32, paddingRight: 8, fontSize: 12.5, background: "#fff", boxSizing: "border-box" }} />
        </div>
        <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {visibleSpecs.map(({ name, count }) => (
            <label key={name} style={{ ...RL, justifyContent: "space-between", paddingLeft: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <input type="checkbox" style={CB} checked={p.especialidades.includes(name)} onChange={() => p.toggleEspecialidad(name)} />
                <span style={{ fontSize: 12.5 }}>{name}</span>
              </span>
              <span style={{ fontSize: 10.5, fontFamily: "var(--font-jetbrains), monospace", color: "var(--mute)", background: "var(--bg-2)", padding: "1px 6px", flexShrink: 0 }}>{count}</span>
            </label>
          ))}
          {visibleSpecs.length === 0 && <span style={{ fontSize: 12, color: "var(--mute)", padding: "8px 0" }}>Sin resultados</span>}
        </div>
      </FilterSection>
      <FilterSection title="Experiencia">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {([{ val: 0, label: "Cualquiera" }, { val: 1, label: "1+ año" }, { val: 5, label: "5+ años" }, { val: 10, label: "10+ años" }] as const).map(({ val, label }) => (
            <label key={val} style={RL}>
              <input type="radio" name={`${rp}-minExp`} style={CB} checked={p.minExp === val} onChange={() => p.setMinExp(val)} />
              <span style={{ fontSize: 12.5 }}>{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </>
  );
}

/* ── MasterCard (rediseñado) ────────────────────────────────────────────────── */
function MasterCard({ m, idx, isFav, onToggleFav, isReal }: {
  m: Master; idx: number; isFav: boolean; onToggleFav: () => void; isReal?: boolean;
}) {
  const [bg, fg] = AV_COLORS[idx % AV_COLORS.length];
  const [hovered, setHovered] = useState(false);

  const waUrl = m.social?.whatsapp
    ? `https://wa.me/${m.social.whatsapp.replace(/\D/g, "")}`
    : m.phone
    ? `https://wa.me/${m.phone.replace(/\D/g, "")}`
    : null;

  const isAvailable = (m.disponibilidad ?? "disponible") === "disponible";

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? "#1B2B4B" : "#E2E8F0"}`,
        borderRadius: 12,
        boxShadow: hovered ? "0 4px 20px rgba(27,43,75,0.10)" : "0 1px 4px rgba(0,0,0,0.05)",
        transition: "border-color 0.15s, box-shadow 0.15s",
        padding: "16px 18px",
        display: "flex", gap: 16, alignItems: "flex-start",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Fav button */}
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFav(); }}
        title={isFav ? "Quitar de favoritos" : "Guardar"}
        style={{
          position: "absolute", top: 14, right: 14, zIndex: 2,
          width: 28, height: 28, background: "#fff", border: "1px solid #E2E8F0",
          borderRadius: "50%", display: "grid", placeItems: "center",
          cursor: "pointer", color: isFav ? "#F97316" : "#94A3B8",
        }}
      >
        <HeartIcon filled={isFav} />
      </button>

      {/* Photo with availability dot */}
      <div style={{ position: "relative", flexShrink: 0, width: 80, height: 80, minWidth: 80 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: bg, color: fg,
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 24,
          overflow: "hidden",
          boxShadow: "0 0 0 2px #E2E8F0",
        }}>
          {m.photoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={m.photoUrl} alt={m.name} style={{ width: 80, height: 80, objectFit: "cover", objectPosition: "center center", display: "block", borderRadius: "50%" }} />
            : m.initials}
        </div>
        {/* Availability dot */}
        <span style={{
          position: "absolute", bottom: 2, right: 2,
          width: 12, height: 12, borderRadius: "50%",
          background: availDot(m.disponibilidad),
          border: "2px solid #fff",
        }} />
      </div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 3 }}>
          <Link href={`/maestro/${m.id}`} style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 15.5, color: "#1B2B4B", textDecoration: "none" }}>
            {m.name}
          </Link>
          {m.verified && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "#EFF6FF", color: "#1D4ED8",
              border: "1px solid #BFDBFE",
              padding: "2px 7px", borderRadius: 999,
              fontSize: 10, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace",
              letterSpacing: "0.04em", textTransform: "uppercase", flexShrink: 0,
            }}>
              <CheckIcon /> VERIFICADO
            </span>
          )}
          {isReal && !m.verified && (
            <span style={{ fontSize: 9, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, background: "#1B2B4B", color: "#fff", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.06em" }}>NUEVO</span>
          )}
          {m.atiendeUrgencias && (
            <span style={{ fontSize: 9.5, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, color: "#DC2626", background: "#FEF2F2", border: "1px solid #FCA5A5", padding: "2px 6px", borderRadius: 4 }}>
              🚨 Urgencias
            </span>
          )}
        </div>

        {/* Main specialty in orange */}
        {m.specialties[0] && (
          <div style={{ fontSize: 13, color: "#F97316", fontWeight: 600, marginBottom: 7 }}>
            {m.specialties[0]}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 12, color: "#64748B", marginBottom: 9 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Stars count={Math.round(m.rating)} size={11} />
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
              {m.rating > 0 ? `${m.rating.toFixed(1)} · ${m.jobs} reseña${m.jobs !== 1 ? "s" : ""}` : "Sin reseñas"}
            </span>
          </span>
          {m.city && (
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              📍 {m.city}
            </span>
          )}
          {m.yearsExp > 0 && (
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
              {m.yearsExp} año{m.yearsExp !== 1 ? "s" : ""} exp.
            </span>
          )}
        </div>

        {/* Specialty pills */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
          {m.specialties.slice(0, 4).map(sp => (
            <span key={sp} style={{
              background: "#F1F5F9", color: "#475569",
              padding: "3px 9px", borderRadius: 999,
              fontSize: 11, fontWeight: 500,
            }}>{sp}</span>
          ))}
          {m.specialties.length > 4 && (
            <span style={{ fontSize: 11, color: "#94A3B8", alignSelf: "center" }}>
              +{m.specialties.length - 4}
            </span>
          )}
        </div>

        {/* Bottom row: availability + action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {isAvailable && (
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, background: "#22C55E", borderRadius: "50%", flexShrink: 0 }} />
              Disponible esta semana
            </span>
          )}
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <Link
              href={`/maestro/${m.id}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                border: "1.5px solid #1B2B4B", color: "#1B2B4B",
                padding: "7px 14px", borderRadius: 8,
                fontSize: 12.5, fontWeight: 700, textDecoration: "none",
                whiteSpace: "nowrap", background: "#fff",
              }}
            >
              Ver perfil →
            </Link>
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  fetch("/api/track-contacto", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ maestro_id: m.id }),
                  }).catch(() => {});
                }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#25D366", color: "#fff",
                  padding: "7px 14px", borderRadius: 8,
                  fontSize: 12.5, fontWeight: 700, textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <WhatsAppIcon size={14} /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sort type ──────────────────────────────────────────────────────────────── */
type SortKey = "relevantes" | "rating" | "experiencia" | "recientes";

/* ── Quick-filter pill button ───────────────────────────────────────────────── */
function FilterPill({ label, active, onClick, activeColor = "#1B2B4B" }: { label: string; active: boolean; onClick: () => void; activeColor?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "0 14px", height: 36, borderRadius: 999,
        border: `1.5px solid ${active ? activeColor : "#E2E8F0"}`,
        background: active ? activeColor : "#fff",
        color: active ? "#fff" : "#475569",
        fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
        transition: "all 0.15s",
        fontFamily: "var(--font-archivo), sans-serif",
      }}
    >
      {label}
    </button>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function BuscarContent({ allMaestros, realIds }: { allMaestros: Master[]; realIds: Set<string> }) {
  const searchParams = useSearchParams();

  const [q, setQ]                                = useState(searchParams.get("q") ?? "");
  const [soloVerificados, setSoloVerificados]     = useState(false);
  const [minRating, setMinRating]                 = useState(0);
  const [soloDisponibles, setSoloDisponibles]     = useState(false);
  const [region, setRegion]                       = useState(searchParams.get("region") ?? "");
  const [ciudad, setCiudad]                       = useState(searchParams.get("ciudad") ?? "");
  const [especialidades, setEspecialidades]       = useState<string[]>(
    searchParams.get("esp") ? [searchParams.get("esp")!] : []
  );
  const [minExp, setMinExp]                       = useState(0);
  const [urgenciaCategoria, setUrgenciaCategoria] = useState("");
  const [sortBy, setSortBy]                       = useState<SortKey>("relevantes");
  const [moreOpen, setMoreOpen]                   = useState(false);
  const moreRef                                   = useRef<HTMLDivElement>(null);
  const { favs, toggle } = useFavorites();

  useEffect(() => {
    if (!moreOpen) return;
    function handleDown(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [moreOpen]);

  function toggleEspecialidad(sp: string) {
    setEspecialidades(prev => prev.includes(sp) ? prev.filter(x => x !== sp) : [...prev, sp]);
  }

  const activeFilterCount = [
    soloVerificados, minRating > 0, soloDisponibles,
    !!region, !!ciudad, especialidades.length > 0, minExp > 0, !!urgenciaCategoria,
  ].filter(Boolean).length;

  function clearAll() {
    setQ(""); setSoloVerificados(false); setMinRating(0); setSoloDisponibles(false);
    setRegion(""); setCiudad(""); setEspecialidades([]); setMinExp(0); setUrgenciaCategoria("");
  }

  /* ── Filter logic (unchanged) ── */
  const filtered = useMemo(() => {
    return allMaestros.filter(m => {
      const avail = m.disponibilidad ?? "disponible";
      if (soloDisponibles && avail === "no_disponible") return false;
      if (soloVerificados && !m.verified) return false;
      if (urgenciaCategoria) {
        if (!m.atiendeUrgencias) return false;
        if (urgenciaCategoria !== "Otros") {
          const matchNames = URGENCIA_MATCH[urgenciaCategoria] ?? [urgenciaCategoria];
          const hasMatch = matchNames.some(name =>
            m.specialties.includes(name) || (m.especialidadesUrgencia ?? []).includes(name)
          );
          if (!hasMatch) return false;
        }
      }
      if (minRating > 0 && m.jobs > 0 && m.rating < minRating) return false;
      if (minExp > 0 && m.yearsExp < minExp) return false;
      if (ciudad) {
        if (m.city !== ciudad && !m.sector.includes(ciudad)) return false;
      } else if (region) {
        const cities = REGIONS.find(r => r.name === region)?.cities ?? [];
        if (!cities.some(c => m.city === c || m.sector.includes(c))) return false;
      }
      if (especialidades.length > 0 && !especialidades.some(sp => m.specialties.includes(sp))) return false;
      if (q.trim()) {
        const needle = q.toLowerCase();
        const hay = `${m.name} ${m.specialties.join(" ")} ${m.city} ${m.sector} ${m.description}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [allMaestros, soloDisponibles, soloVerificados, urgenciaCategoria, minRating, minExp, ciudad, region, especialidades, q]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === "rating") arr.sort((a, b) => { if (a.jobs === 0 && b.jobs > 0) return 1; if (a.jobs > 0 && b.jobs === 0) return -1; return b.rating - a.rating || b.jobs - a.jobs; });
    if (sortBy === "experiencia") arr.sort((a, b) => b.yearsExp - a.yearsExp);
    if (sortBy === "relevantes") arr.sort((a, b) => { if (a.verified !== b.verified) return a.verified ? -1 : 1; if (a.jobs === 0 && b.jobs > 0) return 1; if (a.jobs > 0 && b.jobs === 0) return -1; return b.rating - a.rating; });
    return arr;
  }, [filtered, sortBy]);

  const sharedProps: FiltersProps = {
    allMaestros, soloVerificados, setSoloVerificados, minRating, setMinRating,
    soloDisponibles, setSoloDisponibles, region, setRegion, ciudad, setCiudad,
    especialidades, toggleEspecialidad, minExp, setMinExp,
    urgenciaCategoria, setUrgenciaCategoria,
    activeCount: activeFilterCount, onClearAll: clearAll,
  };

  return (
    <>
      {/* ── Header ── */}
      <div style={{
        background: "#1B2B4B",
        backgroundImage: "repeating-linear-gradient(135deg, transparent 0 40px, rgba(255,255,255,0.02) 40px 44px)",
        padding: "40px 0 36px",
      }}>
        <div className="wrap">
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#F97316" }}>
            // Directorio de maestros
          </span>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", color: "#fff", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, margin: "8px 0 6px", letterSpacing: "-0.02em" }}>
            Buscar maestros
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", margin: 0, fontSize: 15.5 }}>
            Encuentra al profesional ideal para tu proyecto — {allMaestros.length} registrados en toda Chile
          </p>
        </div>
      </div>

      {/* ── Horizontal filter bar ── */}
      <div style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #E2E8F0" }}>
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", flexWrap: "wrap" }}>

            {/* Text search */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #E2E8F0", background: "#F8FAFC", padding: "0 12px", height: 38, borderRadius: 8, width: 220, flexShrink: 0 }}>
              <SearchIcon />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Nombre, especialidad..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, background: "transparent" }}
              />
              {q && <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex" }}><CloseIcon /></button>}
            </div>

            {/* Specialty dropdown */}
            <select
              value={especialidades[0] ?? ""}
              onChange={e => {
                const v = e.target.value;
                setEspecialidades(v ? [v] : []);
              }}
              style={{ height: 38, border: "1.5px solid #E2E8F0", padding: "0 10px", fontSize: 13, background: "#fff", cursor: "pointer", borderRadius: 8, color: especialidades.length ? "#1B2B4B" : "#94A3B8" }}
            >
              <option value="">Especialidad</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Region dropdown */}
            <select
              value={region}
              onChange={e => { setRegion(e.target.value); setCiudad(""); }}
              style={{ height: 38, border: "1.5px solid #E2E8F0", padding: "0 10px", fontSize: 13, background: "#fff", cursor: "pointer", borderRadius: 8, color: region ? "#1B2B4B" : "#94A3B8" }}
            >
              <option value="">Región</option>
              {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>

            {/* Quick filter pills */}
            <FilterPill label="✓ Verificados" active={soloVerificados} onClick={() => setSoloVerificados(v => !v)} />
            <FilterPill label="🟢 Disponible" active={soloDisponibles} onClick={() => setSoloDisponibles(v => !v)} />
            <FilterPill label="⭐ 4+ estrellas" active={minRating >= 4} onClick={() => setMinRating(r => r >= 4 ? 0 : 4)} />
            <FilterPill label="🚨 Urgencias" active={urgenciaCategoria === "Otros"} onClick={() => setUrgenciaCategoria(c => c === "Otros" ? "" : "Otros")} activeColor="#DC2626" />

            {/* Más filtros — dropdown */}
            <div ref={moreRef} style={{ position: "relative" }}>
              <button
                onClick={() => setMoreOpen(o => !o)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "0 14px", height: 36, borderRadius: 8,
                  border: `1.5px solid ${moreOpen || activeFilterCount > 3 ? "#1B2B4B" : "#E2E8F0"}`,
                  background: moreOpen || activeFilterCount > 3 ? "#1B2B4B" : "#fff",
                  color: moreOpen || activeFilterCount > 3 ? "#fff" : "#475569",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  fontFamily: "var(--font-archivo), sans-serif",
                }}
              >
                <FilterIcon /> Más filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </button>

              {moreOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200,
                  background: "#fff", borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  border: "1px solid #E2E8F0",
                  width: 360, maxHeight: 500, overflowY: "auto",
                  padding: "0 20px 16px",
                }}>
                  <SidebarFilters {...sharedProps} radioPrefix="more" />
                </div>
              )}
            </div>

            {/* Active filters clear */}
            {activeFilterCount > 0 && (
              <button onClick={clearAll} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 12, padding: "0 4px" }}>
                <CloseIcon size={10} /> Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 64 }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* Left: results list */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Count + sort */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 13, color: "#64748B", fontFamily: "var(--font-jetbrains), monospace" }}>
                {sorted.length === allMaestros.length
                  ? `${sorted.length} maestros encontrados`
                  : `${sorted.length} resultado${sorted.length !== 1 ? "s" : ""} de ${allMaestros.length} maestros`}
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortKey)}
                style={{ height: 36, border: "1.5px solid #E2E8F0", padding: "0 10px", fontSize: 13, background: "#fff", cursor: "pointer", borderRadius: 8 }}
              >
                <option value="relevantes">Más relevantes</option>
                <option value="rating">Mejor puntuación</option>
                <option value="experiencia">Más experiencia</option>
                <option value="recientes">Recién agregados</option>
              </select>
            </div>

            {sorted.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sorted.map((m, i) => (
                  <MasterCard
                    key={m.id} m={m} idx={i}
                    isFav={favs.has(m.id)} onToggleFav={() => toggle(m.id)}
                    isReal={realIds.has(m.id)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "64px 24px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 20, color: "#1B2B4B", marginBottom: 8 }}>Sin resultados</div>
                <p style={{ fontSize: 14.5, color: "#64748B", marginBottom: 24 }}>No encontramos maestros con esos filtros. Intenta ampliar la búsqueda.</p>
                <button onClick={clearAll} style={{ height: 44, padding: "0 24px", background: "#F97316", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", borderRadius: 8, fontFamily: "var(--font-archivo), sans-serif" }}>
                  Ver todos los maestros
                </button>
              </div>
            )}
          </div>

          {/* Right: tips sidebar — hidden on mobile via CSS */}
          <div className="buscar-tips" style={{ width: 280, flexShrink: 0, position: "sticky", top: 80 }}>
            <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "20px" }}>
              <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 15, color: "#1B2B4B", marginBottom: 16 }}>
                Consejos para elegir
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: "🛡️", title: "Elige maestros verificados", text: "Todos pasan por verificación de identidad" },
                  { icon: "⭐", title: "Revisa las reseñas", text: "Lee opiniones de otros clientes" },
                  { icon: "💬", title: "Comunícate antes", text: "Habla por WhatsApp antes de contratar" },
                  { icon: "🔒", title: "Paga de forma segura", text: "Nunca pagues adelantado" },
                ].map(tip => (
                  <div key={tip.title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{tip.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1B2B4B", marginBottom: 2 }}>{tip.title}</div>
                      <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.4 }}>{tip.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #E2E8F0", marginTop: 20, paddingTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>
                  ¿No encuentras lo que buscas?
                </div>
                <Link href="/empleos/publicar" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: "#1B2B4B", color: "#fff",
                  padding: "10px 16px", borderRadius: 8,
                  fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 13,
                  textDecoration: "none",
                }}>
                  Publicar proyecto →
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

    </>
  );
}
