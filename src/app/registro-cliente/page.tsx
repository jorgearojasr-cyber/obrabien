"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { REGIONS } from "@/lib/data";
import { OtpVerify } from "@/components/OtpVerify";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const STEPS = ["Tu cuenta", "Ubicación", "Preferencias"];

const PROYECTOS = ["Construcción", "Reparaciones", "Terminaciones", "Instalaciones", "Mantención", "Otros"];
const FRECUENCIAS = ["Primera vez", "Ocasionalmente", "Frecuentemente", "Tengo proyectos continuos"];
const CONTACTO_VIA = ["WhatsApp", "Llamada", "Email"];
const CONTACTO_CUANDO = ["Mañana", "Tarde", "Noche"];
const COMO_CONOCISTE = ["Google", "Redes sociales", "Recomendación de alguien", "Otro"];

const MOCK_SOCIAL: Record<string, { nombre: string; email: string }> = {
  google:   { nombre: "María Fernández López", email: "maria.fernandez@gmail.com" },
  facebook: { nombre: "María Fernández",       email: "maria.fernandez@facebook.com" },
  apple:    { nombre: "M. Fernández",          email: "mfernandez@icloud.com" },
};

/* ─── Form type ──────────────────────────────────────────────────────────── */
type Form = {
  socialProvider: string;
  nombre: string; email: string; telefono: string; password: string;
  region: string; ciudad: string;
  proyectos: string[]; frecuencia: string;
  viaContacto: string[]; cuandoContacto: string[];
  comoConociste: string;
};

const EMPTY: Form = {
  socialProvider: "", nombre: "", email: "", telefono: "", password: "",
  region: "", ciudad: "",
  proyectos: [], frecuencia: "",
  viaContacto: [], cuandoContacto: [],
  comoConociste: "",
};

/* ─── Small components ───────────────────────────────────────────────────── */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
function FacebookLogo() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="white">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function PickBtn({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "9px 13px",
        border: on ? "1.5px solid var(--navy)" : "1.5px solid var(--line)",
        background: on ? "rgba(20,55,95,0.07)" : "#fff",
        cursor: "pointer", fontSize: 13.5, fontWeight: on ? 600 : 500,
        color: on ? "var(--navy)" : "var(--ink)", textAlign: "left", transition: "all .15s",
      }}>
      <span style={{
        width: 17, height: 17, flexShrink: 0,
        background: on ? "var(--navy)" : "#fff",
        border: on ? "1.5px solid var(--navy)" : "1.5px solid var(--line)",
        display: "grid", placeItems: "center", color: "#fff", fontSize: 10,
      }}>
        {on && "✓"}
      </span>
      {label}
    </button>
  );
}

