"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { SPECIALTIES, REGIONS } from "@/lib/data";
import Link from "next/link";
import { OtpVerify } from "@/components/OtpVerify";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const PAYMENT_METHODS = ["Efectivo", "Transferencia bancaria", "Cheque", "Tarjeta de débito", "Tarjeta de crédito"];
const PAYMENT_SCHEDULES = ["50% al inicio / 50% al finalizar", "100% al finalizar", "A convenir con el cliente"];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const RADIOS = ["Dentro de la comuna", "Hasta 20 km", "Hasta 50 km", "Todo Chile"];
const STEPS = ["Tu cuenta", "Especialidad y zona", "Sobre tu trabajo", "Formas de pago"];
const MAX_DESC = 300;
const MOCK_SOCIAL: Record<string, { nombre: string; email: string }> = {
  google:   { nombre: "Juan Pérez González", email: "juan.perez@gmail.com" },
  facebook: { nombre: "Juan Pérez",          email: "juan.perez@facebook.com" },
  apple:    { nombre: "J. Pérez",            email: "jperez@icloud.com" },
};

/* ─── Form type ──────────────────────────────────────────────────────────── */
type Form = {
  socialProvider: string;
  nombre: string; email: string; telefono: string; rut: string; password: string;
  especialidadPrincipal: string; especialidadesSecundarias: string[];
  region: string; comunas: string[]; radio: string;
  experiencia: string; descripcion: string;
  emiteBoleta: string; emiteFactura: string;
  dias: string[]; horaInicio: string; horaFin: string;
  fraseDestacada: string;
  paymentMethods: string[]; paymentSchedule: string;
  whatsapp: string; instagram: string; tiktok: string; facebook: string;
};

const EMPTY: Form = {
  socialProvider: "", nombre: "", email: "", telefono: "", rut: "", password: "",
  especialidadPrincipal: "", especialidadesSecundarias: [],
  region: "", comunas: [], radio: "",
  experiencia: "", descripcion: "", emiteBoleta: "", emiteFactura: "",
  dias: [], horaInicio: "08:00", horaFin: "18:00", fraseDestacada: "",
  paymentMethods: [], paymentSchedule: "",
  whatsapp: "", instagram: "", tiktok: "", facebook: "",
};

/* ─── Small components ───────────────────────────────────────────────────── */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
function FacebookLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function SocialBtn({ logo, label, color, border, onClick }: {
  logo: React.ReactNode; label: string; color: string; border?: string; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "0 18px", height: 50,
        background: color, border: `1.5px solid ${border ?? "transparent"}`,
        cursor: "pointer", fontWeight: 600, fontSize: 14.5,
        color: border ? "var(--ink)" : "#fff", fontFamily: "inherit",
      }}
    >
      {logo} {label}
    </button>
  );
}

