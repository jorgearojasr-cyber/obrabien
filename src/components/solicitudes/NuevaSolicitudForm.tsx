"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGIONS } from "@/lib/data";
import { ESPECIALIDADES } from "@/lib/maestro-shared";

// Sprint 19 (JOB-028/029/030/031). Flujo del Sprint 15: descripción →
// especialidad → región → comuna → fotografías (opcional) → selección de uno
// o varios maestros → enviar.
//
// JOB-029: la única escritura de este componente es POST /api/solicitudes —
// nada de Supabase acá. Las fotos pasan por /api/upload-foto (ya existente,
// reutilizado, no una ruta nueva de Supabase) para obtener una URL antes de
// enviarlas en el body.
//
// JOB-030 (deliberado, puede leerse como UX poco común): este componente NO
// bloquea "Siguiente" ni "Enviar" por campos vacíos — eso sería reimplementar
// la regla de "qué es obligatorio", que vive únicamente en
// validarParaEnviar() dentro de src/lib/solicitudes.ts (Sprint 18). El único
// rol de la UI ante un error es mostrar tal cual lo que la API devuelve, y
// como mucho saltar al paso correspondiente para que sea más fácil corregir.

export interface MaestroPickerItem {
  id: string;
  nombre: string;
  fotoUrl: string | null;
  ciudad: string;
  especialidades: string[];
}

type Archivo = { url: string; descripcion?: string; nombreArchivo: string };

const PASOS = [
  "Descripción",
  "Especialidad",
  "Región",
  "Comuna",
  "Fotografías",
  "Maestros",
] as const;

const CAMPO_A_PASO: Record<string, number> = {
  descripcion: 1,
  region: 3,
  maestroIds: 6,
};

const CAMPO_LABEL: Record<string, string> = {
  descripcion: "Descripción del trabajo",
  region: "Región",
  maestroIds: "Al menos un maestro seleccionado",
};

const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, border: "1.5px solid var(--line)", padding: "0 12px",
  fontSize: 14, background: "#fff", boxSizing: "border-box",
};
const textareaStyle: React.CSSProperties = {
  ...inputStyle, height: 140, padding: 12, resize: "vertical", fontFamily: "inherit",
};
const labelStyle: React.CSSProperties = {
  display: "block", marginBottom: 8, fontSize: 13, fontWeight: 700, color: "var(--ink)",
};

