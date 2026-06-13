"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { REGIONS } from "@/lib/data";
const PHONE_PREFIX = "+56 9 ";

function formatPhone(raw: string): string {
  if (!raw.startsWith(PHONE_PREFIX)) return PHONE_PREFIX;
  const digits = raw.slice(PHONE_PREFIX.length).replace(/\D/g, "").slice(0, 8);
  return PHONE_PREFIX + digits;
}

const SI: React.CSSProperties = {
  width: "100%", height: 48, border: "1.5px solid var(--line)",
  padding: "0 14px", fontSize: 14.5, color: "var(--ink)",
  background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const SL: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-jetbrains), monospace",
  fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.1em", color: "var(--mute)", marginBottom: 8,
};

export default function CompletarPerfilClienteForm() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nombre,    setNombre]    = useState("");
  const [ciudad,    setCiudad]    = useState("");
  const [telefono,  setTelefono]  = useState(PHONE_PREFIX);
  const [fotoUrl,   setFotoUrl]   = useState("");
  const [terminos1, setTerminos1] = useState(false);
  const [terminos2, setTerminos2] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => {
    fetch("/api/cliente-profile")
      .then(r => r.json())
      .then(({ data }) => {
        if (data) {
          setNombre(data.nombre ?? "");
          setCiudad(data.ciudad ?? "");
          setTelefono(data.telefono ?? PHONE_PREFIX);
          setFotoUrl(data.foto_perfil ?? "");
          const t = data.terminos_aceptados ?? false;
          setTerminos1(t);
          setTerminos2(t);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError("La foto no puede superar 4 MB. Elige una imagen más pequeña.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload-foto?type=perfil", { method: "POST", body: fd });
      let json: { url?: string; error?: string } = {};
      try { json = await res.json(); } catch { /* non-JSON response (e.g. 413 from infrastructure) */ }
      if (!res.ok) throw new Error(json.error ?? `Error al subir foto (${res.status})`);
      if (!json.url) throw new Error("No se recibió URL de la imagen");
      setFotoUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir foto");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    if (!ciudad)        { setError("Selecciona tu ciudad."); return; }
    if (!terminos1 || !terminos2) { setError("Debes aceptar ambas declaraciones para continuar."); return; }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/cliente-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          ciudad,
          telefono:           telefono === PHONE_PREFIX ? "" : telefono,
          foto_perfil:        fotoUrl || null,
          terminos_aceptados: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      router.push("/dashboard/cliente?perfil=guardado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar. Intenta de nuevo.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--mute)" }}>
          Cargando…
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 520 }}>

        <Link href="/dashboard/cliente" style={{ fontSize: 13, color: "var(--mute)", textDecoration: "none", fontFamily: "var(--font-jetbrains), monospace", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
          ← Volver al panel
        </Link>

        <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(22px,3vw,28px)", color: "var(--navy)", margin: "0 0 6px", lineHeight: 1.1 }}>
          Completa tu perfil
        </h1>
        <p style={{ margin: "0 0 32px", fontSize: 14, color: "var(--mute)" }}>
          Esto nos ayuda a mostrarte los maestros más cercanos a ti.
        </p>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", padding: "12px 16px", marginBottom: 20 }}>
            <p style={{ margin: 0, color: "#DC2626", fontSize: 13.5, fontWeight: 600 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Photo upload */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBottom: 20, borderBottom: "1px solid var(--line)" }}>
              <div style={{
                width: 96, height: 96, borderRadius: "50%", overflow: "hidden",
                border: "2.5px solid var(--orange)", background: "var(--bg-2)",
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>
                {fotoUrl
                  /* eslint-disable-next-line @next/next/no-img-element */
                  ? <img src={fotoUrl} alt="Foto de perfil" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <span style={{ fontSize: 36, lineHeight: 1 }}>👤</span>
                }
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{
                  height: 36, padding: "0 18px",
                  background: uploading ? "var(--mute)" : "#fff",
                  border: "1.5px solid var(--line)", color: "var(--ink)",
                  fontSize: 13, fontWeight: 600,
                  cursor: uploading ? "default" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {uploading ? "Subiendo…" : fotoUrl ? "Cambiar foto" : "Subir foto de perfil"}
              </button>
              <p style={{ margin: 0, fontSize: 11.5, color: "var(--mute)", textAlign: "center" }}>
                Opcional · JPG o PNG · Máx. 4 MB
              </p>
            </div>

            {/* Name */}
            <div>
              <label style={SL}>Nombre completo *</label>
              <input
                style={SI}
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej: María González"
                required
              />
            </div>

            {/* City */}
            <div>
              <label style={SL}>Ciudad *</label>
              <select
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                style={{ ...SI, cursor: "pointer" }}
                required
              >
                <option value="">Selecciona tu ciudad…</option>
                {REGIONS.map(region => (
                  <optgroup key={region.id} label={region.name}>
                    {region.cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label style={SL}>Teléfono (opcional)</label>
              <input
                style={SI}
                value={telefono}
                inputMode="numeric"
                onChange={e => setTelefono(formatPhone(e.target.value))}
                placeholder={PHONE_PREFIX}
              />
              <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--mute)" }}>
                {telefono.slice(PHONE_PREFIX.length).length}/8 dígitos
              </p>
            </div>

          </div>

          {/* Terms checkboxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "16px 20px", background: "#fff",
              border: `1.5px solid ${terminos1 ? "var(--navy)" : "var(--line)"}`,
              cursor: "pointer", transition: "border-color .15s",
            }}>
              <input
                type="checkbox"
                checked={terminos1}
                onChange={e => setTerminos1(e.target.checked)}
                style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: "var(--navy)", cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                Acepto los{" "}
                <Link href="/terminos" target="_blank" style={{ color: "var(--navy)", fontWeight: 700 }}>Términos y Condiciones</Link>
                {" "}y la{" "}
                <Link href="/privacidad" target="_blank" style={{ color: "var(--navy)", fontWeight: 700 }}>Política de Privacidad</Link>
                {" "}de ObraBien.
              </span>
            </label>

            <label style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "16px 20px", background: "#fff",
              border: `1.5px solid ${terminos2 ? "var(--navy)" : "var(--line)"}`,
              cursor: "pointer", transition: "border-color .15s",
            }}>
              <input
                type="checkbox"
                checked={terminos2}
                onChange={e => setTerminos2(e.target.checked)}
                style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: "var(--navy)", cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                Entiendo que ObraBien no garantiza la calidad de los trabajos realizados por los Maestros. Es mi responsabilidad verificar referencias, acordar condiciones y supervisar los trabajos contratados.
              </span>
            </label>

            <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.4 }}>⚠️</span>
              <p style={{ margin: 0, fontSize: 13, color: "var(--mute)", lineHeight: 1.6 }}>
                Recomendamos siempre solicitar cotización por escrito, verificar el badge de maestro verificado, y no realizar pagos totales antes de terminar el trabajo.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !terminos1 || !terminos2}
            style={{
              height: 52,
              background: saving || !terminos1 || !terminos2 ? "var(--mute)" : "var(--orange)",
              color: "#fff", border: "none",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 800, fontSize: 15.5,
              cursor: saving || !terminos1 || !terminos2 ? "default" : "pointer",
            }}
          >
            {saving ? "Guardando…" : "Guardar perfil →"}
          </button>

        </form>


      </div>
    </div>
  );
}
