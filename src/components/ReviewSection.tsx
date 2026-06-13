"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Lightbox from "./Lightbox";
import AuthBanner from "./AuthBanner";

interface Review {
  author: string;
  date: string;
  text: string;
  rating: number;
  local?: boolean;
  tags?: string[] | null;
  tags_negativos?: string[] | null;
  tipo_trabajo?: string | null;
  fotos?: string[] | null;
}

export interface ExistingReview {
  calificacion: number;
  comentario: string;
  tags: string[] | null;
  tags_negativos: string[] | null;
  tipo_trabajo: string | null;
  fotos: string[] | null;
}

interface Props {
  masterId: string;
  masterName: string;
  initialReviews: Review[];
  isLoggedIn: boolean;
  isOwnProfile: boolean;
  isMaestro?: boolean;
  userName?: string;
  hasReviewed?: boolean;
  existingReview?: ExistingReview | null;
}

const POS_TAGS = ["Puntual", "Responsable", "Trabajo limpio", "Buen precio", "Cordial", "Honesto", "Rápido", "Recomendable"];
const NEG_TAGS = ["Impuntual", "Trabajo descuidado", "No cumplió lo prometido", "Mal precio", "No respondió", "Dejó trabajo incompleto"];

function StarFilled({ size = 13 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M12 17.3 5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6L18.2 21z"/></svg>;
}
function StarEmpty({ size = 13 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 17.3 5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6L18.2 21z"/></svg>;
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--orange)" }}
        >
          {n <= (hover || value) ? <StarFilled size={22} /> : <StarEmpty size={22} />}
        </button>
      ))}
    </div>
  );
}