function RadioBtn({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
        border: on ? "1.5px solid var(--orange)" : "1.5px solid var(--line)",
        background: on ? "rgba(232,108,28,0.07)" : "#fff",
        cursor: "pointer", fontSize: 13.5, fontWeight: on ? 600 : 500,
        color: on ? "var(--ink)" : "var(--ink-soft)", transition: "all .15s",
      }}>
      <span style={{
        width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
        border: on ? "5px solid var(--orange)" : "1.5px solid var(--line)",
        background: "#fff", transition: "all .15s",
      }} />
      {label}
    </button>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function RegistroClientePage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<Form>({ ...EMPTY });
  const [chkTerms, setChkTerms] = useState(false);
  const [chkDisclaimer, setChkDisclaimer] = useState(false);
  const [contactVerified, setContactVerified] = useState(false);

  const citiesInRegion = useMemo(() => REGIONS.find(r => r.name === form.region)?.cities ?? [], [form.region]);

  const set = useCallback(<K extends keyof Form>(key: K, val: Form[K]) => {
    setForm(f => ({ ...f, [key]: val }));
  }, []);

  function toggleArr(key: "proyectos" | "viaContacto" | "cuandoContacto", val: string) {
    setForm(f => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  }

  function connectSocial(provider: string) {
    const mock = MOCK_SOCIAL[provider];
    setForm(f => ({ ...f, socialProvider: provider, nombre: mock.nombre, email: mock.email }));
  }

  function canNext() {
    if (step === 0) {
      if (form.socialProvider) return !!(form.nombre && contactVerified);
      return !!(form.nombre && form.email && contactVerified && form.password);
    }
    if (step === 1) return !!form.region;
    return true;
  }

  /* ── Success screen ── */
  if (done) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div className="tape-thin" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <LogoMark size={32} />
                <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 18 }}>
                  <span style={{ color: "var(--navy)" }}>OBRA</span><span style={{ color: "var(--orange)" }}>BIEN</span>
                </span>
              </Link>
            </div>

            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "36px 28px" }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🎉</div>
              <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 24, color: "var(--navy)", margin: "0 0 10px" }}>
                ¡Cuenta creada!
              </h1>
              <p style={{ color: "var(--ink-soft)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 22px" }}>
                Bienvenido/a a OBRABIEN, <strong>{form.nombre}</strong>.<br />
                Ya puedes buscar maestros, guardar favoritos y dejar reseñas.
              </p>

              {/* Summary */}
              <div style={{ background: "var(--bg)", border: "1px solid var(--line)", padding: "14px 16px", marginBottom: 22, textAlign: "left" }}>
                <span className="label" style={{ display: "block", marginBottom: 10 }}>// Tu perfil</span>
                <div className="col gap-8" style={{ fontSize: 13.5 }}>
                  {form.region && (
                    <span style={{ color: "var(--ink-soft)" }}>
                      📍 {form.ciudad ? `${form.ciudad}, ` : ""}{form.region}
                    </span>
                  )}
                  {form.proyectos.length > 0 && (
                    <span style={{ color: "var(--ink-soft)" }}>
                      🔧 {form.proyectos.join(", ")}
                    </span>
                  )}
                  {form.frecuencia && (
                    <span style={{ color: "var(--ink-soft)" }}>
                      🗓 {form.frecuencia}
                    </span>
                  )}
                  {form.viaContacto.length > 0 && (
                    <span style={{ color: "var(--ink-soft)" }}>
                      📞 Contactar por {form.viaContacto.join(", ")}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link href="/buscar"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: 48, background: "var(--orange)", color: "#fff",
                    fontWeight: 700, fontSize: 15, textDecoration: "none",
                  }}>
                  Buscar maestros →
                </Link>
                <Link href="/"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: 44, border: "1.5px solid var(--line)", background: "#fff",
                    color: "var(--ink)", fontWeight: 600, fontSize: 14, textDecoration: "none",
                  }}>
                  Ir al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="tape-thin" />

      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "36px 16px 64px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>

          {/* Logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <LogoMark size={34} />
              <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 19 }}>
                <span style={{ color: "var(--navy)" }}>OBRA</span>
                <span style={{ color: "var(--orange)" }}>BIEN</span>
              </span>
            </Link>
          </div>

          {/* Stepper */}
          <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 28 }}>
            {STEPS.map((label, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center",
                    background: i < step ? "var(--navy)" : i === step ? "var(--orange)" : "var(--bg-2)",
                    color: i <= step ? "#fff" : "var(--mute)",
                    fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 13,
                    flexShrink: 0, transition: "all .2s",
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span style={{
                    fontSize: 9.5, fontFamily: "var(--font-jetbrains), monospace",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    color: i === step ? "var(--orange)" : "var(--mute)",
                    textAlign: "center", lineHeight: 1.25, maxWidth: 64,
                  }}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, margin: "0 4px", marginBottom: 28,
                    background: i < step ? "var(--navy)" : "var(--line)",
                    transition: "background .2s",
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "28px 24px 32px" }}>

            {/* ── PASO 0: Tu cuenta ── */}
            {step === 0 && (
              <div className="col gap-18">
                <div>
                  <span className="label" style={{ display: "block", marginBottom: 6 }}>// Paso 1 de 3</span>
                  <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 21, fontWeight: 800, margin: "0 0 4px", color: "var(--navy)" }}>
                    Crea tu cuenta
                  </h2>
                  <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>Accede a todos los maestros verificados de Chile.</p>
                </div>

                {form.socialProvider ? (
                  /* Connected banner */
                  <div style={{ background: "rgba(20,55,95,0.05)", border: "1.5px solid var(--navy)", padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, background: "var(--navy)", color: "#fff",
                      display: "grid", placeItems: "center", borderRadius: "50%",
                      fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 15, flexShrink: 0,
                    }}>
                      {form.nombre.split(" ").map(w => w[0]).slice(0, 2).join("")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--navy)" }}>{form.nombre}</div>
                      <div style={{ fontSize: 12.5, color: "var(--mute)" }}>{form.email}</div>
                    </div>
                    <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#25a55a", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase" }}>✓ Conectado</span>
                      <button type="button" onClick={() => setForm(f => ({ ...f, socialProvider: "", nombre: "", email: "" }))}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--mute)", textDecoration: "underline", padding: 0 }}>
                        Cambiar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Social buttons */
                  <div className="col gap-8">
                    {[
                      { provider: "google",   logo: <GoogleLogo />,   label: "Continuar con Google",   bg: "#fff",     border: "#dadce0", color: "#3c4043" },
                      { provider: "facebook", logo: <FacebookLogo />, label: "Continuar con Facebook", bg: "#1877F2",  border: "#1877F2", color: "#fff" },
                      { provider: "apple",    logo: <AppleLogo />,    label: "Continuar con Apple",    bg: "#000",     border: "#000",    color: "#fff" },
                    ].map(({ provider, logo, label, bg, border, color }) => (
                      <button key={provider} type="button" onClick={() => connectSocial(provider)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                          height: 48, border: `1.5px solid ${border}`, background: bg, color,
                          fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%",
                        }}>
                        {logo} {label}
                      </button>
                    ))}

                    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                      <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                        o con tu correo
                      </span>
                      <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                    </div>

                    <div className="field">
                      <label>Nombre completo *</label>
                      <input className="ob-input" value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="María Fernández" />
                    </div>
                    <div className="field">
                      <label>Correo electrónico *</label>
                      <input className="ob-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="tu@email.cl" />
                    </div>
                    <div className="field">
                      <label>Contraseña *</label>
                      <input className="ob-input" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Mínimo 8 caracteres" />
                    </div>
                  </div>
                )}

                {/* Verification widget */}
                <OtpVerify onVerified={(method, value) => {
                  if (method === "whatsapp") set("telefono", value);
                  setContactVerified(true);
                }} />

                {form.socialProvider && (
                  <div className="field">
                    <label>Nombre completo *</label>
                    <input className="ob-input" value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Confirma tu nombre" />
                  </div>
                )}
              </div>
            )}

            {/* ── PASO 1: Ubicación y preferencias ── */}
            {step === 1 && (
              <div className="col gap-22">
                <div>
                  <span className="label" style={{ display: "block", marginBottom: 6 }}>// Paso 2 de 3</span>
                  <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 21, fontWeight: 800, margin: "0 0 4px", color: "var(--navy)" }}>
                    Ubicación y proyectos
                  </h2>
                  <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>Así te mostramos los maestros más cercanos.</p>
                </div>

                {/* Región */}
                <div className="field">
                  <label>Tu región *</label>
                  <select className="ob-select" value={form.region}
                    onChange={e => setForm(f => ({ ...f, region: e.target.value, ciudad: "" }))}>
                    <option value="">Selecciona tu región</option>
                    {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>

                {/* Ciudad */}
                {form.region && (
                  <div className="field">
                    <label>Ciudad / comuna</label>
                    <select className="ob-select" value={form.ciudad} onChange={e => set("ciudad", e.target.value)}>
                      <option value="">Toda la región</option>
                      {citiesInRegion.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                {/* Tipo de proyectos */}
                <div className="field">
                  <label>¿Qué tipo de proyectos sueles necesitar?</label>
                  <p style={{ fontSize: 12, color: "var(--mute)", margin: "2px 0 10px" }}>Selecciona todas las que apliquen.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {PROYECTOS.map(p => (
                      <PickBtn key={p} label={p} on={form.proyectos.includes(p)} onClick={() => toggleArr("proyectos", p)} />
                    ))}
                  </div>
                </div>

                {/* Frecuencia */}
                <div className="field">
                  <label>¿Con qué frecuencia necesitas maestros?</label>
                  <div className="col gap-8" style={{ marginTop: 8 }}>
                    {FRECUENCIAS.map(f => (
                      <RadioBtn key={f} label={f} on={form.frecuencia === f} onClick={() => set("frecuencia", f)} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PASO 2: Preferencias de contacto ── */}
            {step === 2 && (
              <div className="col gap-22">
                <div>
                  <span className="label" style={{ display: "block", marginBottom: 6 }}>// Paso 3 de 3</span>
                  <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 21, fontWeight: 800, margin: "0 0 4px", color: "var(--navy)" }}>
                    Preferencias de contacto
                  </h2>
                  <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>Para que los maestros puedan contactarte bien.</p>
                </div>

                {/* Cómo contactar */}
                <div className="field">
                  <label>¿Cómo prefieres que te contacten?</label>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    {CONTACTO_VIA.map(v => (
                      <button key={v} type="button" onClick={() => toggleArr("viaContacto", v)}
                        style={{
                          flex: 1, minWidth: 100, padding: "10px 8px",
                          border: `1.5px solid ${form.viaContacto.includes(v) ? "var(--navy)" : "var(--line)"}`,
                          background: form.viaContacto.includes(v) ? "var(--navy)" : "#fff",
                          color: form.viaContacto.includes(v) ? "#fff" : "var(--ink)",
                          fontWeight: 600, fontSize: 13.5, cursor: "pointer", transition: "all .15s",
                          textAlign: "center",
                        }}>
                        {v === "WhatsApp" ? "📱 " : v === "Llamada" ? "📞 " : "✉️ "}{v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cuándo contactar */}
                <div className="field">
                  <label>¿Cuándo prefieres ser contactado?</label>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    {CONTACTO_CUANDO.map(c => (
                      <button key={c} type="button" onClick={() => toggleArr("cuandoContacto", c)}
                        style={{
                          flex: 1, padding: "10px 8px",
                          border: `1.5px solid ${form.cuandoContacto.includes(c) ? "var(--orange)" : "var(--line)"}`,
                          background: form.cuandoContacto.includes(c) ? "rgba(232,108,28,0.08)" : "#fff",
                          color: form.cuandoContacto.includes(c) ? "var(--ink)" : "var(--ink-soft)",
                          fontWeight: form.cuandoContacto.includes(c) ? 600 : 500,
                          fontSize: 13.5, cursor: "pointer", transition: "all .15s", textAlign: "center",
                        }}>
                        {c === "Mañana" ? "🌅 " : c === "Tarde" ? "☀️ " : "🌙 "}{c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cómo nos conociste */}
                <div className="field">
                  <label>¿Cómo conociste OBRABIEN?</label>
                  <select className="ob-select" value={form.comoConociste} onChange={e => set("comoConociste", e.target.value)}
                    style={{ marginTop: 6 }}>
                    <option value="">Selecciona una opción</option>
                    {COMO_CONOCISTE.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Mini-summary */}
                <div style={{ background: "var(--bg)", border: "1px solid var(--line)", padding: 16 }}>
                  <span className="label" style={{ display: "block", marginBottom: 10 }}>// Tu cuenta al crear</span>
                  <div className="col gap-6" style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
                    <span><strong style={{ color: "var(--navy)" }}>{form.nombre}</strong> · {form.email || "—"}</span>
                    {form.region && <span>📍 {form.ciudad ? `${form.ciudad}, ` : ""}{form.region}</span>}
                    {form.proyectos.length > 0 && <span>🔧 {form.proyectos.join(", ")}</span>}
                    {form.frecuencia && <span>🗓 {form.frecuencia}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legal block — only on last step */}
          {step === STEPS.length - 1 && (
            <div className="col gap-12" style={{ marginTop: 20 }}>
              {/* Checkbox 1: Términos */}
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                <input type="checkbox" checked={chkTerms} onChange={e => setChkTerms(e.target.checked)}
                  style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: "var(--orange)", cursor: "pointer" }}/>
                <span style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                  He leído y acepto los{" "}
                  <Link href="/terminos" style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "underline" }}>Términos y Condiciones</Link>
                  {" "}y la{" "}
                  <Link href="/privacidad" style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "underline" }}>Política de Privacidad</Link>
                  {" "}de ObrabiEN.
                </span>
              </label>

              {/* Checkbox 2: Disclaimer */}
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                <input type="checkbox" checked={chkDisclaimer} onChange={e => setChkDisclaimer(e.target.checked)}
                  style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: "var(--orange)", cursor: "pointer" }}/>
                <span style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                  Entiendo que ObrabiEN es una plataforma de conexión y <strong style={{ color: "var(--ink)" }}>NO es intermediaria</strong> en pagos, contratos ni ejecución de trabajos. Toda transacción y acuerdo es directamente entre el cliente y el maestro.
                </span>
              </label>

              {/* Caja informativa */}
              <div style={{
                background: "var(--bg-2)", border: "1px solid var(--line)", padding: "14px 16px",
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--mute)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <p style={{ fontSize: 12.5, color: "var(--mute)", lineHeight: 1.6, margin: 0 }}>
                  ObrabiEN actúa como plataforma de conexión entre clientes y maestros independientes. No cobramos comisiones por trabajos realizados, no intervenimos en acuerdos económicos entre las partes, y no nos hacemos responsables por la calidad de los trabajos ejecutados, incumplimientos de contrato o disputas entre usuarios. Recomendamos siempre solicitar presupuesto escrito y verificar antecedentes antes de contratar.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn"
                style={{ flex: 1, borderColor: "var(--line)", height: 48, fontSize: 14 }}>
                ← Atrás
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                style={{
                  flex: 2, background: "var(--orange)", border: "none", color: "#fff",
                  fontWeight: 700, fontSize: 15, height: 48,
                  cursor: canNext() ? "pointer" : "not-allowed", opacity: canNext() ? 1 : 0.4,
                }}>
                Continuar →
              </button>
            ) : (
              <button onClick={() => setDone(true)} disabled={!chkTerms || !chkDisclaimer}
                style={{
                  flex: 2, border: "none", color: "#fff", fontWeight: 700, fontSize: 15, height: 48,
                  background: chkTerms && chkDisclaimer ? "var(--orange)" : "var(--mute-2)",
                  cursor: chkTerms && chkDisclaimer ? "pointer" : "not-allowed",
                  transition: "background .2s ease",
                }}>
                Crear mi cuenta ✓
              </button>
            )}
          </div>

          <p style={{ fontSize: 12, color: "var(--mute)", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" style={{ color: "var(--navy)", fontWeight: 600 }}>Iniciar sesión</Link>
            {" · "}
            <Link href="/registro" style={{ color: "var(--orange)", fontWeight: 600 }}>Soy maestro</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
