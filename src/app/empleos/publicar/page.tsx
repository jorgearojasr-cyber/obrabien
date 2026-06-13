"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { REGIONS, SPECIALTIES } from "@/lib/data";
import MigrateToMaestroCard from "@/components/MigrateToMaestroCard";

type Tipo = "oferta" | "maestro_disponible";

const MODALIDADES = [
  { value: "presencial",      label: "Presencial" },
  { value: "por proyecto",    label: "Por proyecto" },
  { value: "tiempo completo", label: "Tiempo completo" },
  { value: "part time",       label: "Part time" },
];

function BackIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>;
}

function PublicarForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [tipo,     setTipo]     = useState<Tipo>((params.get("tipo") as Tipo) || "oferta");
  const [form, setForm] = useState({
    titulo: "", descripcion: "", region: "", ciudad: "",
    modalidad: "", rango_sueldo: "", contacto_nombre: "", contacto_whatsapp: "",
  });
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [profileLoaded,  setProfileLoaded]  = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [submitError,    setSubmitError]    = useState("");
  const [done,           setDone]           = useState(false);
  const [publishedId,    setPublishedId]    = useState("");

  const role = isLoaded ? (user?.publicMetadata as { role?: string } | null)?.role ?? null : undefined;
  const isMaestro = role === "maestro";
  const isCliente = role === "cliente";
  const blockedMaestroTab = tipo === "maestro_disponible" && isLoaded && !isMaestro;

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Auto-fill from profile
  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch("/api/my-profile")
      .then(r => r.json())
      .then((d: { nombre?: string; whatsapp?: string }) => {
        setForm(f => ({
          ...f,
          contacto_nombre:   d.nombre   || "",
          contacto_whatsapp: d.whatsapp || "",
        }));
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, [isLoaded, user]);

  const regionObj = REGIONS.find(r => r.name === form.region);
  const cities    = regionObj?.cities ?? [];

  function toggleEsp(esp: string) {
    setEspecialidades(prev =>
      prev.includes(esp) ? prev.filter(e => e !== esp) : [...prev, esp]
    );
  }

  async function handleSubmit() {
    if (!form.titulo.trim() || !form.descripcion.trim() || !form.region || !form.contacto_whatsapp.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res  = await fetch("/api/empleos", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          tipo,
          titulo:            form.titulo.trim(),
          descripcion:       form.descripcion.trim(),
          especialidades,
          region:            form.region,
          ciudad:            form.ciudad || null,
          modalidad:         form.modalidad || null,
          rango_sueldo:      form.rango_sueldo.trim() || null,
          contacto_nombre:   form.contacto_nombre.trim() || null,
          contacto_whatsapp: form.contacto_whatsapp.trim(),
        }),
      });
      const data = await res.json() as { ok?: boolean; id?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setPublishedId(data.id ?? "");
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al publicar. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = !!(form.titulo.trim().length >= 5 && form.descripcion.trim().length >= 20 && form.region && form.contacto_whatsapp.trim()) && !submitting;

  /* ── Success ── */
  if (done) {
    return (
      <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "48px 32px", textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🎉</div>
        <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: 22, color: "var(--navy)", margin: "0 0 10px" }}>
          {tipo === "oferta" ? "¡Oferta publicada!" : "¡Perfil publicado!"}
        </h2>
        <p style={{ fontSize: 14, color: "var(--mute)", margin: "0 0 28px", lineHeight: 1.6 }}>
          {tipo === "oferta"
            ? "Tu oferta de trabajo ya está visible para los maestros de ObraBien."
            : "Tu disponibilidad está visible para quienes buscan maestros."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/empleos" style={{ padding: "11px 22px", background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Ver empleos →
          </Link>
          <button type="button"
            onClick={() => { setDone(false); setForm({ titulo: "", descripcion: "", region: "", ciudad: "", modalidad: "", rango_sueldo: "", contacto_nombre: form.contacto_nombre, contacto_whatsapp: form.contacto_whatsapp }); setEspecialidades([]); setPublishedId(""); }}
            style={{ padding: "11px 22px", border: "1.5px solid var(--navy)", background: "#fff", color: "var(--navy)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Publicar otra
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "28px 32px" }}>

      {/* Type toggle */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--mute)", marginBottom: 10 }}>¿Qué deseas publicar?</div>
        <div style={{ display: "inline-flex" }}>
          {(["oferta", "maestro_disponible"] as Tipo[]).map((t, i) => {
            const active = tipo === t;
            return (
              <button key={t} type="button" onClick={() => setTipo(t)}
                style={{
                  padding: "10px 20px", fontSize: 13.5, fontWeight: active ? 700 : 500,
                  border: "1.5px solid var(--navy)", marginLeft: i > 0 ? -1.5 : 0,
                  background: active ? "var(--navy)" : "#fff",
                  color: active ? "#fff" : "var(--navy)",
                  cursor: "pointer", position: "relative", zIndex: active ? 1 : 0,
                }}>
                {t === "oferta" ? "💼 Publicar oferta de trabajo" : "👷 Ofrecerme como maestro"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Blocked state: non-maestro trying to offer themselves */}
      {blockedMaestroTab && (
        isCliente
          ? <MigrateToMaestroCard context="empleos" onCancel={() => setTipo("oferta")} />
          : (
            <div style={{ border: "1.5px solid var(--line)", padding: "32px 28px", textAlign: "center", background: "var(--bg)" }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>👷</div>
              <h3 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--navy)", margin: "0 0 10px" }}>
                Necesitas una cuenta de maestro
              </h3>
              <p style={{ fontSize: 14, color: "var(--mute)", margin: "0 0 24px", lineHeight: 1.6, maxWidth: 380, marginInline: "auto" }}>
                Para ofrecerte como maestro necesitas una cuenta de maestro. ¿Quieres registrarte?
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/login?tab=maestro"
                  style={{ padding: "11px 22px", background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                  Crear cuenta de maestro →
                </Link>
                <button type="button" onClick={() => setTipo("oferta")}
                  style={{ padding: "11px 22px", border: "1.5px solid var(--line)", background: "#fff", color: "var(--ink-soft)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  Cancelar
                </button>
              </div>
            </div>
          )
      )}

      <div style={{ display: blockedMaestroTab ? "none" : "flex", flexDirection: "column", gap: 18 }}>

        {/* Título */}
        <div className="field">
          <label>
            {tipo === "oferta" ? "Título de la oferta" : "Tu título profesional"}{" "}
            <span style={{ color: "var(--orange)" }}>*</span>
          </label>
          <input className="ob-input"
            value={form.titulo}
            onChange={e => set("titulo", e.target.value)}
            placeholder={tipo === "oferta" ? "Ej: Busco gasfiter para proyecto de 3 meses" : "Ej: Gasfiter con 10 años — disponible para proyectos"}
            maxLength={120}
            style={{ marginTop: 6 }}
          />
          <p style={{ fontSize: 11.5, color: "var(--mute)", margin: "4px 0 0" }}>{form.titulo.length}/120</p>
        </div>

        {/* Especialidades */}
        <div className="field">
          <label style={{ display: "block", marginBottom: 8 }}>Especialidades</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SPECIALTIES.map(esp => {
              const sel = especialidades.includes(esp);
              return (
                <button key={esp} type="button" onClick={() => toggleEsp(esp)}
                  style={{
                    padding: "4px 11px", fontSize: 12.5, cursor: "pointer",
                    border: `1.5px solid ${sel ? "var(--navy)" : "var(--line)"}`,
                    background: sel ? "var(--navy)" : "#fff",
                    color: sel ? "#fff" : "var(--ink-soft)",
                    fontWeight: sel ? 700 : 400, transition: "all .12s",
                  }}>
                  {esp}
                </button>
              );
            })}
          </div>
        </div>

        {/* Descripción */}
        <div className="field">
          <label>
            {tipo === "oferta" ? "Descripción del trabajo" : "Descripción de tus servicios"}{" "}
            <span style={{ color: "var(--orange)" }}>*</span>
          </label>
          <textarea className="ob-textarea"
            value={form.descripcion}
            onChange={e => set("descripcion", e.target.value)}
            placeholder={tipo === "oferta"
              ? "Describe el trabajo: qué hay que hacer, duración, requisitos, horario…"
              : "Describe tu experiencia, qué trabajos haces, zonas donde trabajas, disponibilidad…"}
            style={{ minHeight: 130, marginTop: 6 }}
            maxLength={2000}
          />
          <p style={{ fontSize: 11.5, color: "var(--mute)", margin: "4px 0 0" }}>{form.descripcion.length}/2000</p>
        </div>

        {/* Modalidad + Sueldo */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="field">
            <label>Modalidad</label>
            <select className="ob-select" value={form.modalidad} onChange={e => set("modalidad", e.target.value)} style={{ marginTop: 6 }}>
              <option value="">Sin especificar</option>
              {MODALIDADES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          {tipo === "oferta" && (
            <div className="field">
              <label>Rango de sueldo <span style={{ color: "var(--mute)", fontWeight: 400 }}>(opcional)</span></label>
              <input className="ob-input"
                value={form.rango_sueldo}
                onChange={e => set("rango_sueldo", e.target.value)}
                placeholder="Ej: $600.000 - $900.000 / mes"
                style={{ marginTop: 6 }}
                maxLength={80}
              />
            </div>
          )}
        </div>

        {/* Región + Ciudad */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="field">
            <label>Región <span style={{ color: "var(--orange)" }}>*</span></label>
            <select className="ob-select" value={form.region}
              onChange={e => { set("region", e.target.value); set("ciudad", ""); }}
              style={{ marginTop: 6 }}>
              <option value="">Selecciona una región</option>
              {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Ciudad / Comuna</label>
            <select className="ob-select" value={form.ciudad} onChange={e => set("ciudad", e.target.value)}
              disabled={!form.region} style={{ marginTop: 6 }}>
              <option value="">{form.region ? "Selecciona" : "Elige región primero"}</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Contacto (auto-fill, read-only) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="field">
            <label>Tu nombre o empresa</label>
            <div style={{ position: "relative" }}>
              <input className="ob-input" value={form.contacto_nombre} readOnly disabled
                placeholder="Cargando…"
                style={{ marginTop: 6, background: "var(--bg-2)", color: "var(--ink-soft)", cursor: "default", paddingRight: 70 }} />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", pointerEvents: "none", marginTop: 3 }}>
                auto-fill
              </span>
            </div>
          </div>
          <div className="field">
            <label>WhatsApp de contacto <span style={{ color: "var(--orange)" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <input className="ob-input" value={form.contacto_whatsapp} readOnly disabled
                placeholder="Cargando…"
                type="tel"
                style={{ marginTop: 6, background: "var(--bg-2)", color: "var(--ink-soft)", cursor: "default", paddingRight: 70 }} />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", pointerEvents: "none", marginTop: 3 }}>
                auto-fill
              </span>
            </div>
          </div>
        </div>
        {profileLoaded && !form.contacto_whatsapp && (
          <p style={{ fontSize: 12.5, color: "var(--mute)", margin: "-8px 0 0" }}>
            Sin WhatsApp en tu perfil.{" "}
            <a href="/perfil" style={{ color: "var(--orange)", fontWeight: 600 }}>Completar perfil →</a>
          </p>
        )}

        {/* Submit */}
        {submitError && (
          <p style={{ fontSize: 12.5, color: "#dc2626", margin: 0 }}>⚠ {submitError}</p>
        )}
        <button type="button" onClick={handleSubmit} disabled={!canSubmit}
          style={{
            alignSelf: "flex-start", padding: "12px 28px", border: "none",
            background: canSubmit ? "var(--navy)" : "var(--mute-2)",
            color: "#fff", fontWeight: 700, fontSize: 14,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}>
          {submitting ? "Publicando…" : tipo === "oferta" ? "Publicar oferta →" : "Publicar disponibilidad →"}
        </button>

        {!isLoaded || !user ? (
          <p style={{ fontSize: 12.5, color: "var(--mute)", margin: "-8px 0 0" }}>
            Puedes publicar sin cuenta. Para gestionar tus publicaciones, {" "}
            <Link href="/login" style={{ color: "var(--orange)", fontWeight: 600 }}>inicia sesión →</Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function PublicarEmpleoPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>

        {/* Back + header */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/empleos" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mute)", textDecoration: "none", fontWeight: 500, marginBottom: 14 }}>
            <BackIcon /> Volver a empleos
          </Link>
          <h1 style={{ margin: 0, fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(22px,3vw,28px)", fontWeight: 900, color: "var(--navy)", lineHeight: 1.1 }}>
            Publicar en Empleos
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--mute)" }}>
            Publicaciones gratuitas. Serán visibles de inmediato.
          </p>
        </div>

        <Suspense fallback={<div style={{ padding: 48, textAlign: "center", color: "var(--mute)" }}>Cargando…</div>}>
          <PublicarForm />
        </Suspense>
      </div>
    </div>
  );
}
