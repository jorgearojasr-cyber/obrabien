"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ESPECIALIDADES = [
  "Albañilería", "Gasfitería", "Electricidad", "Carpintería", "Pintura",
  "Techumbres", "Climatización / AC", "Cerrajería", "Pisos y revestimientos",
  "Impermeabilización", "Yesería", "Fierrería / Soldadura", "Plomería",
  "Instalación de cocinas", "Jardín / Paisajismo", "Demolición",
];

const REGIONES = [
  "Región Metropolitana", "Valparaíso", "Biobío", "La Araucanía",
  "O'Higgins", "Maule", "Los Lagos", "Antofagasta", "Coquimbo",
  "Atacama", "Tarapacá", "Arica y Parinacota", "Ñuble", "Los Ríos",
  "Aysén", "Magallanes",
];

const label: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-jetbrains), monospace",
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mute)",
  marginBottom: 8,
};

const input: React.CSSProperties = {
  width: "100%",
  height: 48,
  border: "1.5px solid var(--line)",
  padding: "0 14px",
  fontSize: 14.5,
  color: "var(--ink)",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export default function CompletarPerfilPage() {
  const router = useRouter();
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [zona, setZona] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [experiencia, setExperiencia] = useState(1);
  const [fotos, setFotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleEsp(e: string) {
    setEspecialidades(prev =>
      prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (especialidades.length === 0) { setError("Selecciona al menos una especialidad."); return; }
    if (!zona) { setError("Indica tu zona de cobertura."); return; }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ especialidades, zona, descripcion, experiencia }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      router.push("/dashboard/maestro?perfil=actualizado");
    } catch {
      setError("Hubo un error al guardar. Intenta de nuevo.");
      setSaving(false);
    }
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link
            href="/dashboard/maestro"
            style={{ fontSize: 13, color: "var(--mute)", textDecoration: "none", fontFamily: "var(--font-jetbrains), monospace", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}
          >
            ← Volver al panel
          </Link>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(22px,3vw,30px)", color: "var(--navy)", margin: "0 0 6px", lineHeight: 1.1 }}>
            Completa tu perfil profesional
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, color: "var(--mute)" }}>
            Los perfiles completos reciben 4× más contactos. Solo toma unos minutos.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Especialidades */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "24px 24px 20px" }}>
              <p style={{ ...label, marginBottom: 4 }}>Especialidades *</p>
              <p style={{ fontSize: 13, color: "var(--mute)", margin: "0 0 16px" }}>
                Selecciona todas las que apliquen ({especialidades.length} seleccionadas)
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ESPECIALIDADES.map(esp => {
                  const active = especialidades.includes(esp);
                  return (
                    <button
                      key={esp}
                      type="button"
                      onClick={() => toggleEsp(esp)}
                      style={{
                        padding: "8px 14px",
                        border: `1.5px solid ${active ? "var(--navy)" : "var(--line)"}`,
                        background: active ? "var(--navy)" : "#fff",
                        color: active ? "#fff" : "var(--ink-soft)",
                        fontFamily: "var(--font-archivo), sans-serif",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all .12s",
                      }}
                    >
                      {active && <span style={{ marginRight: 5, color: "var(--orange)" }}>✓</span>}
                      {esp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zona de cobertura */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "24px" }}>
              <label style={label}>Zona de cobertura *</label>
              <select
                value={zona}
                onChange={e => setZona(e.target.value)}
                style={{ ...input, paddingRight: 36, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7C8F' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
              >
                <option value="">Selecciona tu región principal…</option>
                {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div style={{ marginTop: 12 }}>
                <label style={{ ...label, marginBottom: 6 }}>
                  ¿En qué comunas trabajas? (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Santiago, Providencia, Las Condes…"
                  style={input}
                  onChange={e => {
                    if (zona) setZona(zona + " — " + e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Descripción */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "24px" }}>
              <label style={label}>Descripción profesional</label>
              <textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Cuéntales a los clientes quién eres, qué haces y por qué eres la mejor opción…"
                maxLength={600}
                rows={5}
                style={{
                  ...input,
                  height: "auto",
                  padding: "12px 14px",
                  resize: "vertical",
                  lineHeight: 1.6,
                }}
              />
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--mute)", textAlign: "right" }}>
                {descripcion.length}/600 caracteres
              </p>
            </div>

            {/* Años de experiencia */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "24px" }}>
              <label style={label}>Años de experiencia</label>
              <div style={{ display: "flex", alignItems: "center", gap: 0, width: 160 }}>
                <button
                  type="button"
                  onClick={() => setExperiencia(Math.max(1, experiencia - 1))}
                  style={{ width: 48, height: 48, border: "1.5px solid var(--line)", background: "#fff", fontSize: 20, cursor: "pointer", color: "var(--navy)", fontWeight: 700, flexShrink: 0 }}
                >
                  −
                </button>
                <div style={{ flex: 1, height: 48, border: "1.5px solid var(--line)", borderLeft: "none", borderRight: "none", display: "grid", placeItems: "center", fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 20, color: "var(--navy)" }}>
                  {experiencia}
                </div>
                <button
                  type="button"
                  onClick={() => setExperiencia(Math.min(50, experiencia + 1))}
                  style={{ width: 48, height: 48, border: "1.5px solid var(--line)", background: "#fff", fontSize: 20, cursor: "pointer", color: "var(--navy)", fontWeight: 700, flexShrink: 0 }}
                >
                  +
                </button>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--mute)" }}>
                {experiencia === 1 ? "1 año" : `${experiencia} años`} de experiencia en el rubro
              </p>
            </div>

            {/* Fotos de trabajos */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "24px" }}>
              <label style={label}>Fotos de trabajos realizados</label>
              <p style={{ fontSize: 13, color: "var(--mute)", margin: "0 0 14px" }}>
                Sube hasta 8 fotos de tus mejores proyectos. Los clientes las verán en tu perfil.
              </p>
              <label
                htmlFor="fotos-input"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "32px 20px",
                  border: "2px dashed var(--line)",
                  cursor: "pointer",
                  background: fotos.length > 0 ? "#f8fbff" : "#fafafa",
                  transition: "background .15s",
                }}
              >
                <span style={{ fontSize: 32 }}>📷</span>
                <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>
                  {fotos.length > 0 ? `${fotos.length} foto${fotos.length > 1 ? "s" : ""} seleccionada${fotos.length > 1 ? "s" : ""}` : "Haz clic para subir fotos"}
                </span>
                <span style={{ fontSize: 12.5, color: "var(--mute)" }}>PNG, JPG hasta 10 MB c/u</span>
              </label>
              <input
                id="fotos-input"
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={e => {
                  const files = Array.from(e.target.files || []).slice(0, 8);
                  setFotos(files);
                }}
              />
              {fotos.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {fotos.map((f, i) => (
                    <span key={i} style={{ fontSize: 12, background: "var(--bg)", border: "1px solid var(--line)", padding: "4px 10px", color: "var(--ink-soft)" }}>
                      {f.name.length > 20 ? f.name.slice(0, 18) + "…" : f.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", padding: "12px 16px", color: "#DC2626", fontSize: 14, fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving ? "var(--mute)" : "var(--orange)",
                  color: "#fff",
                  border: "none",
                  padding: "0 32px",
                  height: 52,
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "background .15s",
                }}
              >
                {saving ? "Guardando…" : "Guardar perfil →"}
              </button>
              <Link
                href="/dashboard/maestro"
                style={{ fontSize: 14, color: "var(--mute)", textDecoration: "none" }}
              >
                Cancelar
              </Link>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
