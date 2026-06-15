"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, SPECIALTIES } from "@/lib/data";

const POPULAR = ["Albañil", "Gasfiter", "Electricista", "Carpintero", "Pintor", "Ceramista"];

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/* ── Accordion location picker ── */
function UbicacionPicker({
  region, city, onSelect,
}: {
  region: string;
  city: string;
  onSelect: (r: string, c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(region);
  const containerRef = useRef<HTMLDivElement>(null);

  // When geo detection auto-fills region, expand it in the panel
  useEffect(() => { if (region) setExpanded(region); }, [region]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const label = city ? `${city} · ${region}` : region;

  function handleRegionClick(name: string) {
    setExpanded(prev => (prev === name ? "" : name));
    onSelect(name, ""); // select region, clear city
  }

  function handleCityClick(r: string, c: string) {
    onSelect(r, c);
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onSelect("", "");
    setOpen(false);
  }

  return (
    <div ref={containerRef} style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <div className="field">
        <label>Ubicación</label>

        {/* Trigger button */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(o => !o)}
          onKeyDown={e => e.key === "Enter" && setOpen(o => !o)}
          className="home-search-input"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            border: "1.5px solid var(--ink)", background: "#fff",
            height: 40, padding: "0 10px 0 14px", cursor: "pointer",
            outline: open ? "3px solid var(--orange)" : "none",
            outlineOffset: 2,
          }}
        >
          {/* Pin icon */}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
            stroke={label ? "var(--navy)" : "var(--mute)"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M12 21s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12Z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>

          <span style={{
            flex: 1, fontSize: 15,
            color: label ? "var(--ink)" : "var(--mute)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {label || "Región o ciudad…"}
          </span>

          {(region || city) && (
            <button
              onClick={handleClear}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", padding: 2, color: "var(--mute)", flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          )}

          {/* Chevron */}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
            stroke="var(--mute)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Dropdown panel */}
        {open && (
          <div style={{
            position: "absolute", top: "calc(100% + 3px)", left: 0,
            minWidth: "100%", width: "max-content", maxWidth: "min(340px, 90vw)",
            background: "#fff", border: "1.5px solid var(--ink)",
            zIndex: 200, maxHeight: 300, overflowY: "auto",
            boxShadow: "0 12px 32px rgba(14,39,66,0.14)",
          }}>
            {REGIONS.map(r => {
              const isExpanded = expanded === r.name;
              const regionActive = region === r.name && !city;
              return (
                <div key={r.id}>
                  {/* Region row */}
                  <div
                    onClick={() => handleRegionClick(r.name)}
                    style={{
                      padding: "9px 12px",
                      display: "flex", alignItems: "center", gap: 10,
                      cursor: "pointer",
                      background: regionActive ? "var(--navy)" : isExpanded ? "var(--bg-2)" : "#fff",
                      color: regionActive ? "#fff" : "var(--ink)",
                      fontSize: 13.5, fontWeight: 500,
                      borderBottom: "1px solid var(--line)",
                      userSelect: "none",
                    }}
                  >
                    <span style={{ flex: 1 }}>{r.name}</span>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0, opacity: 0.55, transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform .15s" }}
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </div>

                  {/* Cities */}
                  {isExpanded && r.cities.map(c => {
                    const active = city === c && region === r.name;
                    return (
                      <div
                        key={c}
                        onClick={() => handleCityClick(r.name, c)}
                        style={{
                          padding: "7px 12px 7px 30px",
                          cursor: "pointer", fontSize: 13,
                          background: active ? "var(--orange)" : "var(--bg)",
                          color: active ? "#fff" : "var(--ink-soft)",
                          borderBottom: "1px solid var(--line)",
                          userSelect: "none",
                        }}
                      >
                        {c}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main search bar ── */
export function HomeSearch() {
  const router = useRouter();
  const [specialty, setSpecialty] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMsg, setGeoMsg] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (specialty) params.set("esp", specialty);
    if (region) params.set("region", region);
    if (city) params.set("ciudad", city);
    const qs = params.toString();
    router.push(`/buscar${qs ? "?" + qs : ""}`);
  }

  function handleGeolocate() {
    if (!("geolocation" in navigator)) {
      setGeoMsg("Tu navegador no soporta geolocalización");
      return;
    }
    setGeoLoading(true);
    setGeoMsg("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { "Accept-Language": "es" } },
          );
          const data = await res.json();

          const rawCity = data.address?.city || data.address?.town || data.address?.village || "";
          const normCity = normalize(rawCity);

          if (normCity) {
            for (const r of REGIONS) {
              for (const c of r.cities) {
                const nc = normalize(c);
                if (nc === normCity || normCity.includes(nc) || nc.includes(normCity)) {
                  setRegion(r.name);
                  setCity(c);
                  setGeoMsg(`📍 ${c} detectada`);
                  setGeoLoading(false);
                  return;
                }
              }
            }
          }

          const normState = normalize(data.address?.state || "");
          for (const r of REGIONS) {
            if (normState.includes(normalize(r.name))) {
              setRegion(r.name);
              setCity("");
              setGeoMsg(`📍 Región ${r.name} detectada`);
              setGeoLoading(false);
              return;
            }
          }

          setGeoMsg("Ciudad no encontrada — selecciona manualmente");
        } catch {
          setGeoMsg("Error al obtener ubicación");
        }
        setGeoLoading(false);
      },
      (err) => {
        setGeoMsg(err.code === 1 ? "Permiso de ubicación denegado" : "No se pudo obtener tu ubicación");
        setGeoLoading(false);
      },
      { timeout: 10000 },
    );
  }

  return (
    <section style={{ background: "var(--bg)", paddingTop: 10, paddingBottom: 6 }}>
      <div className="wrap">

        {/* Search panel */}
        <div className="home-search-panel" style={{
          background: "#fff",
          border: "1px solid var(--line)",
          boxShadow: "0 8px 28px rgba(14,39,66,0.09)",
          padding: "14px 20px 12px",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>

            {/* Especialidad */}
            <div className="field home-search-field" style={{ flex: "1 1 190px" }}>
              <label>Especialidad</label>
              <select
                className="ob-select home-search-input"
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                style={{ color: specialty ? "var(--ink)" : "var(--mute)" }}
              >
                <option value="">Todas las especialidades</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Ubicación picker + Geo button */}
            <div className="home-search-field" style={{ flex: "1 1 260px", display: "flex", gap: 8, alignItems: "flex-end" }}>
              <UbicacionPicker
                region={region}
                city={city}
                onSelect={(r, c) => { setRegion(r); setCity(c); setGeoMsg(""); }}
              />

              {/* Geo button */}
              <button
                onClick={handleGeolocate}
                disabled={geoLoading}
                title="Detectar mi ubicación"
                className="home-geo-btn"
                style={{
                  width: 40, height: 40, flexShrink: 0,
                  background: "#fff", border: "1.5px solid var(--navy)",
                  cursor: geoLoading ? "wait" : "pointer",
                  display: "grid", placeItems: "center",
                  color: "var(--navy)",
                }}
              >
                <svg
                  viewBox="0 0 24 24" width="17" height="17"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={geoLoading ? { animation: "spin 0.9s linear infinite" } : undefined}
                >
                  {geoLoading ? (
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            {/* Search button */}
            <div className="field home-search-field" style={{ flex: "1 1 170px" }}>
              <label>&nbsp;</label>
              <button
                onClick={handleSearch}
                className="home-search-btn"
                style={{
                  height: 40, background: "var(--orange)", border: "none",
                  color: "#fff", fontWeight: 700, fontSize: 15, width: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  cursor: "pointer",
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
                </svg>
                Buscar maestros
              </button>
            </div>
          </div>

          {geoMsg && (
            <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "var(--mute)", lineHeight: 1.4 }}>
              {geoMsg}
            </p>
          )}
        </div>

        {/* Popular chips */}
        <div className="home-chips no-scrollbar" style={{ marginTop: 10 }}>
          <span className="label home-chips-label">Populares:</span>
          {POPULAR.map(s => (
            <button
              key={s}
              onClick={() => setSpecialty(specialty === s ? "" : s)}
              style={{
                display: "inline-flex", alignItems: "center", flexShrink: 0,
                border: `1px solid ${specialty === s ? "var(--orange)" : "var(--navy)"}`,
                background: specialty === s ? "var(--orange)" : "#fff",
                color: specialty === s ? "#fff" : "var(--navy)",
                padding: "5px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 500,
                cursor: "pointer", transition: "all .15s",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
