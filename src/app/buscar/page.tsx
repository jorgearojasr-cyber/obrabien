"use client";

import { Suspense } from "react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SAMPLE_MASTERS, SPECIALTIES, REGIONS, type Master } from "@/lib/data";
import { useFavorites } from "@/hooks/useFavorites";

/* ---- icons ---- */
function StarIcon() {
  return <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 17.3 5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6L18.2 21z" /></svg>;
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>;
}
function ArrowIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
}
function CloseIcon() {
  return <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>;
}
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const AV_COLORS: [string, string][] = [["#14375F", "#fff"], ["#E86C1C", "#fff"], ["#ECEAE3", "#14375F"]];
const POPULAR_SPECS = ["Albañil", "Gasfiter", "Electricista", "Carpintero", "Pintor", "Ceramista"];

/* ---- card ---- */
function MasterCard({ m, idx, isFav, onToggleFav }: { m: Master; idx: number; isFav: boolean; onToggleFav: () => void }) {
  const [bg, fg] = AV_COLORS[idx % AV_COLORS.length];
  return (
    <div style={{ position: "relative" }}>
      {/* Heart button — outside Link so click doesn't navigate */}
      <button
        onClick={e => { e.preventDefault(); onToggleFav(); }}
        title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
        style={{
          position: "absolute", top: 12, right: 12, zIndex: 2,
          width: 32, height: 32, background: "#fff", border: "1px solid var(--line)",
          borderRadius: "50%", display: "grid", placeItems: "center",
          cursor: "pointer", color: isFav ? "var(--orange)" : "var(--mute)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)", transition: "color .15s",
        }}
      >
        <HeartIcon filled={isFav} />
      </button>

      <Link href={`/maestro/${m.id}`} className="card hoverable col" style={{ textDecoration: "none", padding: 0, borderRadius: 10 }}>
        <div className="row gap-12" style={{ padding: 16, borderBottom: "1px solid var(--line)" }}>
          <div style={{
            width: 64, height: 64, background: bg, color: fg, display: "grid",
            placeItems: "center", fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 800, fontSize: 20, flexShrink: 0, border: "1px solid var(--ink)",
          }}>
            {m.initials}
          </div>
          <div className="col gap-4" style={{ flex: 1, minWidth: 0, paddingRight: 36 }}>
            <div className="row center gap-6 wrap-flex">
              <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 16, fontWeight: 700, lineHeight: 1.15 }}>{m.name}</span>
              {m.verified && <span className="verified"><CheckIcon /> Verificado</span>}
            </div>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 600 }}>
              <StarIcon /> {m.rating.toFixed(1)}
              <span style={{ color: "var(--mute)", fontWeight: 500 }}>· {m.jobs} trabajos</span>
            </span>
            <span style={{ fontSize: 13, color: "var(--mute)" }}>📍 {m.city} · {m.sector}</span>
          </div>
        </div>
        <div className="col gap-8" style={{ padding: 16 }}>
          <div className="row gap-6 wrap-flex">
            {m.specialties.map(sp => <span key={sp} className="chip">{sp}</span>)}
          </div>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
            {m.description}
          </p>
          <div className="row between center" style={{ marginTop: 4 }}>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--mute)" }}>
              {m.yearsExp} años de exp.
            </span>
            <span style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 4, color: "var(--navy)" }}>
              Ver perfil <ArrowIcon />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ---- chip with remove ---- */
function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "var(--navy)", color: "#fff",
      padding: "5px 10px 5px 12px", fontSize: 12.5, fontWeight: 500,
    }}>
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex", padding: 0 }}>
        <CloseIcon />
      </button>
    </span>
  );
}

