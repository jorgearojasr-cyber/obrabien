"use client";

import { useState, useEffect } from "react";

interface Review {
  author: string;
  date: string;
  text: string;
  rating: number;
  local?: boolean;
}

interface Props {
  masterId: string;
  masterName: string;
  initialReviews: Review[];
}

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
          {n <= (hover || value)
            ? <StarFilled size={22} />
            : <StarEmpty size={22} />}
        </button>
      ))}
    </div>
  );
}

const STORAGE_KEY = (id: string) => `obrabien_reviews_${id}`;

export default function ReviewSection({ masterId, masterName, initialReviews }: Props) {
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY(masterId));
      if (s) setLocalReviews(JSON.parse(s));
    } catch {}
  }, [masterId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Selecciona una calificación."); return; }
    if (text.trim().length < 10) { setError("La reseña debe tener al menos 10 caracteres."); return; }
    setError("");

    const now = new Date();
    const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const newReview: Review = {
      author: author.trim() || "Cliente anónimo",
      date: `${months[now.getMonth()]} ${now.getFullYear()}`,
      text: text.trim(),
      rating,
      local: true,
    };

    const updated = [newReview, ...localReviews];
    setLocalReviews(updated);
    try { localStorage.setItem(STORAGE_KEY(masterId), JSON.stringify(updated)); } catch {}
    setSubmitted(true);
    setAuthor(""); setText(""); setRating(0);
  }

  const allReviews = [...localReviews, ...initialReviews];

  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 24 }}>
      <span className="label" style={{ marginBottom: 16, display: "block" }}>// Reseñas de clientes</span>

      {/* Review list */}
      <div className="col gap-12" style={{ marginBottom: 28 }}>
        {allReviews.map((r, i) => (
          <div key={i} style={{ border: `1px solid ${r.local ? "var(--orange)" : "var(--line)"}`, padding: 16, position: "relative" }}>
            {r.local && (
              <span style={{
                position: "absolute", top: 8, right: 10,
                fontFamily: "JetBrains Mono, monospace", fontSize: 9, textTransform: "uppercase",
                letterSpacing: "0.07em", color: "var(--orange)", fontWeight: 700,
              }}>Tu reseña</span>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{r.author}</span>
                <span style={{ fontSize: 12, color: "var(--mute)", marginLeft: 8 }}>{r.date}</span>
              </div>
              <span style={{ color: "var(--orange)", display: "flex", gap: 1 }}>
                {[0,1,2,3,4].map(j => j < r.rating
                  ? <StarFilled key={j} />
                  : <StarEmpty key={j} />
                )}
              </span>
            </div>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0, lineHeight: 1.55 }}>{r.text}</p>
          </div>
        ))}
      </div>

      {/* Review form */}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 24 }}>
        <span className="label" style={{ marginBottom: 12, display: "block" }}>
          // Dejar mi reseña sobre {masterName.split(" ")[0]}
        </span>

        {submitted ? (
          <div style={{
            background: "rgba(37,165,90,0.07)", border: "1px solid #25a55a",
            padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>✓</span>
            <div>
              <div style={{ fontWeight: 600, color: "#25a55a", marginBottom: 4 }}>¡Reseña publicada!</div>
              <div style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>Gracias por compartir tu experiencia.</div>
              <button
                onClick={() => setSubmitted(false)}
                style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--navy)", fontWeight: 600, padding: 0, textDecoration: "underline" }}
              >
                Escribir otra reseña
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label>Tu nombre (opcional)</label>
              <input className="ob-input" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Nombre o apodo" />
            </div>
            <div className="field">
              <label>Calificación</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div className="field">
              <label>Comentario</label>
              <textarea className="ob-textarea" value={text} onChange={e => setText(e.target.value)} placeholder="¿Cómo fue tu experiencia con este maestro?" rows={3} required />
            </div>
            {error && <p style={{ margin: 0, fontSize: 13, color: "#e03" }}>{error}</p>}
            <button type="submit" style={{ height: 46, background: "var(--navy)", color: "#fff", border: "none", fontWeight: 700, fontSize: 14.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Publicar reseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
