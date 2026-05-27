"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FORUM_CATEGORIES } from "@/lib/forum";

const CATS = FORUM_CATEGORIES.filter(c => c.id !== "todos");

function BackIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>;
}

export default function NuevaPublicacionPage() {
  const router = useRouter();

  const [title,        setTitle]        = useState("");
  const [category,     setCategory]     = useState("");
  const [content,      setContent]      = useState("");
  const [tags,         setTags]         = useState("");
  const [whoCanReply,  setWhoCanReply]  = useState<"todos" | "maestros">("todos");
  const [submitted,    setSubmitted]    = useState(false);

  const canSubmit = title.trim().length >= 10 && category && content.trim().length >= 30;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 480, width: "100%", padding: "0 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: "Archivo, sans-serif", fontSize: 26, fontWeight: 800, color: "var(--navy)", margin: "0 0 12px" }}>
            ¡Publicación enviada!
          </h2>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 28px" }}>
            Tu pregunta fue publicada en el foro. La comunidad podrá responderla pronto.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/comunidad" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "12px 22px", background: "var(--orange)", color: "#fff",
              fontWeight: 700, fontSize: 14, textDecoration: "none",
            }}>
              Ver el foro
            </Link>
            <button onClick={() => { setSubmitted(false); setTitle(""); setCategory(""); setContent(""); setTags(""); }}
              style={{
                padding: "12px 22px", border: "1.5px solid var(--ink)",
                background: "#fff", color: "var(--ink)", fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}>
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
          <Link href="/comunidad" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mute)", textDecoration: "none", fontWeight: 500 }}>
            <BackIcon /> Volver al foro
          </Link>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <span className="label" style={{ display: "block", marginBottom: 8 }}>// Nueva publicación</span>
            <h1 style={{ fontFamily: "Archivo, sans-serif", fontSize: "clamp(24px,3vw,32px)", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
              Hacer una pregunta al foro
            </h1>
            <p style={{ fontSize: 14, color: "var(--mute)", marginTop: 8 }}>
              La comunidad de maestros y clientes está aquí para ayudar. Cuanto más detallada sea tu pregunta, mejor respuesta obtendrás.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="col gap-20">

            {/* Título */}
            <div className="field">
              <label>
                Título de la publicación
                <span style={{ color: "var(--orange)", marginLeft: 4 }}>*</span>
              </label>
              <input
                className="ob-input"
                placeholder="Ej: ¿Cuánto cobrar por instalación de porcelanato 60x60 en RM?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={120}
                style={{ marginTop: 6 }}
              />
              <div style={{ fontSize: 11.5, color: title.length < 10 ? "var(--mute)" : "var(--orange)", marginTop: 4 }}>
                {title.length}/120 caracteres {title.length < 10 && title.length > 0 && "— mínimo 10"}
              </div>
            </div>

            {/* Categoría */}
            <div className="field">
              <label>
                Categoría
                <span style={{ color: "var(--orange)", marginLeft: 4 }}>*</span>
              </label>
              <select
                className="ob-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ marginTop: 6 }}
              >
                <option value="">Selecciona una categoría</option>
                {CATS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Contenido */}
            <div className="field">
              <label>
                Contenido / descripción
                <span style={{ color: "var(--orange)", marginLeft: 4 }}>*</span>
              </label>
              <p style={{ fontSize: 12, color: "var(--mute)", margin: "2px 0 8px", lineHeight: 1.5 }}>
                Explica tu pregunta con detalle: contexto, lo que ya probaste, región donde trabajas, materiales involucrados.
              </p>
              <textarea
                className="ob-textarea"
                placeholder="Describe tu situación con el mayor detalle posible..."
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{ minHeight: 180, marginTop: 0 }}
              />
              <div style={{ fontSize: 11.5, color: content.length < 30 ? "var(--mute)" : "var(--orange)", marginTop: 4 }}>
                {content.length} caracteres {content.length < 30 && content.length > 0 && "— mínimo 30"}
              </div>
            </div>

            {/* Tags */}
            <div className="field">
              <label>Tags <span style={{ color: "var(--mute)", fontWeight: 400 }}>(opcionales)</span></label>
              <input
                className="ob-input"
                placeholder="Ej: cerámica, precios, RM"
                value={tags}
                onChange={e => setTags(e.target.value)}
                style={{ marginTop: 6 }}
              />
              <p style={{ fontSize: 11.5, color: "var(--mute)", margin: "4px 0 0" }}>Separa los tags con comas. Ayuda a otros a encontrar tu publicación.</p>
            </div>

            {/* ¿Quién puede responder? */}
            <div className="field">
              <label>¿Quién puede responder?</label>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {([
                  { val: "todos",    label: "Todos",           desc: "Maestros y clientes" },
                  { val: "maestros", label: "Solo maestros",   desc: "Respuestas expertas" },
                ] as const).map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setWhoCanReply(opt.val)}
                    style={{
                      flex: 1, padding: "12px 14px", textAlign: "left",
                      border: `1.5px solid ${whoCanReply === opt.val ? "var(--navy)" : "var(--line)"}`,
                      background: whoCanReply === opt.val ? "rgba(20,55,95,0.05)" : "#fff",
                      cursor: "pointer", transition: "all .15s",
                    }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: whoCanReply === opt.val ? "var(--navy)" : "var(--ink)", marginBottom: 2 }}>
                      {whoCanReply === opt.val ? "● " : "○ "}{opt.label}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--mute)" }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aviso */}
            <div style={{
              background: "var(--bg-2)", border: "1px solid var(--line)", padding: "12px 16px",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
              <p style={{ fontSize: 12.5, color: "var(--mute)", lineHeight: 1.6, margin: 0 }}>
                Las publicaciones son revisadas por la comunidad. Evita compartir información personal de clientes, precios exactos de terceros o contenido no relacionado con el rubro.
              </p>
            </div>

            {/* Submit */}
            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/comunidad"
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  height: 50, border: "1.5px solid var(--line)", background: "#fff",
                  color: "var(--ink)", fontWeight: 600, fontSize: 14, textDecoration: "none",
                }}>
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  flex: 2, height: 50, border: "none", color: "#fff",
                  fontWeight: 700, fontSize: 15,
                  background: canSubmit ? "var(--orange)" : "var(--mute-2)",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  transition: "background .2s",
                }}>
                Publicar en el foro →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
