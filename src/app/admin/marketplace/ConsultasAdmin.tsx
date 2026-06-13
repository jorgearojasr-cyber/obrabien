"use client";

import { useState } from "react";

export interface ConsultaAdmin {
  id: string;
  item_id: string;
  item_titulo: string;
  nombre: string;
  pregunta: string;
  created_at: string;
}

export function ConsultasAdmin({ consultas: initial }: { consultas: ConsultaAdmin[] }) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [sending,   setSending]   = useState<Record<string, boolean>>({});
  const [done,      setDone]      = useState<Record<string, boolean>>({});
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  async function handleResponder(id: string) {
    const resp = responses[id]?.trim();
    if (!resp) return;
    setSending(s => ({ ...s, [id]: true }));
    setErrors(e => ({ ...e, [id]: "" }));
    try {
      const res = await fetch("/api/admin/marketplace-responder", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ consulta_id: id, respuesta: resp }),
      });
      if (!res.ok) throw new Error();
      setDone(d => ({ ...d, [id]: true }));
    } catch {
      setErrors(e => ({ ...e, [id]: "Error al guardar. Intenta nuevamente." }));
    } finally {
      setSending(s => ({ ...s, [id]: false }));
    }
  }

  if (initial.length === 0) {
    return (
      <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "40px 32px", textAlign: "center" }}>
        <p style={{ color: "var(--mute)", fontSize: 14, margin: 0 }}>No hay preguntas sin respuesta.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {initial.map(c => {
        const date = new Date(c.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });

        if (done[c.id]) {
          return (
            <div key={c.id} style={{ background: "#fff", border: "1px solid rgba(37,165,90,0.3)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#25a55a", fontWeight: 700, fontSize: 13 }}>✓ Respondida</span>
              <span style={{ fontSize: 12.5, color: "var(--mute)" }}>{c.pregunta}</span>
            </div>
          );
        }

        return (
          <div key={c.id} style={{ background: "#fff", border: "1px solid var(--line)", padding: "18px 22px" }}>
            <div style={{ fontSize: 11, color: "var(--mute)", fontFamily: "JetBrains Mono, monospace", marginBottom: 8 }}>
              <a href={`/marketplace/${c.item_id}`} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--orange)", textDecoration: "none", fontWeight: 700 }}>
                {c.item_titulo}
              </a>
              {" · "}{date}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--mute)", marginBottom: 4 }}>
              👤 {c.nombre}
            </div>
            <p style={{ fontSize: 14.5, color: "var(--ink)", margin: "0 0 14px", lineHeight: 1.55, fontWeight: 500 }}>
              {c.pregunta}
            </p>
            <textarea
              value={responses[c.id] ?? ""}
              onChange={e => setResponses(r => ({ ...r, [c.id]: e.target.value }))}
              placeholder="Escribe la respuesta para publicar…"
              style={{
                width: "100%", minHeight: 72, padding: "10px 12px",
                border: "1.5px solid var(--line)", fontSize: 13.5,
                fontFamily: "inherit", lineHeight: 1.5, resize: "vertical",
                boxSizing: "border-box", marginBottom: 8,
              }}
            />
            {errors[c.id] && (
              <p style={{ fontSize: 12.5, color: "#dc2626", margin: "0 0 8px" }}>⚠ {errors[c.id]}</p>
            )}
            <button
              onClick={() => handleResponder(c.id)}
              disabled={!responses[c.id]?.trim() || !!sending[c.id]}
              style={{
                padding: "8px 20px", border: "none",
                background: responses[c.id]?.trim() && !sending[c.id] ? "var(--navy)" : "var(--mute-2)",
                color: "#fff", fontWeight: 700, fontSize: 13,
                cursor: responses[c.id]?.trim() && !sending[c.id] ? "pointer" : "not-allowed",
              }}>
              {sending[c.id] ? "Guardando…" : "Publicar respuesta"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