function PickBtn({ label, on, onClick, accent = "orange" }: {
  label: string; on: boolean; onClick: () => void; accent?: "orange" | "navy";
}) {
  const color = accent === "orange" ? "var(--orange)" : "var(--navy)";
  const bg = accent === "orange" ? "rgba(232,108,28,0.07)" : "rgba(20,55,95,0.07)";
  return (
    <button type="button" onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
        border: on ? `1.5px solid ${color}` : "1.5px solid var(--line)",
        background: on ? bg : "#fff",
        cursor: "pointer", fontSize: 13.5, fontWeight: 500,
        color: on ? "var(--navy)" : "var(--ink)", textAlign: "left", transition: "all .15s",
      }}>
      <span style={{
        width: 17, height: 17, flexShrink: 0, background: on ? color : "#fff",
        border: on ? `1.5px solid ${color}` : "1.5px solid var(--line)",
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
        border: on ? "1.5px solid var(--navy)" : "1.5px solid var(--line)",
        background: on ? "rgba(20,55,95,0.07)" : "#fff",
        cursor: "pointer", fontSize: 13.5, fontWeight: on ? 600 : 500,
        color: on ? "var(--navy)" : "var(--ink)", transition: "all .15s", flex: 1,
      }}>
      <span style={{
        width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
        border: on ? "5px solid var(--navy)" : "1.5px solid var(--line)",
        background: "#fff", transition: "all .15s",
      }} />
      {label}
    </button>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        {["Sí", "No"].map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            style={{
              flex: 1, height: 42,
              border: `1.5px solid ${value === opt ? (opt === "Sí" ? "var(--navy)" : "var(--line)") : "var(--line)"}`,
              background: value === opt ? (opt === "Sí" ? "var(--navy)" : "var(--bg)") : "#fff",
              color: value === opt && opt === "Sí" ? "#fff" : "var(--ink)",
              fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all .15s",
            }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

type PhotoEntry = { file: File; url: string };

function PhotoUpload({ photos, onChange }: { photos: PhotoEntry[]; onChange: (p: PhotoEntry[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const added = Array.from(e.target.files ?? [])
      .slice(0, 6 - photos.length)
      .map(file => ({ file, url: URL.createObjectURL(file) }));
    onChange([...photos, ...added].slice(0, 6));
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(i: number) {
    URL.revokeObjectURL(photos[i].url);
    onChange(photos.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
        {Array.from({ length: 6 }).map((_, i) => {
          const p = photos[i];
          if (p) {
            return (
              <div key={i} style={{ position: "relative", aspectRatio: "1", background: "var(--bg-2)", border: "1px solid var(--line)", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button type="button" onClick={() => remove(i)}
                  style={{
                    position: "absolute", top: 5, right: 5, width: 22, height: 22,
                    background: "rgba(0,0,0,0.65)", color: "#fff", border: "none",
                    borderRadius: "50%", cursor: "pointer", display: "grid", placeItems: "center", fontSize: 10,
                  }}>✕</button>
              </div>
            );
          }
          return (
            <button key={i} type="button"
              onClick={() => photos.length < 6 && inputRef.current?.click()}
              style={{
                aspectRatio: "1", background: "var(--bg)", border: "1.5px dashed var(--line)",
                cursor: photos.length < 6 ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 5, color: "var(--mute)", fontSize: 11,
              }}>
              <span style={{ fontSize: 24, lineHeight: 1, color: "var(--line)" }}>+</span>
              <span>Foto {i + 1}</span>
            </button>
          );
        })}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFiles} />
      <p style={{ fontSize: 11.5, color: "var(--mute)", marginTop: 8 }}>
        Hasta 6 fotos · JPG o PNG · Máx. 5 MB cada una
      </p>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function RegistroPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<Form>({ ...EMPTY });
  const [chkTerms, setChkTerms] = useState(false);
  const [chkDisclaimer, setChkDisclaimer] = useState(false);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [contactVerified, setContactVerified] = useState(false);

  const citiesInRegion = useMemo(() => REGIONS.find(r => r.name === form.region)?.cities ?? [], [form.region]);

  const set = useCallback(<K extends keyof Form>(key: K, val: Form[K]) => {
    setForm(f => ({ ...f, [key]: val }));
  }, []);

  function toggleArr(key: "especialidadesSecundarias" | "comunas" | "dias" | "paymentMethods", val: string) {
    setForm(f => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  }

  function connectSocial(provider: string) {
    const mock = MOCK_SOCIAL[provider];
    setForm(f => ({ ...f, socialProvider: provider, nombre: mock.nombre, email: mock.email }));
  }

  function disconnectSocial() {
    setForm(f => ({ ...f, socialProvider: "", nombre: "", email: "" }));
  }

  function canNext() {
    if (step === 0) {
      if (form.socialProvider) return !!(contactVerified && form.rut);
      return !!(form.nombre && form.email && contactVerified && form.rut && form.password);
    }
    if (step === 1) return !!(form.especialidadPrincipal && form.region);
    if (step === 2) return !!form.experiencia;
    return true;
  }

  /* ── Success screen ── */
  if (done) {
    const hasSocial = !!(form.whatsapp || form.instagram || form.tiktok || form.facebook);
    return (
      <div style={{ background: "var(--bg)", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 520, width: "100%", padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 28, color: "var(--navy)", margin: "0 0 10px" }}>
            ¡Perfil creado!
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.6, margin: "0 0 28px" }}>
            Bienvenido a OBRABIEN, <strong>{form.nombre}</strong>. Te contactaremos a <strong>{form.email}</strong> para verificar tu perfil.
          </p>

          {/* Summary card */}
          <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 22, textAlign: "left", marginBottom: 24 }}>
            <span className="label" style={{ display: "block", marginBottom: 14 }}>// Resumen de tu perfil</span>
            <div className="col gap-12">
              <Row label="Especialidad">{form.especialidadPrincipal}</Row>
              {form.especialidadesSecundarias.length > 0 && (
                <Row label="También">
                  <span style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {form.especialidadesSecundarias.map(e => <span key={e} className="chip">{e}</span>)}
                  </span>
                </Row>
              )}
              <Row label="Región">{form.region}{form.comunas.length > 0 ? ` · ${form.comunas.slice(0, 2).join(", ")}${form.comunas.length > 2 ? "…" : ""}` : ""}</Row>
              {form.radio && <Row label="Cobertura">{form.radio}</Row>}
              <Row label="Experiencia">{form.experiencia} años</Row>
              {form.dias.length > 0 && <Row label="Horario">{form.dias.join(", ")} · {form.horaInicio}–{form.horaFin}</Row>}
              {form.paymentMethods.length > 0 && <Row label="Pagos">{form.paymentMethods.join(", ")}</Row>}
              {form.paymentSchedule && <Row label="Modalidad">{form.paymentSchedule}</Row>}
              {hasSocial && (
                <Row label="Redes">
                  {[form.whatsapp && "WhatsApp", form.instagram && "Instagram", form.tiktok && "TikTok", form.facebook && "Facebook"]
                    .filter(Boolean).join(", ")}
                </Row>
              )}
              {photos.length > 0 && <Row label="Fotos">{photos.length} foto{photos.length !== 1 ? "s" : ""} subida{photos.length !== 1 ? "s" : ""}</Row>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/buscar"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px",
                background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
              }}>
              Ver maestros →
            </Link>
            <button onClick={() => { setDone(false); setStep(0); setForm({ ...EMPTY }); setPhotos([]); }}
              style={{ padding: "12px 22px", border: "1.5px solid var(--line)", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
              Registrar otro
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  return (
    <div style={{ background: "var(--bg)", minHeight: "80vh" }}>
      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "36px 0 0" }}>
        <div className="wrap">
          <span className="label" style={{ color: "var(--orange)" }}>// Únete a OBRABIEN</span>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", color: "#fff", fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 800, marginTop: 8, marginBottom: 4 }}>
            Registrarse como maestro
          </h1>
          <p style={{ color: "#9AA7B5", marginTop: 8, fontSize: 15, marginBottom: 0 }}>
            Gratis · Sin comisiones · Perfil público verificado
          </p>
        </div>
        <div className="tape" style={{ marginTop: 28 }} />
      </div>

      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 660 }}>
        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 36 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center",
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
                  flex: 1, height: 2, margin: "0 4px", marginBottom: 30,
                  background: i < step ? "var(--navy)" : "var(--line)",
                  transition: "background .2s",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "28px 28px 32px" }}>

          {/* ── PASO 0: Tu cuenta ── */}
          {step === 0 && (
            <div className="col gap-20">
              <div>
                <span className="label" style={{ display: "block", marginBottom: 6 }}>// Paso 1 de 4</span>
                <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "var(--navy)" }}>
                  Tu cuenta
                </h2>
                <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>Crea tu acceso a OBRABIEN.</p>
              </div>

              {form.socialProvider ? (
                /* Social connected banner */
                <div style={{ background: "rgba(20,55,95,0.05)", border: "1.5px solid var(--navy)", padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 46, height: 46, background: "var(--navy)", color: "#fff",
                    display: "grid", placeItems: "center", borderRadius: "50%",
                    fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 16, flexShrink: 0,
                  }}>
                    {form.nombre.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--navy)" }}>{form.nombre}</div>
                    <div style={{ fontSize: 12.5, color: "var(--mute)" }}>{form.email}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 11.5, color: "#25a55a", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase" }}>
                      ✓ Conectado
                    </span>
                    <button type="button" onClick={disconnectSocial}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--mute)", textDecoration: "underline", padding: 0 }}>
                      Cambiar
                    </button>
                  </div>
                </div>
              ) : (
                /* Social buttons */
                <div className="col gap-8">
                  <SocialBtn logo={<GoogleLogo />}   label="Continuar con Google"   color="#fff"     border="var(--line)" onClick={() => connectSocial("google")} />
                  <SocialBtn logo={<FacebookLogo />} label="Continuar con Facebook" color="#1877F2"  onClick={() => connectSocial("facebook")} />
                  <SocialBtn logo={<AppleLogo />}    label="Continuar con Apple"    color="#000"     onClick={() => connectSocial("apple")} />

                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                    <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                      o con tu correo
                    </span>
                    <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                  </div>

                  <div className="field">
                    <label>Nombre completo *</label>
                    <input className="ob-input" value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Juan Pérez González" />
                  </div>
                  <div className="field">
                    <label>Correo electrónico *</label>
                    <input className="ob-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="juan@correo.cl" />
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

              {/* RUT */}
              <div className="field">
                <label>RUT *</label>
                <input className="ob-input" value={form.rut} onChange={e => set("rut", e.target.value)} placeholder="12.345.678-9" />
              </div>
            </div>
          )}

          {/* ── PASO 1: Especialidad y zona ── */}
          {step === 1 && (
            <div className="col gap-24">
              <div>
                <span className="label" style={{ display: "block", marginBottom: 6 }}>// Paso 2 de 4</span>
                <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "var(--navy)" }}>
                  Especialidad y zona
                </h2>
                <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>Cuéntanos en qué trabajas y dónde.</p>
              </div>

              {/* Especialidad principal */}
              <div className="field">
                <label>Especialidad principal *</label>
                <select className="ob-select" value={form.especialidadPrincipal} onChange={e => set("especialidadPrincipal", e.target.value)}>
                  <option value="">Selecciona tu especialidad principal</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Especialidades secundarias */}
              <div className="field">
                <label>Especialidades secundarias <span style={{ color: "var(--mute)", fontWeight: 400 }}>(opcional)</span></label>
                <p style={{ fontSize: 12, color: "var(--mute)", margin: "2px 0 10px" }}>Selecciona las otras áreas en las que también trabajas.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 7 }}>
                  {SPECIALTIES.filter(s => s !== form.especialidadPrincipal).map(s => (
                    <PickBtn key={s} label={s}
                      on={form.especialidadesSecundarias.includes(s)}
                      onClick={() => toggleArr("especialidadesSecundarias", s)} />
                  ))}
                </div>
              </div>

              {/* Región */}
              <div className="field">
                <label>Región donde trabajas *</label>
                <select className="ob-select" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value, comunas: [] }))}>
                  <option value="">Selecciona tu región</option>
                  {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>

              {/* Comunas */}
              {form.region && (
                <div className="field">
                  <label>Comunas donde trabajas <span style={{ color: "var(--mute)", fontWeight: 400 }}>(opcional)</span></label>
                  <p style={{ fontSize: 12, color: "var(--mute)", margin: "2px 0 10px" }}>Si no seleccionas, se asume toda la región.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 7 }}>
                    {citiesInRegion.map(c => (
                      <PickBtn key={c} label={c}
                        on={form.comunas.includes(c)}
                        onClick={() => toggleArr("comunas", c)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Radio de desplazamiento */}
              <div className="field">
                <label>Radio de desplazamiento</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
                  {RADIOS.map(r => (
                    <RadioBtn key={r} label={r} on={form.radio === r} onClick={() => set("radio", r)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PASO 2: Sobre tu trabajo ── */}
          {step === 2 && (
            <div className="col gap-22">
              <div>
                <span className="label" style={{ display: "block", marginBottom: 6 }}>// Paso 3 de 4</span>
                <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "var(--navy)" }}>
                  Sobre tu trabajo
                </h2>
                <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>Información que verán los clientes en tu perfil.</p>
              </div>

              {/* Experiencia + Frase */}
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 16 }}>
                <div className="field">
                  <label>Años de exp. *</label>
                  <input className="ob-input" type="number" min="0" max="60" value={form.experiencia}
                    onChange={e => set("experiencia", e.target.value)} placeholder="Ej: 8" />
                </div>
                <div className="field">
                  <label>Frase destacada</label>
                  <input className="ob-input" value={form.fraseDestacada}
                    onChange={e => set("fraseDestacada", e.target.value)}
                    placeholder="«Trabajo prolijo, precio justo.»" maxLength={80} />
                </div>
              </div>

              {/* Descripción */}
              <div className="field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <label style={{ margin: 0 }}>Descripción personal</label>
                  <span style={{ fontSize: 11.5, fontFamily: "var(--font-jetbrains), monospace", color: form.descripcion.length > MAX_DESC * 0.9 ? "var(--orange)" : "var(--mute)" }}>
                    {form.descripcion.length}/{MAX_DESC}
                  </span>
                </div>
                <textarea className="ob-textarea" rows={4} value={form.descripcion}
                  onChange={e => { if (e.target.value.length <= MAX_DESC) set("descripcion", e.target.value); }}
                  placeholder="Describe tus servicios, zonas de cobertura, equipos con que cuentas, tipo de proyectos en que te especializas…"
                  style={{ marginTop: 4 }} />
              </div>

              {/* Documentos */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <YesNo label="¿Emite boleta?" value={form.emiteBoleta} onChange={v => set("emiteBoleta", v)} />
                <YesNo label="¿Emite factura?" value={form.emiteFactura} onChange={v => set("emiteFactura", v)} />
              </div>

              {/* Horario */}
              <div className="field">
                <label>Horario de atención</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, marginBottom: 14 }}>
                  {DIAS.map(d => (
                    <button key={d} type="button" onClick={() => toggleArr("dias", d)}
                      style={{
                        padding: "6px 12px",
                        border: `1.5px solid ${form.dias.includes(d) ? "var(--navy)" : "var(--line)"}`,
                        background: form.dias.includes(d) ? "var(--navy)" : "#fff",
                        color: form.dias.includes(d) ? "#fff" : "var(--ink)",
                        fontWeight: 600, fontSize: 12.5, cursor: "pointer",
                        fontFamily: "var(--font-jetbrains), monospace", transition: "all .15s",
                      }}>
                      {d}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Desde</label>
                    <input className="ob-input" type="time" value={form.horaInicio} onChange={e => set("horaInicio", e.target.value)} />
                  </div>
                  <span style={{ color: "var(--mute)", marginTop: 20 }}>—</span>
                  <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Hasta</label>
                    <input className="ob-input" type="time" value={form.horaFin} onChange={e => set("horaFin", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Fotos */}
              <div className="field">
                <label>Fotos de trabajos realizados <span style={{ color: "var(--mute)", fontWeight: 400 }}>(hasta 6)</span></label>
                <PhotoUpload photos={photos} onChange={setPhotos} />
              </div>
            </div>
          )}

          {/* ── PASO 3: Formas de pago ── */}
          {step === 3 && (
            <div className="col gap-24">
              <div>
                <span className="label" style={{ display: "block", marginBottom: 6 }}>// Paso 4 de 4</span>
                <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "var(--navy)" }}>
                  Formas de pago y redes
                </h2>
                <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>El último paso antes de publicar tu perfil.</p>
              </div>

              {/* Pagos */}
              <div className="field">
                <label>Formas de pago aceptadas</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginTop: 8 }}>
                  {PAYMENT_METHODS.map(pm => (
                    <PickBtn key={pm} label={pm} on={form.paymentMethods.includes(pm)} onClick={() => toggleArr("paymentMethods", pm)} />
                  ))}
                </div>
              </div>

              {/* Modalidad */}
              <div className="field">
                <label>Modalidad de pago</label>
                <div className="col gap-8" style={{ marginTop: 8 }}>
                  {PAYMENT_SCHEDULES.map(ps => (
                    <RadioBtn key={ps} label={ps} on={form.paymentSchedule === ps} onClick={() => set("paymentSchedule", ps)} />
                  ))}
                </div>
              </div>

              {/* Redes sociales */}
              <div className="field">
                <label>Redes sociales <span style={{ color: "var(--mute)", fontWeight: 400 }}>(opcionales)</span></label>
                <p style={{ fontSize: 12, color: "var(--mute)", margin: "2px 0 12px" }}>Aparecerán en tu tarjeta profesional.</p>
                <div className="col gap-10">
                  {[
                    { key: "whatsapp" as const, label: "WhatsApp", placeholder: "+56 9 1234 5678", prefix: "📱" },
                    { key: "instagram" as const, label: "Instagram", placeholder: "@tu_usuario", prefix: "📷" },
                    { key: "tiktok" as const, label: "TikTok", placeholder: "@tu_usuario", prefix: "🎵" },
                    { key: "facebook" as const, label: "Facebook", placeholder: "facebook.com/tu-página", prefix: "👥" },
                  ].map(({ key, label, placeholder, prefix }) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18, flexShrink: 0, width: 28, textAlign: "center" }}>{prefix}</span>
                      <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                        <label style={{ fontSize: 12 }}>{label}</label>
                        <input className="ob-input" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini-summary */}
              <div style={{ background: "var(--bg)", border: "1px solid var(--line)", padding: 16 }}>
                <span className="label" style={{ display: "block", marginBottom: 10 }}>// Tu perfil al publicar</span>
                <div className="col gap-6" style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                  <span><strong style={{ color: "var(--navy)" }}>{form.nombre}</strong> · {form.especialidadPrincipal}</span>
                  <span>{form.region}{form.radio ? ` · ${form.radio}` : ""}</span>
                  <span>{form.experiencia} años de experiencia</span>
                  {form.paymentMethods.length > 0 && <span>Acepta: {form.paymentMethods.join(", ")}</span>}
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
              style={{ flex: 1, borderColor: "var(--line)", height: 50, fontSize: 14 }}>
              ← Atrás
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              style={{
                flex: 2, background: "var(--orange)", border: "none", color: "#fff",
                fontWeight: 700, fontSize: 15, height: 50,
                cursor: canNext() ? "pointer" : "not-allowed", opacity: canNext() ? 1 : 0.4,
              }}>
              Continuar →
            </button>
          ) : (
            <button onClick={() => setDone(true)} disabled={!chkTerms || !chkDisclaimer}
              style={{
                flex: 2, border: "none", color: "#fff", fontWeight: 700, fontSize: 15, height: 50,
                background: chkTerms && chkDisclaimer ? "var(--orange)" : "var(--mute-2)",
                cursor: chkTerms && chkDisclaimer ? "pointer" : "not-allowed",
                transition: "background .2s ease",
              }}>
              Crear mi perfil ✓
            </button>
          )}
        </div>

        <p style={{ fontSize: 12, color: "var(--mute)", textAlign: "center", marginTop: 16 }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: "var(--navy)", fontWeight: 600 }}>Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

/* ── Helper ── */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13.5 }}>
      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0, marginTop: 2, minWidth: 80 }}>
        {label}
      </span>
      <span style={{ color: "var(--ink)", fontWeight: 500 }}>{children}</span>
    </div>
  );
}
