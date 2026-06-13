"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { CAT_MAP, type ListingType } from "@/lib/marketplace";
import { REGIONS } from "@/lib/data";
import AuthBanner from "@/components/AuthBanner";

function BackIcon() { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>; }
function CheckIcon() { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>; }

const STEPS = ["Tipo", "Categoría", "Detalles"];

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

export default function PublicarPage() {
  const { user, isLoaded } = useUser();

  const [step,        setStep]        = useState(0);
  const [listingType, setListingType] = useState<ListingType | "">("");
  const [category,    setCategory]    = useState("");
  const [done,        setDone]        = useState(false);

  const [form, setForm] = useState({
    titulo: "", descripcion: "", precio: "", priceUnit: "unidad",
    region: "", ciudad: "", whatsapp: "", contactName: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const [fotos,       setFotos]       = useState<{ url: string; preview: string }[]>([]);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FOTOS = 4;

  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch("/api/my-profile")
      .then(r => r.json())
      .then((data: { nombre?: string; whatsapp?: string }) => {
        setForm(f => ({
          ...f,
          contactName: data.nombre  || "",
          whatsapp:    data.whatsapp || "",
        }));
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, [isLoaded, user]);

  const regionObj = REGIONS.find(r => r.name === form.region);
  const cities    = regionObj?.cities ?? [];
  const cats      = listingType ? CAT_MAP[listingType] : [];
  const isService = listingType === "servicio";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (fotos.length >= MAX_FOTOS) return;
    setUploadError("");
    const preview = URL.createObjectURL(file);
    setFotos(prev => [...prev, { url: "", preview }]);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/upload-foto?type=marketplace", { method: "POST", body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Error al subir");
      setFotos(prev => prev.map(f => f.preview === preview ? { url: json.url!, preview } : f));
    } catch (err) {
      setFotos(prev => prev.filter(f => f.preview !== preview));
      setUploadError(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(preview: string) {
    setFotos(prev => prev.filter(f => f.preview !== preview));
  }

  const hasPendingUpload = fotos.some(f => !f.url);

  function canNext() {
    if (step === 0) return !!listingType;
    if (step === 1) return !!category;
    if (step === 2) return !!(form.titulo.trim().length >= 10 && form.region && form.whatsapp) && !hasPendingUpload;
    return true;
  }

  async function handleContinue() {
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/marketplace/publicar", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo:         listingType,
          categoria:    category,
          titulo:       form.titulo,
          descripcion:  form.descripcion || null,
          precio:       form.precio ? Number(form.precio) : null,
          precio_unit:  form.priceUnit,
          region:       form.region  || null,
          ciudad:       form.ciudad  || null,
          whatsapp:     form.whatsapp,
          contact_name: form.contactName || null,
          fotos_urls:   fotos.filter(f => f.url).map(f => f.url),
        }),
      });
      const json = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al publicar. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Auth gate — non-logged-in users ── */
  if (isLoaded && !user) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "70vh" }}>
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
              <h1 style={{ fontFamily: "Archivo, sans-serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, color: "var(--navy)", margin: "0 0 20px" }}>
                Publicar en el marketplace
              </h1>
              <AuthBanner message="Para publicar en el marketplace necesitas una cuenta gratuita" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success screen ── */
  if (done) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 500, width: "100%", padding: "0 24px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "Archivo, sans-serif", fontSize: 26, fontWeight: 800, color: "var(--navy)", margin: "0 0 14px" }}>
            ¡Publicación enviada!
          </h2>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.7, margin: "0 0 28px" }}>
            La revisaremos en menos de 24 horas y te notificaremos cuando esté activa.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/marketplace" style={{
              display: "inline-flex", alignItems: "center",
              padding: "12px 22px", background: "var(--orange)", color: "#fff",
              fontWeight: 700, fontSize: 14, textDecoration: "none",
            }}>
              Ver el marketplace
            </Link>
            <button
              onClick={() => {
                setDone(false); setStep(0); setListingType(""); setCategory("");
                setFotos([]); setUploadError("");
                setForm({ titulo: "", descripcion: "", precio: "", priceUnit: "unidad", region: "", ciudad: "", whatsapp: form.whatsapp, contactName: form.contactName });
              }}
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
                  <TypeBtn label="Venta"    subtitle="Herramientas, materiales, equipos y más"      emoji="🏷️" active={listingType === "venta"}    onClick={() => setListingType("venta")} />
                  <TypeBtn label="Arriendo" subtitle="Maquinaria, andamios, herramientas por días"  emoji="🔄" active={listingType === "arriendo"} onClick={() => setListingType("arriendo")} />
                  <TypeBtn label="Servicio" subtitle="Ofrece tu especialidad o empresa"             emoji="🛠️" active={listingType === "servicio"} onClick={() => setListingType("servicio")} />
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
                    placeholder={isService ? "Ej: Vidriería y espejería a domicilio" : "Ej: Rotomartillo Bosch GSB 13 RE — poco uso"}
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
                      <option value="hora">Por hora</option>
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
                    <select className="ob-select" value={form.region}
                      onChange={e => { set("region", e.target.value); set("ciudad", ""); }}
                      style={{ marginTop: 6 }}>
                      <option value="">Selecciona</option>
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="field">
                    <label>Tu nombre o empresa</label>
                    <input className="ob-input" value={form.contactName}
                      onChange={e => set("contactName", e.target.value)}
                      placeholder={profileLoaded ? "Tu nombre o empresa" : "Cargando…"}
                      style={{ marginTop: 6 }} />
                    {profileLoaded && form.contactName && (
                      <p style={{ fontSize: 11, color: "var(--mute)", margin: "3px 0 0", fontFamily: "JetBrains Mono, monospace" }}>desde tu perfil · editable</p>
                    )}
                  </div>
                  <div className="field">
                    <label>WhatsApp de contacto <span style={{ color: "var(--orange)" }}>*</span></label>
                    <input className="ob-input" value={form.whatsapp}
                      onChange={e => set("whatsapp", e.target.value)}
                      placeholder={profileLoaded ? "Ej: +56912345678" : "Cargando…"}
                      type="tel"
                      style={{ marginTop: 6 }} />
                    {profileLoaded && form.whatsapp && (
                      <p style={{ fontSize: 11, color: "var(--mute)", margin: "3px 0 0", fontFamily: "JetBrains Mono, monospace" }}>desde tu perfil · editable</p>
                    )}
                  </div>
                </div>

                {/* Multi-photo upload */}
                <div className="field">
                  <label>Fotos <span style={{ color: "var(--mute)", fontWeight: 400 }}>(opcional · hasta {MAX_FOTOS})</span></label>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleFileChange} />
                  {fotos.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                      {fotos.map((f, i) => (
                        <div key={f.preview} style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={f.preview} alt={`Foto ${i + 1}`} style={{ width: 90, height: 90, objectFit: "cover", border: "1px solid var(--line)", display: "block" }} />
                          {!f.url && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--navy)", fontWeight: 700 }}>Subiendo…</div>}
                          {f.url && <button type="button" onClick={() => removePhoto(f.preview)} style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, lineHeight: 1, display: "grid", placeItems: "center" }}>✕</button>}
                          {i === 0 && <span style={{ position: "absolute", bottom: 3, left: 3, fontSize: 9, fontWeight: 700, background: "var(--navy)", color: "#fff", padding: "1px 5px", fontFamily: "JetBrains Mono, monospace" }}>PORTADA</span>}
                        </div>
                      ))}
                      {fotos.length < MAX_FOTOS && (
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                          style={{ width: 90, height: 90, border: "2px dashed var(--line)", background: "var(--bg)", color: "var(--mute)", cursor: uploading ? "not-allowed" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 11, flexShrink: 0 }}>
                          <span style={{ fontSize: 20 }}>+</span>Agregar
                        </button>
                      )}
                    </div>
                  )}
                  {fotos.length === 0 && (
                    <div role="button" tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (!file) return;
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        if (fileInputRef.current) { fileInputRef.current.files = dt.files; fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true })); }
                      }}
                      style={{ border: "2px dashed var(--line)", padding: "24px", textAlign: "center", color: "var(--mute)", fontSize: 14, background: "var(--bg)", marginTop: 6, cursor: "pointer", outline: "none" }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                      <p style={{ margin: 0 }}>Arrastra fotos aquí o <span style={{ color: "var(--orange)", fontWeight: 600 }}>haz click para seleccionar</span></p>
                      <p style={{ fontSize: 12, margin: "6px 0 0" }}>JPG / PNG / WebP · Máx. 4 MB por foto · Hasta {MAX_FOTOS} fotos</p>
                    </div>
                  )}
                  {uploadError && <p style={{ fontSize: 12.5, color: "#dc2626", margin: "6px 0 0" }}>{uploadError}</p>}
                </div>
              </div>
            )}
          </div>

          {submitError && (
            <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.3)", color: "#b91c1c", fontSize: 13.5, lineHeight: 1.5 }}>
              ⚠ {submitError}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} disabled={submitting}
                style={{ flex: 1, height: 50, border: "1.5px solid var(--line)", background: "#fff", color: "var(--ink)", fontWeight: 600, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer" }}>
                ← Atrás
              </button>
            ) : (
              <Link href="/marketplace" style={{ flex: 1, height: 50, border: "1.5px solid var(--line)", background: "#fff", color: "var(--ink)", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                Cancelar
              </Link>
            )}
            <button onClick={handleContinue} disabled={!canNext() || submitting || uploading}
              style={{
                flex: 2, height: 50, border: "none", color: "#fff", fontWeight: 700, fontSize: 15,
                background: canNext() && !submitting && !uploading ? "var(--orange)" : "var(--mute-2)",
                cursor: canNext() && !submitting && !uploading ? "pointer" : "not-allowed",
                transition: "background .2s",
              }}>
              {submitting ? "Enviando…" : step === STEPS.length - 1 ? "Publicar ahora →" : "Continuar →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
