"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { REGIONS } from "@/lib/data";

type Empleo = {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  especialidades: string[] | null;
  region: string;
  ciudad: string | null;
  modalidad: string | null;
  rango_sueldo: string | null;
  contacto_nombre: string | null;
  contacto_whatsapp: string | null;
  created_at: string;
};

type Tab = "oferta" | "maestro_disponible";

const MODALIDAD_CFG: Record<string, { label: string; color: string; bg: string }> = {
  "presencial":      { label: "PRESENCIAL",      color: "#14375F", bg: "rgba(20,55,95,0.1)"    },
  "por proyecto":    { label: "POR PROYECTO",    color: "#E86C1C", bg: "rgba(232,108,28,0.12)" },
  "tiempo completo": { label: "TIEMPO COMPLETO", color: "#15803d", bg: "rgba(34,197,94,0.1)"   },
  "part time":       { label: "PART TIME",       color: "#6d28d9", bg: "rgba(109,40,217,0.1)"  },
};

function relDate(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "hoy";
  if (d === 1) return "hace 1 día";
  if (d < 30) return `hace ${d} días`;
  const m = Math.floor(d / 30);
  return `hace ${m} mes${m !== 1 ? "es" : ""}`;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.35C8.45 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

export default function EmpleosPage() {
  const { user, isLoaded } = useUser();

  const [tab,     setTab]     = useState<Tab>("oferta");
  const [region,  setRegion]  = useState("");
  const [empleos, setEmpleos] = useState<Empleo[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts,  setCounts]  = useState({ ofertas: 0, maestros: 0 });

  // Postular modal
  const [postulando, setPostulando] = useState<Empleo | null>(null);
  const [mensaje,    setMensaje]    = useState("");
  const [sending,    setSending]    = useState(false);
  const [sendErr,    setSendErr]    = useState("");
  const [applied,    setApplied]    = useState<Set<string>>(new Set());

  const loadEmpleos = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ tipo: tab });
      if (region) p.set("region", region);
      const res  = await fetch(`/api/empleos?${p}`);
      const data = await res.json() as { empleos?: Empleo[] };
      setEmpleos(data.empleos ?? []);
    } catch {
      setEmpleos([]);
    } finally {
      setLoading(false);
    }
  }, [tab, region]);

  useEffect(() => { loadEmpleos(); }, [loadEmpleos]);

  useEffect(() => {
    Promise.all([
      fetch("/api/empleos?tipo=oferta&count=true").then(r => r.json() as Promise<{ count?: number }>),
      fetch("/api/empleos?tipo=maestro_disponible&count=true").then(r => r.json() as Promise<{ count?: number }>),
    ]).then(([o, m]) => setCounts({ ofertas: o.count ?? 0, maestros: m.count ?? 0 })).catch(() => {});
  }, []);

  async function handlePostular() {
    if (!postulando || sending) return;
    setSending(true);
    setSendErr("");
    try {
      const res  = await fetch("/api/empleos/postular", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ empleo_id: postulando.id, mensaje }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error al postular");
      setApplied(prev => new Set([...prev, postulando.id]));
      setPostulando(null);
      setMensaje("");
    } catch (err) {
      setSendErr(err instanceof Error ? err.message : "Error al postular");
    } finally {
      setSending(false);
    }
  }

  function openPostular(e: Empleo) {
    setPostulando(e);
    setMensaje("");
    setSendErr("");
  }

  const isMaestro = isLoaded && !!user && (user.publicMetadata?.role as string) === "maestro";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />

      {/* ── Postular modal ── */}
      {postulando && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) { setPostulando(null); } }}
        >
          <div style={{ background: "#fff", maxWidth: 480, width: "100%", padding: "26px 28px" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--orange)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              // Postulación
            </div>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--navy)", marginBottom: 4 }}>
              {postulando.titulo}
            </div>
            <div style={{ fontSize: 13, color: "var(--mute)", marginBottom: 20 }}>
              📍 {[postulando.ciudad, postulando.region].filter(Boolean).join(", ")}
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", display: "block", marginBottom: 6 }}>
                Mensaje para el empleador <span style={{ color: "var(--mute)", fontWeight: 400 }}>(opcional)</span>
              </label>
              <textarea
                className="ob-textarea"
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                placeholder="Hola, vi tu oferta y me interesa. Tengo X años de experiencia en…"
                style={{ minHeight: 100 }}
                maxLength={500}
                autoFocus
              />
              <div style={{ fontSize: 11, color: "var(--mute)", textAlign: "right", marginTop: 3 }}>{mensaje.length}/500</div>
            </div>

            {sendErr && <p style={{ fontSize: 12.5, color: "#dc2626", margin: "0 0 12px" }}>⚠ {sendErr}</p>}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setPostulando(null)}
                style={{ padding: "9px 18px", border: "1px solid var(--line)", background: "#fff", color: "var(--mute)", fontSize: 13.5, cursor: "pointer", fontWeight: 500 }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePostular}
                disabled={sending}
                style={{ padding: "9px 22px", border: "none", background: sending ? "var(--mute-2)" : "var(--navy)", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer" }}
              >
                {sending ? "Enviando…" : "Postular →"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--orange)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              // Empleos
            </span>
            <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(26px,4vw,36px)", fontWeight: 900, color: "var(--navy)", margin: "6px 0 12px", lineHeight: 1.1 }}>
              Trabajo en construcción
            </h1>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13.5, color: "var(--mute)" }}>
              <span>💼 <strong style={{ color: "var(--navy)" }}>{counts.ofertas}</strong> oferta{counts.ofertas !== 1 ? "s" : ""} activa{counts.ofertas !== 1 ? "s" : ""}</span>
              <span>👷 <strong style={{ color: "var(--orange)" }}>{counts.maestros}</strong> maestro{counts.maestros !== 1 ? "s" : ""} disponible{counts.maestros !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="empleos-actions">
            {isLoaded && !!user ? (
              <>
                <Link href="/empleos/publicar?tipo=oferta"
                  style={{ padding: "10px 18px", background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 13.5, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                  + Publicar oferta
                </Link>
                <Link href="/empleos/publicar?tipo=maestro_disponible"
                  style={{ padding: "10px 18px", background: "#fff", border: "1.5px solid var(--navy)", color: "var(--navy)", fontWeight: 700, fontSize: 13.5, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                  + Ofrecerme
                </Link>
              </>
            ) : isLoaded ? (
              <Link href="/login"
                style={{ fontSize: 13.5, color: "var(--mute)", textDecoration: "underline" }}>
                Inicia sesión para publicar
              </Link>
            ) : null}
          </div>
        </div>

        {/* ── Tabs + filter ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <div className="empleos-tabs">
            {(["oferta", "maestro_disponible"] as Tab[]).map((t, i) => {
              const active = tab === t;
              return (
                <button key={t} type="button" onClick={() => setTab(t)}
                  style={{
                    padding: "10px 20px", fontSize: 13.5, fontWeight: active ? 700 : 500,
                    border: "1.5px solid var(--navy)", marginLeft: i > 0 ? -1.5 : 0,
                    background: active ? "var(--navy)" : "#fff",
                    color: active ? "#fff" : "var(--navy)",
                    cursor: "pointer", position: "relative", zIndex: active ? 1 : 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t === "oferta" ? "💼 Ofertas de trabajo" : "👷 Maestros disponibles"}
                </button>
              );
            })}
          </div>
          <select className="ob-select" value={region} onChange={e => setRegion(e.target.value)}
            style={{ width: "auto", minWidth: 200 }}>
            <option value="">Todas las regiones</option>
            {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
        </div>

        {/* ── Cards ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--mute)", fontSize: 14 }}>
            Cargando…
          </div>
        ) : empleos.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "56px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>{tab === "oferta" ? "💼" : "👷"}</div>
            <p style={{ fontSize: 15, color: "var(--mute)", margin: "0 0 22px", lineHeight: 1.5 }}>
              {tab === "oferta"
                ? region ? `No hay ofertas de trabajo en ${region} aún.` : "No hay ofertas de trabajo aún."
                : region ? `No hay maestros disponibles en ${region} aún.` : "No hay maestros disponibles aún."}
            </p>
            <Link href={`/empleos/publicar?tipo=${tab}`}
              style={{ background: "var(--navy)", color: "#fff", padding: "11px 24px", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              {tab === "oferta" ? "Publicar una oferta →" : "Ofrecerme →"}
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {empleos.map(e => {
              const mod     = e.modalidad ? MODALIDAD_CFG[e.modalidad] : null;
              const waNum   = e.contacto_whatsapp?.replace(/\D/g, "") ?? "";
              const waMsg   = encodeURIComponent(`Hola, vi ${tab === "oferta" ? `tu oferta "${e.titulo}"` : `tu perfil "${e.titulo}"`} en ObraBien Empleos y me interesa contactarte.`);
              const waUrl   = waNum ? `https://wa.me/${waNum}?text=${waMsg}` : null;
              const isApplied = applied.has(e.id);

              return (
                <div key={e.id} style={{ background: "#fff", border: "1px solid var(--line)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 11 }}>

                  {/* Badges + date */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{
                      padding: "2px 8px", fontSize: 9.5, fontWeight: 700,
                      fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.07em",
                      background: tab === "oferta" ? "rgba(20,55,95,0.1)" : "rgba(232,108,28,0.12)",
                      color: tab === "oferta" ? "var(--navy)" : "var(--orange)",
                    }}>
                      {tab === "oferta" ? "OFERTA" : "DISPONIBLE"}
                    </span>
                    {mod && (
                      <span style={{ padding: "2px 8px", background: mod.bg, color: mod.color, fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.07em" }}>
                        {mod.label}
                      </span>
                    )}
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                      {relDate(e.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 15.5, color: "var(--ink)", lineHeight: 1.25, marginBottom: 5 }}>
                      {e.titulo}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--mute)", display: "flex", alignItems: "center", gap: 4 }}>
                      📍 {[e.ciudad, e.region].filter(Boolean).join(", ")}
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.6,
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                  } as React.CSSProperties}>
                    {e.descripcion}
                  </p>

                  {/* Especialidades */}
                  {e.especialidades && e.especialidades.length > 0 && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {e.especialidades.slice(0, 5).map(esp => (
                        <span key={esp} style={{ padding: "2px 8px", border: "1px solid var(--line)", fontSize: 11.5, color: "var(--mute)", background: "var(--bg)" }}>
                          #{esp}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Salary */}
                  {e.rango_sueldo && (
                    <div style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 600 }}>
                      💰 {e.rango_sueldo}
                    </div>
                  )}

                  {/* Contact name */}
                  {e.contacto_nombre && (
                    <div style={{ fontSize: 12.5, color: "var(--mute)" }}>
                      Publicado por <strong style={{ color: "var(--ink-soft)" }}>{e.contacto_nombre}</strong>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    {waUrl && (
                      <a href={waUrl} target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, minWidth: 110, padding: "9px 12px", background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <WhatsAppIcon />
                        {tab === "oferta" ? "Contactar" : "Contactar"}
                      </a>
                    )}
                    {tab === "oferta" && (
                      isApplied ? (
                        <span style={{ flex: 1, minWidth: 100, padding: "9px 12px", background: "rgba(34,197,94,0.1)", color: "#15803d", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(34,197,94,0.3)" }}>
                          ✓ Postulado
                        </span>
                      ) : isMaestro ? (
                        <button type="button" onClick={() => openPostular(e)}
                          style={{ flex: 1, minWidth: 100, padding: "9px 12px", border: "1.5px solid var(--navy)", background: "#fff", color: "var(--navy)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                          Postular →
                        </button>
                      ) : isLoaded && !user ? (
                        <Link href="/login"
                          style={{ flex: 1, minWidth: 100, padding: "9px 12px", border: "1.5px solid var(--navy)", background: "#fff", color: "var(--navy)", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          Iniciar sesión →
                        </Link>
                      ) : null
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
