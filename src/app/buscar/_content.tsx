"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { REGIONS, type Master } from "@/lib/data";
import { useFavorites } from "@/hooks/useFavorites";
import AvailabilityBadge from "@/components/AvailabilityBadge";

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
function ArrowIcon() {
  return <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
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

/* ── Urgency categories ─────────────────────────────────────────────────────── */
const URGENCIA_CATS = ["Gasfitería","Electricidad","Cerrajería","Techumbre","Instalación de ventanas","Otros"] as const;

// Maps each urgency category to specialty names it should match (form values + display names)
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
    <span style={{ display: "flex", gap: 1, color: count > 0 ? "var(--orange)" : "#D1D5DB" }}>
      {[1,2,3,4,5].map(i => i <= count ? <StarFilled key={i} size={size} /> : <StarEmpty key={i} size={size} />)}
    </span>
  );
}

/* ── FilterSection ──────────────────────────────────────────────────────────── */
function FilterSection({
  title, children, collapsible = false, defaultOpen = true,
}: {
  title: string; children: React.ReactNode; collapsible?: boolean; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid var(--line)", padding: "14px 0" }}>
      <div
        onClick={() => collapsible && setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: collapsible ? "pointer" : "default",
          marginBottom: !collapsible || open ? 10 : 0,
        }}
      >
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.12em", color: "var(--mute)",
        }}>
          // {title}
        </span>
        {collapsible && <ChevronDown open={open} />}
      </div>
      {(!collapsible || open) && children}
    </div>
  );
}

/* ── MasterCard (horizontal) ────────────────────────────────────────────────── */
function MasterCard({ m, idx, isFav, onToggleFav, isReal }: {
  m: Master; idx: number; isFav: boolean; onToggleFav: () => void; isReal?: boolean;
}) {
  const [bg, fg] = AV_COLORS[idx % AV_COLORS.length];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: "relative", background: "#fff",
        border: `1px solid ${hovered ? "var(--navy)" : "var(--line)"}`,
        boxShadow: hovered ? "0 3px 14px rgba(0,0,0,0.07)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Fav button — sits outside the link */}
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFav(); }}
        title={isFav ? "Quitar de favoritos" : "Guardar"}
        style={{
          position: "absolute", top: 12, right: 12, zIndex: 2,
          width: 30, height: 30, background: "#fff", border: "1px solid var(--line)",
          borderRadius: "50%", display: "grid", placeItems: "center",
          cursor: "pointer", color: isFav ? "var(--orange)" : "var(--mute)",
          transition: "color .15s",
        }}
      >
        <HeartIcon filled={isFav} />
      </button>

      <Link
        href={`/maestro/${m.id}`}
        style={{
          textDecoration: "none",
          display: "flex", alignItems: "center", gap: 16,
          padding: "16px 52px 16px 16px",
        }}
      >
        {/* Photo */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
          background: bg, color: fg,
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 24,
          overflow: "hidden", border: "2px solid var(--line)",
        }}>
          {m.photoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={m.photoUrl} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : m.initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
            <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 15.5, color: "var(--ink)" }}>
              {m.name}
            </span>
            {m.verified && <span className="verified"><CheckIcon /> Verificado</span>}
            {isReal && !m.verified && (
              <span style={{ fontSize: 9, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, background: "var(--navy)", color: "#fff", padding: "2px 6px", letterSpacing: "0.06em" }}>
                NUEVO
              </span>
            )}
            {m.atiendeUrgencias && (
              <span style={{ fontSize: 9.5, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, color: "#DC2626", background: "#FEF2F2", border: "1px solid #FCA5A5", padding: "2px 6px", letterSpacing: "0.04em" }}>
                🚨 Urgencias
              </span>
            )}
          </div>

          {/* Specialties */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 7 }}>
            {m.specialties.slice(0, 4).map(sp => (
              <span key={sp} className="chip" style={{ fontSize: 11.5, padding: "2px 8px" }}>{sp}</span>
            ))}
            {m.specialties.length > 4 && (
              <span style={{ fontSize: 11.5, color: "var(--mute)", alignSelf: "center" }}>
                +{m.specialties.length - 4}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: "var(--mute)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Stars count={Math.round(m.rating)} size={12} />
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
                {m.rating > 0
                  ? `${m.rating.toFixed(1)} · ${m.jobs} reseña${m.jobs !== 1 ? "s" : ""}`
                  : "Sin reseñas"}
              </span>
            </span>
            {m.city && <span>📍 {m.city}</span>}
            {m.yearsExp > 0 && (
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
                {m.yearsExp} año{m.yearsExp !== 1 ? "s" : ""} exp.
              </span>
            )}
            <AvailabilityBadge status={m.disponibilidad} size="sm" />
          </div>
        </div>

        {/* Ver perfil */}
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "var(--navy)", color: "#fff",
          padding: "8px 14px", fontSize: 12.5, fontWeight: 700,
          whiteSpace: "nowrap", flexShrink: 0,
          opacity: hovered ? 1 : 0.82, transition: "opacity 0.15s",
        }}>
          Ver perfil <ArrowIcon />
        </span>
      </Link>
    </div>
  );
}