const STORAGE_KEY = (id: string) => `ObraBien_reviews_${id}`;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ReviewCard({ r }: { r: Review }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const hasPosTags = r.tags && r.tags.length > 0;
  const hasNegTags = r.tags_negativos && r.tags_negativos.length > 0;
  const photos = (r.fotos ?? []).map(url => ({ url, label: null }));

  return (
    <div style={{ border: `1px solid ${r.local ? "var(--orange)" : "var(--line)"}`, padding: 16, position: "relative" }}>
      {r.local && (
        <span style={{
          position: "absolute", top: 8, right: 10,
          fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, textTransform: "uppercase",
          letterSpacing: "0.07em", color: "var(--orange)", fontWeight: 700,
        }}>Tu reseña</span>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{r.author}</span>
          <span style={{ fontSize: 12, color: "var(--mute)", marginLeft: 8 }}>{r.date}</span>
        </div>
        <span style={{ color: "var(--orange)", display: "flex", gap: 1 }}>
          {[0,1,2,3,4].map(j => j < r.rating ? <StarFilled key={j} /> : <StarEmpty key={j} />)}
        </span>
      </div>
      {r.tipo_trabajo && (
        <div style={{ fontSize: 11.5, color: "var(--navy)", fontWeight: 700, marginBottom: 6, fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {r.tipo_trabajo}
        </div>
      )}
      <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "0 0 8px", lineHeight: 1.55 }}>{r.text}</p>
      {hasPosTags && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 5 }}>
          {r.tags!.map(tag => (
            <span key={tag} style={{
              fontSize: 11, padding: "2px 8px",
              background: "rgba(232,108,28,0.10)", color: "var(--orange)",
              border: "1px solid rgba(232,108,28,0.25)",
              fontFamily: "var(--font-jetbrains), monospace", fontWeight: 600,
            }}>{tag}</span>
          ))}
        </div>
      )}
      {hasNegTags && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 5 }}>
          {r.tags_negativos!.map(tag => (
            <span key={tag} style={{
              fontSize: 11, padding: "2px 8px",
              background: "rgba(239,68,68,0.08)", color: "#DC2626",
              border: "1px solid rgba(239,68,68,0.22)",
              fontFamily: "var(--font-jetbrains), monospace", fontWeight: 600,
            }}>{tag}</span>
          ))}
        </div>
      )}
      {photos.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {photos.map((p, fi) => (
            <button
              key={fi}
              type="button"
              onClick={() => setLightbox(fi)}
              style={{ all: "unset", cursor: "zoom-in", display: "block", flexShrink: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={`Foto ${fi + 1}`}
                style={{ width: 84, height: 63, objectFit: "cover", border: "1px solid var(--line)", display: "block", transition: "transform 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            </button>
          ))}
        </div>
      )}

      <Lightbox fotos={photos} active={lightbox} onClose={() => setLightbox(null)} onSetActive={setLightbox} />
    </div>
  );
}

export default function ReviewSection({
  masterId, masterName, initialReviews, isLoggedIn, isOwnProfile, isMaestro = false,
  userName = "", hasReviewed = false, existingReview = null,
}: Props) {
  const router = useRouter();
  const isUUID = UUID_RE.test(masterId);

  const [localReviews, setLocalReviews]     = useState<Review[]>([]);
  const [text, setText]                     = useState("");
  const [rating, setRating]                 = useState(0);
  const [selectedTags, setSelectedTags]     = useState<string[]>([]);
  const [selectedNegTags, setSelectedNegTags] = useState<string[]>([]);
  const [tipoTrabajo, setTipoTrabajo]       = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploading, setUploading]           = useState(false);
  const [submitted, setSubmitted]           = useState(false);
  const [editSuccess, setEditSuccess]       = useState(false);
  const [isEditing, setIsEditing]           = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isUUID) return;
    try {
      const s = localStorage.getItem(STORAGE_KEY(masterId));
      if (s) setLocalReviews(JSON.parse(s));
    } catch {}
  }, [masterId, isUUID]);

  function startEdit() {
    if (!existingReview) return;
    setRating(existingReview.calificacion);
    setText(existingReview.comentario);
    setSelectedTags(existingReview.tags ?? []);
    setSelectedNegTags(existingReview.tags_negativos ?? []);
    setTipoTrabajo(existingReview.tipo_trabajo ?? "");
    setUploadedPhotos(existingReview.fotos ?? []);
    setError("");
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setError("");
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  function toggleNegTag(tag: string) {
    setSelectedNegTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const toUpload = files.slice(0, 3 - uploadedPhotos.length);
    const oversized = toUpload.find(f => f.size > 4 * 1024 * 1024);
    if (oversized) {
      setError("La foto es demasiado grande. Usa imágenes de menos de 4 MB.");
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }
    setUploading(true);
    setError("");
    try {
      const urls = await Promise.all(toUpload.map(async file => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload-foto?type=resena", { method: "POST", body: fd });
        const txt = await res.text();
        if (!res.ok) {
          let msg = "Error al subir foto";
          try { msg = JSON.parse(txt).error ?? msg; } catch {}
          if (res.status === 413 || txt.toLowerCase().includes("large") || txt.toLowerCase().includes("entity")) {
            msg = "La foto es demasiado grande. Usa imágenes de menos de 4 MB.";
          }
          throw new Error(msg);
        }
        return (JSON.parse(txt) as { url: string }).url;
      }));
      setUploadedPhotos(prev => [...prev, ...urls].slice(0, 3));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir foto");
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Selecciona una calificación."); return; }
    if (text.trim().length < 10) { setError("La reseña debe tener al menos 10 caracteres."); return; }
    setError("");
    setSaving(true);

    if (isUUID) {
      try {
        const method = isEditing ? "PUT" : "POST";
        const res = await fetch("/api/resenas", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maestroId:      masterId,
            nombre:         userName || null,
            calificacion:   rating,
            comentario:     text.trim(),
            tags:           selectedTags.length > 0 ? selectedTags : null,
            tags_negativos: selectedNegTags.length > 0 ? selectedNegTags : null,
            tipo_trabajo:   tipoTrabajo.trim() || null,
            fotos:          uploadedPhotos.length > 0 ? uploadedPhotos : null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error");
        if (isEditing) {
          setIsEditing(false);
          setEditSuccess(true);
          setTimeout(() => setEditSuccess(false), 3000);
        } else {
          setSubmitted(true);
          setText(""); setRating(0); setSelectedTags([]); setSelectedNegTags([]);
          setTipoTrabajo(""); setUploadedPhotos([]);
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al publicar la reseña. Intenta de nuevo.");
      }
      setSaving(false);
      return;
    }

    // Demo profile — localStorage only
    const now = new Date();
    const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const newReview: Review = {
      author:         userName || "Cliente anónimo",
      date:           `${months[now.getMonth()]} ${now.getFullYear()}`,
      text:           text.trim(),
      rating,
      local:          true,
      tags:           selectedTags.length > 0 ? selectedTags : null,
      tags_negativos: selectedNegTags.length > 0 ? selectedNegTags : null,
      tipo_trabajo:   tipoTrabajo.trim() || null,
      fotos:          uploadedPhotos.length > 0 ? uploadedPhotos : null,
    };
    const updated = [newReview, ...localReviews];
    setLocalReviews(updated);
    try { localStorage.setItem(STORAGE_KEY(masterId), JSON.stringify(updated)); } catch {}
    setSubmitted(true);
    setText(""); setRating(0); setSelectedTags([]); setSelectedNegTags([]);
    setTipoTrabajo(""); setUploadedPhotos([]);
    setSaving(false);
  }

  const allReviews = [...localReviews, ...initialReviews];

  // ── render helpers ──────────────────────────────────────────────────────────

  function ReviewForm() {
    return (
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Author read-only */}
        <div style={{ padding: "10px 14px", background: "var(--bg-2)", border: "1px solid var(--line)", fontSize: 13.5, color: "var(--ink-soft)" }}>
          Reseña de: <strong style={{ color: "var(--ink)" }}>{userName || "Usuario"}</strong>
        </div>

        {/* Star rating */}
        <div className="field">
          <label>Calificación</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        {/* Positive tags */}
        <div className="field">
          <label>Aspectos positivos (opcional)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
            {POS_TAGS.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{
                  padding: "5px 12px", fontSize: 12.5, cursor: "pointer",
                  border: `1.5px solid ${active ? "var(--orange)" : "var(--line)"}`,
                  background: active ? "rgba(232,108,28,0.12)" : "#fff",
                  color: active ? "var(--orange)" : "var(--ink-soft)",
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontWeight: active ? 700 : 500, transition: "all .12s",
                }}>
                  {active && "✓ "}{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Negative tags */}
        <div className="field">
          <label>Aspectos negativos (opcional)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
            {NEG_TAGS.map(tag => {
              const active = selectedNegTags.includes(tag);
              return (
                <button key={tag} type="button" onClick={() => toggleNegTag(tag)} style={{
                  padding: "5px 12px", fontSize: 12.5, cursor: "pointer",
                  border: `1.5px solid ${active ? "#DC2626" : "var(--line)"}`,
                  background: active ? "rgba(239,68,68,0.10)" : "#fff",
                  color: active ? "#DC2626" : "var(--ink-soft)",
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontWeight: active ? 700 : 500, transition: "all .12s",
                }}>
                  {active && "✕ "}{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tipo de trabajo */}
        <div className="field">
          <label>Tipo de trabajo realizado (opcional)</label>
          <input
            className="ob-input"
            value={tipoTrabajo}
            onChange={e => setTipoTrabajo(e.target.value.slice(0, 60))}
            placeholder="Ej: Instalación de piso flotante"
            maxLength={60}
          />
        </div>

        {/* Comentario */}
        <div className="field">
          <label>Comentario</label>
          <textarea
            className="ob-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="¿Cómo fue tu experiencia con este maestro?"
            rows={3}
            required
          />
        </div>

        {/* Photo upload */}
        <div className="field">
          <label>Fotos del trabajo (opcional, máx. 3)</label>
          {uploadedPhotos.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {uploadedPhotos.map((url, i) => (
                <div key={i} style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Foto subida" style={{ width: 80, height: 60, objectFit: "cover", border: "1px solid var(--line)" }} />
                  <button
                    type="button"
                    onClick={() => setUploadedPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    style={{
                      position: "absolute", top: -6, right: -6, width: 18, height: 18,
                      borderRadius: "50%", background: "#EF4444", color: "#fff", border: "none",
                      cursor: "pointer", fontSize: 11, display: "grid", placeItems: "center", lineHeight: 1,
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          )}
          {uploadedPhotos.length < 3 && (
            <>
              <input ref={photoInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePhotoUpload} />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: "9px 16px", border: "1.5px dashed var(--line)",
                  background: "#fff", cursor: uploading ? "default" : "pointer",
                  fontSize: 13, color: "var(--mute)",
                  display: "inline-flex", alignItems: "center", gap: 8,
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? "Subiendo…" : "📷 Agregar foto"}
              </button>
            </>
          )}
        </div>

        {error && <p style={{ margin: 0, fontSize: 13, color: "#e03" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            disabled={saving || uploading}
            style={{
              flex: 1, height: 46,
              background: saving || uploading ? "var(--mute)" : "var(--navy)",
              color: "#fff", border: "none", fontWeight: 700, fontSize: 14.5,
              cursor: saving || uploading ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Publicar reseña"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{
                height: 46, padding: "0 18px", border: "1.5px solid var(--line)",
                background: "#fff", color: "var(--ink-soft)", fontWeight: 600,
                fontSize: 13.5, cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    );
  }

  // ── main render ─────────────────────────────────────────────────────────────

  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 24 }}>
      <span className="label" style={{ marginBottom: 16, display: "block" }}>// Reseñas de clientes</span>

      {/* Review list */}
      <div className="col gap-12" style={{ marginBottom: 28 }}>
        {allReviews.length === 0 && (
          <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>Sin reseñas aún. ¡Sé el primero en dejar una!</p>
        )}
        {allReviews.map((r, i) => <ReviewCard key={i} r={r} />)}
      </div>

      {/* Form area */}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 24 }}>
        <span className="label" style={{ marginBottom: 12, display: "block" }}>
          // {isEditing ? `Editar mi reseña sobre ${masterName.split(" ")[0]}` : `Dejar mi reseña sobre ${masterName.split(" ")[0]}`}
        </span>

        {!isLoggedIn ? (
          <AuthBanner message="Solo clientes registrados pueden dejar reseñas" />

        ) : isOwnProfile ? (
          <div style={{ padding: "16px 18px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, color: "var(--mute)" }}>
            No puedes dejar una reseña en tu propio perfil.
          </div>

        ) : isMaestro ? (
          <div style={{ padding: "16px 18px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, color: "var(--mute)" }}>
            Los maestros no pueden dejar reseñas.
          </div>

        ) : isEditing ? (
          <ReviewForm />

        ) : isUUID && hasReviewed ? (
          <div>
            {editSuccess && (
              <div style={{ padding: "10px 14px", background: "rgba(34,197,94,0.08)", border: "1px solid #22c55e", marginBottom: 10, fontSize: 13.5, color: "#15803d", display: "flex", alignItems: "center", gap: 8 }}>
                <span>✓</span> Reseña actualizada correctamente.
              </div>
            )}
            <div style={{ padding: "14px 18px", border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, color: "var(--ink-soft)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span>Ya dejaste una reseña para este maestro.</span>
              <button
                onClick={startEdit}
                style={{
                  background: "var(--navy)", color: "#fff", border: "none",
                  padding: "8px 16px", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                ✏️ Editar mi reseña
              </button>
            </div>
          </div>

        ) : submitted ? (
          <div style={{ background: "rgba(37,165,90,0.07)", border: "1px solid #25a55a", padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 20 }}>✓</span>
            <div>
              <div style={{ fontWeight: 600, color: "#25a55a", marginBottom: 4 }}>¡Reseña publicada!</div>
              <div style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>Gracias por compartir tu experiencia.</div>
              {!isUUID && (
                <button onClick={() => setSubmitted(false)} style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--navy)", fontWeight: 600, padding: 0, textDecoration: "underline" }}>
                  Escribir otra reseña
                </button>
              )}
            </div>
          </div>

        ) : (
          <ReviewForm />
        )}
      </div>
    </div>
  );
}
