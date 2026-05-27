"use client";

import { useState } from "react";
import Link from "next/link";
import { CAT_MAP, type ListingType } from "@/lib/marketplace";
import { REGIONS } from "@/lib/data";

function BackIcon() { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>; }
function CheckIcon() { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>; }

const STEPS = ["Tipo", "Categoría", "Detalles", "Plan"];

/* ── Plan data ──────────────────────────────────────────────────────────── */
type PlanId = "gratis" | "basico" | "destacado" | "pro";

interface Plan {
  id: PlanId;
  name: string;
  priceProducto: string;
  priceServicio: string;
  recommended?: boolean;
  features: { label: string; included: boolean }[];
  badge?: { label: string; bg: string; color: string };
}

const PLANS_PRODUCTO: Plan[] = [
  {
    id: "gratis", name: "Gratis",
    priceProducto: "$0", priceServicio: "3 días",
    features: [
      { label: "1 publicación de prueba",        included: true  },
      { label: "30 días de visibilidad",          included: true  },
      { label: "Botón WhatsApp directo",          included: false },
      { label: "Badge destacado",                 included: false },
      { label: "Posición preferente",             included: false },
    ],
  },
  {
    id: "basico", name: "Básico",
    priceProducto: "$990", priceServicio: "$4.990/sem",
    features: [
      { label: "1 publicación",                  included: true  },
      { label: "30 días de visibilidad",          included: true  },
      { label: "Botón WhatsApp directo",          included: true  },
      { label: "Badge destacado",                 included: false },
      { label: "Posición preferente",             included: false },
    ],
  },
  {
    id: "destacado", name: "Destacado",
    priceProducto: "$2.990", priceServicio: "$14.990/mes",
    recommended: true,
    features: [
      { label: "1 publicación",                  included: true  },
      { label: "60 días de visibilidad",          included: true  },
      { label: "Botón WhatsApp directo",          included: true  },
      { label: "Badge ★ DESTACADO",              included: true  },
      { label: "Posición preferente",             included: true  },
    ],
    badge: { label: "MÁS POPULAR", bg: "var(--orange)", color: "#fff" },
  },
  {
    id: "pro", name: "PRO",
    priceProducto: "—",  priceServicio: "$34.990 / 3 meses",
    features: [
      { label: "Publicaciones ilimitadas",       included: true  },
      { label: "90 días de visibilidad",         included: true  },
      { label: "Botón WhatsApp directo",         included: true  },
      { label: "Badge ★ PRO especial",           included: true  },
      { label: "Top de resultados garantizado",  included: true  },
    ],
    badge: { label: "SOLO SERVICIOS", bg: "var(--navy)", color: "#fff" },
  },
];

/* ── Step indicator ─────────────────────────────────────────────────────── */
function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: i < current ? "var(--orange)" : i === current ? "var(--navy)" : "var(--bg-2)",
            color: i <= current ? "#fff" : "var(--mute)",
            display: "grid", placeItems: "center",
            fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700,
          }}>
            {i < current ? <CheckIcon /> : i + 1}
          </div>
          <span style={{
            marginLeft: 6, fontSize: 12.5, fontWeight: i === current ? 700 : 400,
            color: i === current ? "var(--ink)" : "var(--mute)", whiteSpace: "nowrap",
          }}>{s}</span>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 1, background: i < current ? "var(--orange)" : "var(--line)", margin: "0 12px" }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Type button ────────────────────────────────────────────────────────── */
function TypeBtn({ label, subtitle, emoji, active, onClick }: { label: string; subtitle: string; emoji: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        flex: 1, minWidth: 140, padding: "20px 16px", textAlign: "center",
        border: `2px solid ${active ? "var(--navy)" : "var(--line)"}`,
        background: active ? "rgba(20,55,95,0.05)" : "#fff",
        cursor: "pointer", transition: "all .15s",
      }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 16, color: active ? "var(--navy)" : "var(--ink)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: "var(--mute)", lineHeight: 1.4 }}>{subtitle}</div>
    </button>
  );
}