/* ---- page ---- */
function BuscarContent() {
  const searchParams = useSearchParams();
  const [specialty, setSpecialty] = useState(searchParams.get("esp") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");
  const [city, setCity] = useState(searchParams.get("ciudad") ?? "");
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const { favs, toggle } = useFavorites();

  const citiesInRegion = useMemo(
    () => REGIONS.find(r => r.name === region)?.cities ?? [],
    [region],
  );

  function handleRegionChange(val: string) {
    setRegion(val);
    setCity(""); // reset ciudad al cambiar región
  }

  const results = useMemo(() => {
    return SAMPLE_MASTERS.filter(m => {
      if (specialty && !m.specialties.includes(specialty)) return false;
      if (city && m.city !== city) return false;
      if (!city && region) {
        const cities = REGIONS.find(r => r.name === region)?.cities ?? [];
        if (!cities.includes(m.city)) return false;
      }
      if (q) {
        const needle = q.toLowerCase();
        const haystack = `${m.name} ${m.specialties.join(" ")} ${m.city} ${m.description}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [specialty, region, city, q]);

  const hasFilters = !!(specialty || region || city || q);

  function clearAll() {
    setSpecialty(""); setRegion(""); setCity(""); setQ("");
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "60vh" }}>
      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "32px 0 28px" }}>
        <div className="wrap">
          <span className="label" style={{ color: "var(--orange)" }}>// Directorio de maestros</span>
          <h1 className="display" style={{ fontFamily: "var(--font-archivo), sans-serif", color: "#fff", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, marginTop: 6 }}>
            Buscar maestros
          </h1>
          <p style={{ color: "#9AA7B5", marginTop: 8, fontSize: 15 }}>
            {SAMPLE_MASTERS.length} profesionales registrados en toda Chile
          </p>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 28, paddingBottom: 64 }}>
        {/* Panel de filtros */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 20, marginBottom: 20 }}>
          {/* Búsqueda libre */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid var(--ink)", background: "#fff", padding: "0 14px", marginBottom: 16 }}>
            <SearchIcon />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por nombre, especialidad o descripción…"
              style={{ flex: 1, border: "none", outline: "none", height: 44, fontSize: 14.5, background: "transparent" }}
            />
            {q && (
              <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mute)", display: "flex" }}>
                <CloseIcon />
              </button>
            )}
          </div>

          {/* Selectores en fila */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
            {/* Especialidad */}
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label>Especialidad</label>
              <select className="ob-select" value={specialty} onChange={e => setSpecialty(e.target.value)}>
                <option value="">Todas las especialidades</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Región */}
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label>Región</label>
              <select className="ob-select" value={region} onChange={e => handleRegionChange(e.target.value)}>
                <option value="">Todas las regiones</option>
                {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>

            {/* Ciudad — solo aparece cuando hay región seleccionada */}
            <div className="field" style={{ flex: "1 1 180px", opacity: region ? 1 : 0.45, transition: "opacity .2s" }}>
              <label>Ciudad / comuna</label>
              <select
                className="ob-select"
                value={city}
                onChange={e => setCity(e.target.value)}
                disabled={!region}
              >
                <option value="">Toda la región</option>
                {citiesInRegion.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {hasFilters && (
              <div className="field" style={{ flex: "0 0 auto" }}>
                <label>&nbsp;</label>
                <button onClick={clearAll} className="btn btn-ghost" style={{ height: 48, color: "var(--mute)", borderColor: "var(--line)", fontSize: 13 }}>
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chips de especialidades rápidas */}
        <div className="row gap-8 wrap-flex" style={{ marginBottom: 20 }}>
          {POPULAR_SPECS.map(s => {
            const active = specialty === s;
            return (
              <button key={s} onClick={() => setSpecialty(active ? "" : s)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  border: `1px solid ${active ? "var(--orange)" : "var(--navy)"}`,
                  background: active ? "var(--orange)" : "#fff",
                  color: active ? "#fff" : "var(--navy)",
                  padding: "5px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 500,
                  cursor: "pointer", transition: "all .15s",
                }}>
                {active && <CloseIcon />}
                {s}
              </button>
            );
          })}
        </div>

        {/* Filtros activos */}
        {hasFilters && (
          <div className="row gap-8 wrap-flex" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "var(--mute)", alignSelf: "center" }}>Filtros activos:</span>
            {specialty && <ActiveChip label={specialty} onRemove={() => setSpecialty("")} />}
            {region && !city && <ActiveChip label={region} onRemove={() => { setRegion(""); setCity(""); }} />}
            {city && <ActiveChip label={city} onRemove={() => setCity("")} />}
            {q && <ActiveChip label={`"${q}"`} onRemove={() => setQ("")} />}
          </div>
        )}

        {/* Contador */}
        <div style={{ fontSize: 13, color: "var(--mute)", marginBottom: 16, fontFamily: "var(--font-jetbrains), monospace" }}>
          {results.length === SAMPLE_MASTERS.length
            ? `${results.length} maestros registrados`
            : `${results.length} resultado${results.length !== 1 ? "s" : ""} de ${SAMPLE_MASTERS.length}`}
        </div>

        {/* Resultados */}
        {results.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {results.map((m, i) => (
              <MasterCard key={m.id} m={m} idx={i} isFav={favs.has(m.id)} onToggleFav={() => toggle(m.id)} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 20, color: "var(--navy)", marginBottom: 8 }}>
              Sin resultados
            </div>
            <p style={{ fontSize: 14.5, color: "var(--mute)", marginBottom: 20 }}>
              No encontramos maestros con esos filtros. Intenta ampliar la búsqueda.
            </p>
            <button onClick={clearAll} className="btn" style={{ margin: "0 auto" }}>
              Ver todos los maestros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <BuscarContent />
    </Suspense>
  );
}