export default function NuevaSolicitudForm({ maestros }: { maestros: MaestroPickerItem[] }) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [descripcion, setDescripcion] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [busquedaMaestro, setBusquedaMaestro] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [camposConError, setCamposConError] = useState<string[]>([]);
  const [enviada, setEnviada] = useState(false);

  const ciudadesDeRegion = REGIONS.find(r => r.name === region)?.cities ?? [];

  const maestrosFiltrados = maestros.filter(m => {
    if (especialidad && !m.especialidades.includes(especialidad)) return false;
    if (!busquedaMaestro.trim()) return true;
    const needle = busquedaMaestro.toLowerCase();
    return m.nombre.toLowerCase().includes(needle) || m.ciudad.toLowerCase().includes(needle);
  });

  function toggleMaestro(id: string) {
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function subirFoto(file: File) {
    setSubiendoFoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-foto?type=solicitud", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir la foto");
      setArchivos(prev => [...prev, { url: data.url, nombreArchivo: file.name }]);
    } catch (err) {
      setErrorGeneral(err instanceof Error ? err.message : "Error al subir la foto");
    } finally {
      setSubiendoFoto(false);
    }
  }

  function quitarArchivo(url: string) {
    setArchivos(prev => prev.filter(a => a.url !== url));
  }

  async function enviarSolicitud() {
    setEnviando(true);
    setErrorGeneral(null);
    setCamposConError([]);

    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion,
          especialidad: especialidad || undefined,
          region,
          comuna: comuna || undefined,
          maestroIds: Array.from(seleccionados),
          archivos: archivos.map(a => ({ url: a.url, descripcion: a.descripcion })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        // JOB-030: se muestra tal cual lo que devuelve la API, sin reinterpretar la regla.
        setErrorGeneral(data.error ?? "No se pudo enviar la solicitud.");
        const campos = Array.isArray(data.campos) ? (data.campos as string[]) : [];
        setCamposConError(campos);
        if (campos.length > 0) {
          const primerPaso = Math.min(...campos.map(c => CAMPO_A_PASO[c] ?? 6));
          setStep(primerPaso);
        }
        return;
      }

      setEnviada(true);
    } catch {
      setErrorGeneral("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviada) {
    return (
      <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 20, color: "var(--navy)", margin: "0 0 8px" }}>
          Solicitud enviada
        </h2>
        <p style={{ fontSize: 14, color: "var(--mute)", margin: "0 0 24px" }}>
          Le avisamos a los maestros que elegiste. Te van a poder responder acá mismo.
        </p>
        <button
          onClick={() => router.push("/")}
          style={{ background: "var(--orange)", color: "#fff", border: "none", padding: "11px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 28 }}>
      {/* Stepper */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
        {PASOS.map((label, i) => {
          const n = i + 1;
          const activo = n === step;
          return (
            <button
              key={label}
              onClick={() => setStep(n)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: activo ? "var(--navy)" : "var(--bg-2)",
                color: activo ? "#fff" : "var(--mute)",
                border: "none", padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "var(--font-jetbrains), monospace",
              }}
            >
              {n}. {label}
            </button>
          );
        })}
      </div>

      {errorGeneral && (
        <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", color: "#B91C1C", padding: "12px 16px", marginBottom: 20, fontSize: 13.5 }}>
          {errorGeneral}
          {camposConError.length > 0 && (
            <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              {camposConError.map(c => <li key={c}>{CAMPO_LABEL[c] ?? c}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Paso 1 — Descripción */}
      {step === 1 && (
        <div>
          <label style={labelStyle}>¿Qué trabajo necesitas?</label>
          <textarea
            style={textareaStyle}
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Ej: Tengo una filtración en el baño, sale agua por debajo del lavamanos..."
          />
        </div>
      )}

      {/* Paso 2 — Especialidad */}
      {step === 2 && (
        <div>
          <label style={labelStyle}>¿Qué tipo de maestro buscas? (opcional)</label>
          <select style={inputStyle} value={especialidad} onChange={e => setEspecialidad(e.target.value)}>
            <option value="">Cualquiera</option>
            {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      )}

      {/* Paso 3 — Región */}
      {step === 3 && (
        <div>
          <label style={labelStyle}>Región</label>
          <select style={inputStyle} value={region} onChange={e => { setRegion(e.target.value); setComuna(""); }}>
            <option value="">Selecciona una región</option>
            {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
        </div>
      )}

      {/* Paso 4 — Comuna */}
      {step === 4 && (
        <div>
          <label style={labelStyle}>Comuna (opcional)</label>
          <select style={inputStyle} value={comuna} onChange={e => setComuna(e.target.value)} disabled={ciudadesDeRegion.length === 0}>
            <option value="">{ciudadesDeRegion.length === 0 ? "Elige primero una región" : "Toda la región"}</option>
            {ciudadesDeRegion.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Paso 5 — Fotografías */}
      {step === 5 && (
        <div>
          <label style={labelStyle}>Fotos del problema o del espacio (opcional)</label>
          <input
            type="file"
            accept="image/*"
            disabled={subiendoFoto}
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) subirFoto(f);
              e.target.value = "";
            }}
          />
          {subiendoFoto && <p style={{ fontSize: 12.5, color: "var(--mute)", margin: "8px 0 0" }}>Subiendo…</p>}
          {archivos.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              {archivos.map(a => (
                <div key={a.url} style={{ position: "relative", width: 88, height: 88 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.url} alt={a.nombreArchivo} style={{ width: 88, height: 88, objectFit: "cover", border: "1px solid var(--line)" }} />
                  <button
                    onClick={() => quitarArchivo(a.url)}
                    title="Quitar"
                    style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "var(--navy)", color: "#fff", border: "2px solid #fff", cursor: "pointer", fontSize: 12, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Paso 6 — Selección de maestros */}
      {step === 6 && (
        <div>
          <label style={labelStyle}>Elige uno o varios maestros ({seleccionados.size} seleccionado{seleccionados.size !== 1 ? "s" : ""})</label>
          <input
            style={{ ...inputStyle, marginBottom: 12 }}
            value={busquedaMaestro}
            onChange={e => setBusquedaMaestro(e.target.value)}
            placeholder="Buscar por nombre o ciudad..."
          />
          <div style={{ maxHeight: 340, overflowY: "auto", border: "1px solid var(--line)" }}>
            {maestrosFiltrados.length === 0 && (
              <p style={{ padding: 16, fontSize: 13, color: "var(--mute)", margin: 0 }}>Sin resultados.</p>
            )}
            {maestrosFiltrados.map(m => {
              const activo = seleccionados.has(m.id);
              return (
                <label
                  key={m.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                    borderBottom: "1px solid var(--line)", cursor: "pointer",
                    background: activo ? "rgba(232,108,28,0.06)" : "#fff",
                  }}
                >
                  <input type="checkbox" checked={activo} onChange={() => toggleMaestro(m.id)} style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", background: "var(--navy)", flexShrink: 0, display: "grid", placeItems: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                    {m.fotoUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={m.fotoUrl} alt={m.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : m.nombre[0]?.toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{m.nombre}</div>
                    <div style={{ fontSize: 12, color: "var(--mute)" }}>{m.ciudad || "—"} · {m.especialidades[0] ?? "—"}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Navegación */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 10 }}>
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          style={{ background: "#fff", border: "1.5px solid var(--line)", color: "var(--ink)", padding: "10px 20px", fontWeight: 700, fontSize: 13.5, cursor: step === 1 ? "default" : "pointer", opacity: step === 1 ? 0.4 : 1 }}
        >
          ← Atrás
        </button>
        {step < 6 ? (
          <button
            onClick={() => setStep(s => Math.min(6, s + 1))}
            style={{ background: "var(--navy)", color: "#fff", border: "none", padding: "10px 20px", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={enviarSolicitud}
            disabled={enviando}
            style={{ background: "var(--orange)", color: "#fff", border: "none", padding: "10px 24px", fontWeight: 700, fontSize: 13.5, cursor: enviando ? "default" : "pointer", opacity: enviando ? 0.6 : 1 }}
          >
            {enviando ? "Enviando…" : "Enviar solicitud"}
          </button>
        )}
      </div>
    </div>
  );
}