/* ── Main ───────────────────────────────────────────────────────────────── */
export default function PublicarPage() {
  const [step,        setStep]        = useState(0);
  const [listingType, setListingType] = useState<ListingType | "">("");
  const [category,    setCategory]    = useState("");
  const [plan,        setPlan]        = useState<PlanId>("gratis");
  const [done,        setDone]        = useState(false);

  const [form, setForm] = useState({
    titulo: "", descripcion: "", precio: "", priceUnit: "unidad",
    region: "", ciudad: "", whatsapp: "", contactName: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const cats = listingType ? CAT_MAP[listingType] : [];
  const isService = listingType === "servicio";

  function canNext() {
    if (step === 0) return !!listingType;
    if (step === 1) return !!category;
    if (step === 2) return !!(form.titulo.trim().length >= 10 && form.region && form.whatsapp);
    return true;
  }

  function handleContinue() {
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    setDone(true);
  }

  /* ── Success ── */
  if (done) {
    const planCfg = PLANS_PRODUTO_MAP[plan];
    return (
      <div style={{ background: "var(--bg)", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 500, width: "100%", padding: "0 24px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "Archivo, sans-serif", fontSize: 28, fontWeight: 800, color: "var(--navy)", margin: "0 0 12px" }}>
            ¡Publicación enviada!
          </h2>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.65, margin: "0 0 8px" }}>
            Tu publicación está en revisión y estará visible en el marketplace en los próximos minutos.
          </p>
          {plan !== "gratis" && (
            <div style={{ background: "rgba(232,108,28,0.08)", border: "1px solid rgba(232,108,28,0.3)", padding: "12px 16px", margin: "20px 0", textAlign: "left" }}>
              <p style={{ fontSize: 13.5, color: "var(--orange)", margin: 0, fontWeight: 600 }}>
                Plan {planCfg.name} seleccionado. Para activarlo, un agente ObrabiEN se contactará contigo por WhatsApp en las próximas horas.
              </p>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
            <Link href="/marketplace" style={{
              display: "inline-flex", alignItems: "center",
              padding: "12px 22px", background: "var(--orange)", color: "#fff",
              fontWeight: 700, fontSize: 14, textDecoration: "none",
            }}>
              Ver el marketplace
            </Link>
            <button onClick={() => { setDone(false); setStep(0); setListingType(""); setCategory(""); setPlan("gratis"); setForm({ titulo: "", descripcion: "", precio: "", priceUnit: "unidad", region: "", ciudad: "", whatsapp: "", contactName: "" }); }}
              style={{ padding: "12px 22px", border: "1.5px solid var(--ink)", background: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "var(--ink)" }}>
              Nueva publicación
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "70vh" }}>
      {/* Back bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "12px 0" }}>
        <div className="wrap">
          <Link href="/marketplace" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mute)", textDecoration: "none", fontWeight: 500 }}>
            <BackIcon /> Volver al marketplace
          </Link>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <span className="label" style={{ display: "block", marginBottom: 8 }}>// Nueva publicación</span>
            <h1 style={{ fontFamily: "Archivo, sans-serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
              Publicar en el marketplace
            </h1>
          </div>

          <StepBar current={step} />

          <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "28px 28px 24px" }}>

            {/* PASO 0: Tipo */}
            {step === 0 && (
              <div>
                <h2 style={{ fontFamily: "Archivo, sans-serif", fontSize: 18, fontWeight: 800, color: "var(--navy)", margin: "0 0 6px" }}>¿Qué quieres publicar?</h2>
                <p style={{ fontSize: 13.5, color: "var(--mute)", margin: "0 0 22px" }}>Elige el tipo de publicación para ver las categorías disponibles.</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <TypeBtn label="Venta" subtitle="Herramientas, materiales, equipos y más" emoji="🏷️" active={listingType === "venta"} onClick={() => setListingType("venta")} />
                  <TypeBtn label="Arriendo" subtitle="Maquinaria, andamios, herramientas por días" emoji="🔄" active={listingType === "arriendo"} onClick={() => setListingType("arriendo")} />
                  <TypeBtn label="Servicio" subtitle="Ofrece tu especialidad o empresa" emoji="🛠️" active={listingType === "servicio"} onClick={() => setListingType("servicio")} />
                </div>
              </div>
            )}

            {/* PASO 1: Categoría */}
            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: "Archivo, sans-serif", fontSize: 18, fontWeight: 800, color: "var(--navy)", margin: "0 0 6px" }}>Categoría</h2>
                <p style={{ fontSize: 13.5, color: "var(--mute)", margin: "0 0 18px" }}>Elige la categoría que mejor describe tu publicación.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                  {cats.map(cat => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)}
                      style={{
                        padding: "14px 16px", textAlign: "left",
                        border: `1.5px solid ${category === cat ? "var(--navy)" : "var(--line)"}`,
                        background: category === cat ? "rgba(20,55,95,0.05)" : "#fff",
                        fontWeight: category === cat ? 700 : 500, fontSize: 14,
                        color: category === cat ? "var(--navy)" : "var(--ink)",
                        cursor: "pointer", transition: "all .15s",
                      }}>
                      {category === cat ? "● " : "○ "}{cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 2: Detalles */}
            {step === 2 && (
              <div className="col gap-18">
                <div>
                  <h2 style={{ fontFamily: "Archivo, sans-serif", fontSize: 18, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>Detalles de la publicación</h2>
                  <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>Completa la información de tu publicación.</p>
                </div>

                <div className="field">
                  <label>Título <span style={{ color: "var(--orange)" }}>*</span></label>
                  <input className="ob-input" value={form.titulo} onChange={e => set("titulo", e.target.value)}
                    placeholder={listingType === "servicio" ? "Ej: Vidriería y espejería a domicilio" : "Ej: Rotomartillo Bosch GSB 13 RE — poco uso"}
                    maxLength={100} style={{ marginTop: 6 }} />
                  <p style={{ fontSize: 11.5, color: "var(--mute)", margin: "4px 0 0" }}>{form.titulo.length}/100 {form.titulo.length < 10 && form.titulo.length > 0 && "— mínimo 10 caracteres"}</p>
                </div>

                <div className="field">
                  <label>Descripción</label>
                  <textarea className="ob-textarea" value={form.descripcion} onChange={e => set("descripcion", e.target.value)}
                    placeholder="Describe el producto o servicio con el mayor detalle posible: estado, especificaciones técnicas, qué incluye, condiciones de venta o arriendo..."
                    style={{ minHeight: 150, marginTop: 6 }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="field">
                    <label>Precio {isService && <span style={{ color: "var(--mute)", fontWeight: 400 }}>(o "A convenir")</span>}</label>
                    <input className="ob-input" type="number" value={form.precio} onChange={e => set("precio", e.target.value)}
                      placeholder={isService ? "Dejar vacío = a convenir" : "Ej: 45000"} style={{ marginTop: 6 }} />
                  </div>
                  <div className="field">
                    <label>Unidad de precio</label>
                    <select className="ob-select" value={form.priceUnit} onChange={e => set("priceUnit", e.target.value)} style={{ marginTop: 6 }}>
                      <option value="unidad">Por unidad</option>
                      <option value="lote">Por lote</option>
                      <option value="m2">Por m²</option>
                      <option value="kg">Por kg</option>
                      <option value="día">Por día</option>
                      <option value="semana">Por semana</option>
                      <option value="mes">Por mes</option>
                      <option value="servicio">Por servicio</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="field">
                    <label>Región <span style={{ color: "var(--orange)" }}>*</span></label>
                    <select className="ob-select" value={form.region} onChange={e => set("region", e.target.value)} style={{ marginTop: 6 }}>
                      <option value="">Selecciona</option>
                      {REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Ciudad / Comuna</label>
                    <input className="ob-input" value={form.ciudad} onChange={e => set("ciudad", e.target.value)} placeholder="Ej: Santiago" style={{ marginTop: 6 }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="field">
                    <label>Tu nombre o empresa</label>
                    <input className="ob-input" value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="Ej: Juan Pérez" style={{ marginTop: 6 }} />
                  </div>
                  <div className="field">
                    <label>WhatsApp de contacto <span style={{ color: "var(--orange)" }}>*</span></label>
                    <input className="ob-input" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="+56 9 1234 5678" type="tel" style={{ marginTop: 6 }} />
                  </div>
                </div>

                {/* Photo upload placeholder */}
                <div className="field">
                  <label>Fotos <span style={{ color: "var(--mute)", fontWeight: 400 }}>(opcionales)</span></label>
                  <div style={{
                    border: "2px dashed var(--line)", padding: "24px", textAlign: "center",
                    color: "var(--mute)", fontSize: 14, background: "var(--bg)", marginTop: 6, cursor: "pointer",
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                    <p style={{ margin: 0 }}>Arrastra tus fotos aquí o <span style={{ color: "var(--orange)", fontWeight: 600 }}>haz click para seleccionar</span></p>
                    <p style={{ fontSize: 12, margin: "6px 0 0" }}>Máx. 5 fotos · JPG/PNG · Hasta 5MB cada una</p>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: Plan */}
            {step === 3 && (
              <div>
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ fontFamily: "Archivo, sans-serif", fontSize: 18, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>Elige tu plan</h2>
                  <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>
                    {isService ? "Planes para servicios." : "Planes para productos."} La primera publicación es siempre gratis.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
                  {PLANS_PRODUCTO.filter((p: Plan) => !isService || p.id !== "gratis" || true).map((p: Plan) => {
                    if (p.id === "pro" && !isService) return null;
                    const active = plan === p.id;
                    return (
                      <button key={p.id} type="button" onClick={() => setPlan(p.id)}
                        style={{
                          padding: "16px 14px", textAlign: "center", position: "relative",
                          border: `2px solid ${active ? "var(--orange)" : "var(--line)"}`,
                          background: active ? "rgba(232,108,28,0.05)" : "#fff",
                          cursor: "pointer", transition: "all .15s",
                        }}>
                        {p.badge && (
                          <span style={{
                            position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                            padding: "2px 8px", background: p.badge.bg, color: p.badge.color,
                            fontSize: 9, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.07em", whiteSpace: "nowrap",
                          }}>
                            {p.badge.label}
                          </span>
                        )}
                        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 14, color: active ? "var(--orange)" : "var(--navy)", marginBottom: 6, marginTop: p.badge ? 6 : 0 }}>{p.name}</div>
                        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
                          {isService ? p.priceServicio : p.priceProducto}
                        </div>
                        <div className="col gap-5">
                          {p.features.map((f: { label: string; included: boolean }) => (
                            <div key={f.label} style={{ display: "flex", alignItems: "flex-start", gap: 5, fontSize: 11.5, color: f.included ? "var(--ink-soft)" : "var(--mute-2)", textAlign: "left", lineHeight: 1.4 }}>
                              <span style={{ color: f.included ? "#25a55a" : "var(--mute-2)", fontWeight: 700, flexShrink: 0 }}>{f.included ? "✓" : "✗"}</span>
                              {f.label}
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Aviso gratis */}
                {plan === "gratis" && (
                  <div style={{
                    padding: "12px 14px", background: "rgba(37,165,90,0.08)",
                    border: "1px solid rgba(37,165,90,0.2)", display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>🎁</span>
                    <p style={{ fontSize: 13, color: "#1a8c4a", margin: 0, lineHeight: 1.5 }}>
                      {isService
                        ? "Con el plan gratuito tendrás 3 días de visibilidad para probar el marketplace. ¡Sin costo, sin tarjeta!"
                        : "Tu primera publicación es completamente gratis. ¡Sin costo, sin tarjeta de crédito!"}
                    </p>
                  </div>
                )}
                {plan !== "gratis" && (
                  <div style={{ padding: "12px 14px", background: "rgba(20,55,95,0.05)", border: "1px solid rgba(20,55,95,0.15)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>ℹ️</span>
                    <p style={{ fontSize: 13, color: "var(--navy)", margin: 0, lineHeight: 1.5 }}>
                      Después de publicar, un agente ObrabiEN se contactará por WhatsApp para coordinar el pago. Sin cobro automático.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)}
                style={{ flex: 1, height: 50, border: "1.5px solid var(--line)", background: "#fff", color: "var(--ink)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                ← Atrás
              </button>
            ) : (
              <Link href="/marketplace" style={{ flex: 1, height: 50, border: "1.5px solid var(--line)", background: "#fff", color: "var(--ink)", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                Cancelar
              </Link>
            )}
            <button onClick={handleContinue} disabled={!canNext()}
              style={{
                flex: 2, height: 50, border: "none", color: "#fff", fontWeight: 700, fontSize: 15,
                background: canNext() ? "var(--orange)" : "var(--mute-2)",
                cursor: canNext() ? "pointer" : "not-allowed",
                transition: "background .2s",
              }}>
              {step === STEPS.length - 1 ? "Publicar ahora →" : "Continuar →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PLANS_PRODUTO_MAP: Record<PlanId, { name: string }> = {
  gratis:    { name: "Gratuito" },
  basico:    { name: "Básico" },
  destacado: { name: "Destacado" },
  pro:       { name: "PRO" },
};