/* ── SidebarFilters (reused in desktop sidebar and mobile drawer) ────────────── */
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
    for (const m of p.allMaestros) {
      for (const sp of m.specialties) {
        counts[sp] = (counts[sp] ?? 0) + 1;
      }
    }
    return counts;
  }, [p.allMaestros]);

  const allSpecs = useMemo(() =>
    Object.entries(specialtyCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    [specialtyCounts]
  );

  const visibleSpecs = useMemo(() => {
    const q = specSearch.toLowerCase();
    return q ? allSpecs.filter(s => s.name.toLowerCase().includes(q)) : allSpecs;
  }, [allSpecs, specSearch]);

  const citiesInRegion = useMemo(() =>
    REGIONS.find(r => r.name === p.region)?.cities ?? [],
    [p.region]
  );

  const RL: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8,
    cursor: "pointer", padding: "3px 0", fontSize: 13, color: "var(--ink)",
  };
  const CB: React.CSSProperties = { width: 15, height: 15, accentColor: "var(--navy)", cursor: "pointer", flexShrink: 0 };

  return (
    <>
      {p.activeCount > 0 && (
        <div style={{ padding: "10px 0 0" }}>
          <button
            onClick={p.onClearAll}
            style={{
              width: "100%", padding: "7px 12px", background: "none",
              border: "1px solid var(--line)", fontSize: 12, color: "var(--mute)",
              cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            Limpiar {p.activeCount} filtro{p.activeCount !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      {/* Verificación */}
      <FilterSection title="Verificación">
        <label style={RL}>
          <input type="checkbox" style={CB} checked={p.soloVerificados} onChange={e => p.setSoloVerificados(e.target.checked)} />
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Solo maestros verificados
            <span className="verified" style={{ fontSize: 10, padding: "1px 6px" }}><CheckIcon /> ✓</span>
          </span>
        </label>
      </FilterSection>

      {/* Calificación */}
      <FilterSection title="Calificación mínima">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {([
            { val: 0, label: "Cualquier calificación" },
            { val: 3, label: "3+ estrellas" },
            { val: 4, label: "4+ estrellas" },
            { val: 5, label: "5 estrellas" },
          ] as const).map(({ val, label }) => (
            <label key={val} style={RL}>
              <input type="radio" name={`${rp}-minRating`} style={CB} checked={p.minRating === val} onChange={() => p.setMinRating(val)} />
              {val > 0 ? (
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Stars count={val} size={12} />
                  <span style={{ fontSize: 12.5 }}>{label}</span>
                </span>
              ) : (
                <span style={{ fontSize: 12.5 }}>{label}</span>
              )}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Disponibilidad */}
      <FilterSection title="Disponibilidad">
        <label style={RL}>
          <input type="checkbox" style={CB} checked={p.soloDisponibles} onChange={e => p.setSoloDisponibles(e.target.checked)} />
          <span style={{ fontSize: 13 }}>Ocultar no disponibles</span>
        </label>
      </FilterSection>

      {/* Urgencias */}
      <FilterSection title="Urgencias 🚨">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={RL}>
            <input type="radio" name={`${rp}-urgencia`} style={CB} checked={p.urgenciaCategoria === ""} onChange={() => p.setUrgenciaCategoria("")} />
            <span style={{ fontSize: 12.5 }}>Sin filtro</span>
          </label>
          {URGENCIA_CATS.map(cat => (
            <label key={cat} style={{ ...RL, color: p.urgenciaCategoria === cat ? "#DC2626" : "var(--ink)" }}>
              <input type="radio" name={`${rp}-urgencia`} style={{ ...CB, accentColor: "#DC2626" }} checked={p.urgenciaCategoria === cat} onChange={() => p.setUrgenciaCategoria(cat)} />
              <span style={{ fontSize: 12.5, fontWeight: p.urgenciaCategoria === cat ? 700 : 400 }}>{cat}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Región */}
      <FilterSection title="Región" collapsible defaultOpen={!!p.region}>
        <select
          value={p.region}
          onChange={e => { p.setRegion(e.target.value); p.setCiudad(""); }}
          style={{ width: "100%", height: 38, border: "1.5px solid var(--line)", padding: "0 8px", fontSize: 13, background: "#fff", cursor: "pointer" }}
        >
          <option value="">Toda Chile</option>
          {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
        </select>
        {p.region && citiesInRegion.length > 0 && (
          <select
            value={p.ciudad}
            onChange={e => p.setCiudad(e.target.value)}
            style={{ width: "100%", height: 38, border: "1.5px solid var(--line)", padding: "0 8px", fontSize: 13, background: "#fff", cursor: "pointer", marginTop: 8 }}
          >
            <option value="">Toda la región</option>
            {citiesInRegion.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </FilterSection>

      {/* Especialidad */}
      <FilterSection title="Especialidad" collapsible defaultOpen={p.especialidades.length > 0}>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--mute)", display: "flex" }}>
            <SearchIcon />
          </span>
          <input
            value={specSearch}
            onChange={e => setSpecSearch(e.target.value)}
            placeholder="Buscar especialidad..."
            style={{
              width: "100%", height: 34, border: "1.5px solid var(--line)",
              paddingLeft: 32, paddingRight: 8, fontSize: 12.5, background: "#fff",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {visibleSpecs.map(({ name, count }) => (
            <label key={name} style={{ ...RL, justifyContent: "space-between", paddingLeft: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <input type="checkbox" style={CB} checked={p.especialidades.includes(name)} onChange={() => p.toggleEspecialidad(name)} />
                <span style={{ fontSize: 12.5 }}>{name}</span>
              </span>
              <span style={{
                fontSize: 10.5, fontFamily: "var(--font-jetbrains), monospace",
                color: "var(--mute)", background: "var(--bg-2)", padding: "1px 6px", flexShrink: 0,
              }}>
                {count}
              </span>
            </label>
          ))}
          {visibleSpecs.length === 0 && (
            <span style={{ fontSize: 12, color: "var(--mute)", padding: "8px 0" }}>Sin resultados</span>
          )}
        </div>
      </FilterSection>

      {/* Experiencia */}
      <FilterSection title="Experiencia">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {([
            { val: 0, label: "Cualquiera" },
            { val: 1, label: "1+ año" },
            { val: 5, label: "5+ años" },
            { val: 10, label: "10+ años" },
          ] as const).map(({ val, label }) => (
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

/* ── Sort type ──────────────────────────────────────────────────────────────── */
type SortKey = "relevantes" | "rating" | "experiencia" | "recientes";

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function BuscarContent({ allMaestros, realIds }: { allMaestros: Master[]; realIds: Set<string> }) {
  const searchParams = useSearchParams();

  const [q, setQ]                              = useState(searchParams.get("q") ?? "");
  const [soloVerificados, setSoloVerificados]   = useState(false);
  const [minRating, setMinRating]               = useState(0);
  const [soloDisponibles, setSoloDisponibles]   = useState(false);
  const [region, setRegion]                     = useState(searchParams.get("region") ?? "");
  const [ciudad, setCiudad]                     = useState(searchParams.get("ciudad") ?? "");
  const [especialidades, setEspecialidades]     = useState<string[]>(
    searchParams.get("esp") ? [searchParams.get("esp")!] : []
  );
  const [minExp, setMinExp]                     = useState(0);
  const [urgenciaCategoria, setUrgenciaCategoria] = useState("");
  const [sortBy, setSortBy]                     = useState<SortKey>("relevantes");
  const [mobileOpen, setMobileOpen]             = useState(false);
  const { favs, toggle } = useFavorites();

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
      // Maestros with no reviews yet always pass the rating filter — they're new
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
    if (sortBy === "rating") {
      arr.sort((a, b) => {
        if (a.jobs === 0 && b.jobs > 0) return 1;
        if (a.jobs > 0 && b.jobs === 0) return -1;
        return b.rating - a.rating || b.jobs - a.jobs;
      });
    }
    if (sortBy === "experiencia") arr.sort((a, b) => b.yearsExp - a.yearsExp);
    if (sortBy === "relevantes") {
      arr.sort((a, b) => {
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        if (a.jobs === 0 && b.jobs > 0) return 1;
        if (a.jobs > 0 && b.jobs === 0) return -1;
        return b.rating - a.rating;
      });
    }
    return arr;
  }, [filtered, sortBy]);

  const sharedProps: FiltersProps = {
    allMaestros,
    soloVerificados, setSoloVerificados,
    minRating, setMinRating,
    soloDisponibles, setSoloDisponibles,
    region, setRegion,
    ciudad, setCiudad,
    especialidades, toggleEspecialidad,
    minExp, setMinExp,
    urgenciaCategoria, setUrgenciaCategoria,
    activeCount: activeFilterCount,
    onClearAll: clearAll,
  };

  return (
    <>
      {/* Media query — sidebar hidden on mobile */}
      <style>{`
        @media (max-width: 767px) {
          .buscar-sidebar  { display: none !important; }
          .buscar-mob-bar  { display: flex !important; }
          .buscar-ver-btn  { display: none !important; }
        }
        @media (min-width: 768px) {
          .buscar-mob-bar  { display: none !important; }
        }
      `}</style>

      {/* Navy header */}
      <div style={{ background: "var(--navy)", padding: "32px 0 28px" }}>
        <div className="wrap">
          <span className="label" style={{ color: "var(--orange)" }}>// Directorio de maestros</span>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", color: "#fff", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, margin: "6px 0 0" }}>
            Buscar maestros
          </h1>
          <p style={{ color: "#9AA7B5", marginTop: 6, fontSize: 15 }}>
            {allMaestros.length} profesionales registrados en toda Chile
          </p>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 64 }}>

        {/* Mobile top bar */}
        <div className="buscar-mob-bar" style={{ display: "none", marginBottom: 14, gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              height: 42, padding: "0 16px",
              border: `1.5px solid ${activeFilterCount > 0 ? "var(--navy)" : "var(--line)"}`,
              background: activeFilterCount > 0 ? "var(--navy)" : "#fff",
              color: activeFilterCount > 0 ? "#fff" : "var(--ink)",
              fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              fontFamily: "var(--font-archivo), sans-serif",
            }}
          >
            <FilterIcon />
            Filtros {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
          </button>
          <span style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
            {sorted.length} resultado{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* ── LEFT sidebar ── */}
          <div
            className="buscar-sidebar"
            style={{ width: 260, flexShrink: 0, position: "sticky", top: 20, maxHeight: "calc(100vh - 40px)", overflowY: "auto" }}
          >
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "0 16px 8px" }}>
              <SidebarFilters {...sharedProps} radioPrefix="desktop" />
            </div>
          </div>

          {/* ── RIGHT main ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Top bar: search + sort + count */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                {/* Search */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  border: "1.5px solid var(--ink)", background: "#fff",
                  padding: "0 12px", flex: 1, minWidth: 180, height: 44,
                }}>
                  <SearchIcon />
                  <input
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder="Buscar por nombre, especialidad..."
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent" }}
                  />
                  {q && (
                    <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mute)", display: "flex" }}>
                      <CloseIcon />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortKey)}
                  style={{ height: 44, border: "1.5px solid var(--line)", padding: "0 10px", fontSize: 13, background: "#fff", cursor: "pointer", flexShrink: 0 }}
                >
                  <option value="relevantes">Más relevantes</option>
                  <option value="rating">Mejor puntuación</option>
                  <option value="experiencia">Más experiencia</option>
                  <option value="recientes">Recién agregados</option>
                </select>
              </div>

              {/* Results count */}
              <div style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                {sorted.length === allMaestros.length
                  ? `${sorted.length} maestros encontrados`
                  : `${sorted.length} resultado${sorted.length !== 1 ? "s" : ""} de ${allMaestros.length} maestros`}
              </div>
            </div>

            {/* Results */}
            {sorted.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sorted.map((m, i) => (
                  <MasterCard
                    key={m.id} m={m} idx={i}
                    isFav={favs.has(m.id)} onToggleFav={() => toggle(m.id)}
                    isReal={realIds.has(m.id)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "64px 24px", background: "#fff", border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 20, color: "var(--navy)", marginBottom: 8 }}>
                  Sin resultados
                </div>
                <p style={{ fontSize: 14.5, color: "var(--mute)", marginBottom: 24 }}>
                  No encontramos maestros con esos filtros. Intenta ampliar la búsqueda.
                </p>
                <button
                  onClick={clearAll}
                  style={{
                    height: 44, padding: "0 24px", background: "var(--orange)", color: "#fff",
                    border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
                    fontFamily: "var(--font-archivo), sans-serif",
                  }}
                >
                  Ver todos los maestros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile bottom drawer ── */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99 }}
          />
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
            background: "#fff", maxHeight: "84vh", overflowY: "auto",
            borderTop: "2.5px solid var(--navy)",
          }}>
            {/* Drawer header */}
            <div style={{
              position: "sticky", top: 0, background: "#fff", zIndex: 1,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "15px 20px", borderBottom: "1px solid var(--line)",
            }}>
              <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--ink)" }}>
                Filtros {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
              </span>
              <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", display: "flex" }}>
                <CloseIcon size={20} />
              </button>
            </div>

            {/* Filters */}
            <div style={{ padding: "0 20px" }}>
              <SidebarFilters {...sharedProps} radioPrefix="mobile" />
            </div>

            {/* Footer buttons */}
            <div style={{ padding: "14px 20px 28px", borderTop: "1px solid var(--line)", display: "flex", gap: 10 }}>
              <button
                onClick={() => { clearAll(); setMobileOpen(false); }}
                style={{
                  flex: 1, height: 46, border: "1.5px solid var(--line)", background: "#fff",
                  color: "var(--mute)", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  fontFamily: "var(--font-archivo), sans-serif",
                }}
              >
                Limpiar
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  flex: 2, height: 46, background: "var(--navy)", color: "#fff",
                  border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  fontFamily: "var(--font-archivo), sans-serif",
                }}
              >
                Ver {sorted.length} resultado{sorted.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
