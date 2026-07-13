"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESPECIALIDADES, PHONE_PREFIX, formatPhone, phoneComplete, formatRUT, validateRUT } from "@/lib/maestro-shared";

const SL: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-jetbrains),monospace",
  fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.1em", color: "var(--mute)", marginBottom: 8,
};
const SI: React.CSSProperties = {
  width: "100%", height: 48, border: "1.5px solid var(--line)",
  padding: "0 14px", fontSize: 14.5, color: "var(--ink)",
  background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};

export default function RegistroBasicoPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [rutError, setRutError] = useState("");
  const [rutChecking, setRutChecking] = useState(false);
  const [telefono, setTelefono] = useState(PHONE_PREFIX);
  const [especialidad, setEspecialidad] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function validate(): string[] {
    const e: string[] = [];
    if (!nombre.trim()) e.push("El nombre completo es obligatorio.");
    if (!rut.trim()) e.push("El RUT es obligatorio.");
    else if (!validateRUT(rut)) e.push("El RUT ingresado no es válido.");
    if (!phoneComplete(telefono)) e.push("Ingresa los 8 dígitos del teléfono.");
    if (!especialidad) e.push("Selecciona tu especialidad principal.");
    return e;
  }

  // Real-time hint only — the definitive duplicate check still runs server-side
  // on submit (see /api/registro-basico), this just gives faster feedback.
  async function checkRutDisponible() {
    if (!validateRUT(rut)) return;
    setRutChecking(true);
    try {
      const res = await fetch("/api/check-rut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rut }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.disponible === false) {
        setRutError(data.mensaje || "Ese RUT ya está registrado por otro maestro.");
      }
    } catch {
      // silent — non-blocking hint, backend still validates on submit
    } finally {
      setRutChecking(false);
    }
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const errs = validate();
    if (errs.length) { setErrors(errs); window.scrollTo(0, 0); return; }
    setErrors([]);
    setSaving(true);
    try {
      const res = await fetch("/api/registro-basico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, rut, telefono, especialidad }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // 409 = RUT/teléfono duplicado — show the specific server message as-is,
        // in the red banner, keeping every field the user already filled in.
        if (res.status === 409 && data.error) {
          setErrors([data.error]);
          setSaving(false);
          window.scrollTo(0, 0);
          return;
        }
        throw new Error(data.error || `Error ${res.status}`);
      }
      router.push("/dashboard/maestro");
    } catch (err) {
      const detail = err instanceof Error && err.message ? ` (${err.message})` : "";
      setErrors([`Error al guardar. Intenta de nuevo.${detail}`]);
      setSaving(false);
    }
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 560 }}>

        <h1 style={{ fontFamily: "var(--font-archivo),sans-serif", fontWeight: 900, fontSize: "clamp(22px,3vw,28px)", color: "var(--navy)", margin: "0 0 4px", lineHeight: 1.1 }}>
          Crea tu perfil de maestro
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: "var(--mute)" }}>
          Solo 4 datos para empezar. Podrás completar el resto de tu perfil más adelante.
        </p>

        {errors.length > 0 && (
          <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", padding: "12px 16px", marginBottom: 20 }}>
            {errors.map(e => <p key={e} style={{ margin: "2px 0", color: "#DC2626", fontSize: 13.5, fontWeight: 600 }}>{e}</p>)}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid var(--line)", padding: 24 }}>

          <div style={{ marginBottom: 18 }}>
            <label style={SL}>Nombre completo *</label>
            <input style={SI} value={nombre} placeholder="Ej: Juan Pérez González"
              onChange={e => setNombre(e.target.value)} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ ...SL, display: "flex", alignItems: "center", gap: 6 }}>
              RUT *
              {rutChecking && (
                <svg viewBox="0 0 24 24" width="11" height="11" style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="var(--mute)" strokeWidth="3" strokeDasharray="42 14" strokeLinecap="round" />
                </svg>
              )}
            </label>
            <input
              style={{ ...SI, borderColor: rutError ? "#DC2626" : "var(--line)" }}
              value={rut}
              placeholder="12.345.678-9"
              onChange={e => {
                const formatted = formatRUT(e.target.value);
                const clean = formatted.replace(/[^0-9kK]/g, "");
                const err = clean.length >= 7 && !validateRUT(formatted) ? "RUT inválido" : "";
                setRut(formatted);
                setRutError(err);
              }}
              onBlur={checkRutDisponible}
            />
            {rutError && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#DC2626" }}>{rutError}</p>}
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={SL}>Teléfono *</label>
            <input
              style={SI}
              value={telefono}
              inputMode="numeric"
              onChange={e => setTelefono(formatPhone(e.target.value))}
            />
            <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--mute)" }}>
              {telefono.slice(PHONE_PREFIX.length).length}/8 dígitos
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={SL}>Especialidad principal *</label>
            <select value={especialidad} style={{ ...SI, cursor: "pointer" }}
              onChange={e => setEspecialidad(e.target.value)}>
              <option value="">Selecciona una especialidad…</option>
              {ESPECIALIDADES.map(esp => <option key={esp} value={esp}>{esp}</option>)}
            </select>
          </div>

          <button type="submit" disabled={saving} style={{
            width: "100%", height: 48, border: "none", boxSizing: "border-box",
            background: saving ? "#9ca3af" : "#1a2b4a", color: "#fff",
            fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800,
            fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
          }}>
            {saving ? "Guardando…" : "Crear mi perfil →"}
          </button>
        </form>
      </div>
    </div>
  );
}
