"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "jorge.arojasr@gmail.com").toLowerCase();

export interface Consulta {
  id: string;
  nombre: string;
  pregunta: string;
  respuesta: string | null;
  created_at: string;
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "hace 1 día";
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months !== 1 ? "es" : ""}`;
}

export function ConsultasSection({
  itemId,
  sellerName,
  sellerClerkId,
}: {
  itemId: string;
  sellerName: string;
  sellerClerkId: string | null;
}) {
  const { user, isLoaded } = useUser();

  const [consultas,         setConsultas]         = useState<Consulta[]>([]);
  const [userName,          setUserName]          = useState("");
  const [pregunta,          setPregunta]          = useState("");
  const [submitting,        setSubmitting]        = useState(false);
  const [sent,              setSent]              = useState(false);
  const [submitError,       setSubmitError]       = useState("");

  // Inline respond state
  const [respondingTo,      setRespondingTo]      = useState<string | null>(null);
  const [respuesta,         setRespuesta]         = useState("");
  const [respondSubmitting, setRespondSubmitting] = useState(false);
  const [respondError,      setRespondError]      = useState("");

  const isLoggedIn = isLoaded && !!user;
  const userEmail  = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  const isAdmin    = userEmail === ADMIN_EMAIL;
  const isSeller   = !!sellerClerkId && !!user && user.id === sellerClerkId;
  const canRespond = isAdmin || isSeller;

  // Fetch existing questions
  useEffect(() => {
    fetch(`/api/marketplace/consultas?item_id=${encodeURIComponent(itemId)}`)
      .then(r => r.json())
      .then((d: { consultas?: Consulta[] }) => setConsultas(d.consultas ?? []))
      .catch(() => {});
  }, [itemId]);

  // Auto-fill name from Supabase profile (read-only)
  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch("/api/my-profile")
      .then(r => r.json())
      .then((d: { nombre?: string }) => {
        const name = d.nombre?.trim() ||
          [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
          "";
        setUserName(name);
      })
      .catch(() => {
        const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
        setUserName(name);
      });
  }, [isLoaded, user]);

  async function handleSubmit() {
    if (!userName.trim() || !pregunta.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/marketplace/consultas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ item_id: itemId, nombre: userName.trim(), pregunta: pregunta.trim() }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setConsultas(prev => [...prev, {
        id: crypto.randomUUID(),
        nombre: userName.trim(),
        pregunta: pregunta.trim(),
        respuesta: null,
        created_at: new Date().toISOString(),
      }]);
      setPregunta("");
    } catch {
      setSubmitError("No se pudo enviar. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResponder(consultaId: string) {
    if (!respuesta.trim()) return;
    setRespondSubmitting(true);
    setRespondError("");
    try {
      const res = await fetch("/api/marketplace/responder", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ consulta_id: consultaId, respuesta: respuesta.trim() }),
      });
      if (!res.ok) throw new Error();
      setConsultas(prev =>
        prev.map(c => c.id === consultaId ? { ...c, respuesta: respuesta.trim() } : c)
      );
      setRespondingTo(null);
      setRespuesta("");
    } catch {
      setRespondError("Error al publicar. Intenta nuevamente.");
    } finally {
      setRespondSubmitting(false);
    }
  }

  function openRespond(id: string) {
    setRespondingTo(id);
    setRespuesta("");
    setRespondError("");
  }

  function cancelRespond() {
    setRespondingTo(null);
    setRespuesta("");
    setRespondError("");
  }

  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "22px 24px" }}>
      <span className="label" style={{ display: "block", marginBottom: 18 }}>
        // Preguntas{consultas.length > 0 ? ` (${consultas.length})` : ""}
      </span>

      {/* ── Q&A list ── */}
      {consultas.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--mute)", margin: "0 0 24px", lineHeight: 1.5 }}>
          {canRespond
            ? "No hay preguntas aún."
            : isLoggedIn
            ? "Sé el primero en hacer una pregunta."
            : "No hay preguntas aún."}
        </p>
      ) : (
        <div style={{ marginBottom: 28 }}>
          {consultas.map((c, i) => (
            <div key={c.id} style={{
              paddingBottom: 20, marginBottom: 20,
              borderBottom: i < consultas.length - 1 ? "1px solid var(--line)" : "none",
            }}>
              {/* Question row */}
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(20,55,95,0.1)", color: "var(--navy)",
                  display: "grid", placeItems: "center", flexShrink: 0,
                  fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 11,
                }}>
                  {c.nombre.trim()[0]?.toUpperCase() ?? "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "var(--mute)", marginBottom: 4 }}>
                    <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{c.nombre}</strong>
                    {" · "}{relativeDate(c.created_at)}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0, lineHeight: 1.55 }}>
                    {c.pregunta}
                  </p>
                </div>
              </div>

              {/* Answer or respond area */}
              <div style={{ marginLeft: 38 }}>
                {c.respuesta ? (
                  /* Existing answer */
                  <div style={{
                    background: "rgba(20,55,95,0.04)",
                    border: "1px solid rgba(20,55,95,0.12)",
                    padding: "12px 16px",
                  }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: "var(--navy)",
                      fontFamily: "JetBrains Mono, monospace",
                      letterSpacing: "0.08em", marginBottom: 7,
                    }}>
                      // RESPUESTA DEL VENDEDOR
                    </div>
                    <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.65 }}>
                      {c.respuesta}
                    </p>
                  </div>
                ) : canRespond ? (
                  /* Inline respond form for seller/admin */
                  respondingTo === c.id ? (
                    <div>
                      <textarea
                        value={respuesta}
                        onChange={e => setRespuesta(e.target.value)}
                        placeholder="Escribe tu respuesta…"
                        autoFocus
                        style={{
                          width: "100%", minHeight: 80, padding: "9px 12px",
                          border: "1.5px solid var(--navy)", fontSize: 13.5,
                          fontFamily: "inherit", lineHeight: 1.5, resize: "vertical",
                          boxSizing: "border-box", marginBottom: 8, outline: "none",
                        }}
                      />
                      {respondError && (
                        <p style={{ fontSize: 12, color: "#dc2626", margin: "0 0 8px" }}>⚠ {respondError}</p>
                      )}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleResponder(c.id)}
                          disabled={!respuesta.trim() || respondSubmitting}
                          style={{
                            padding: "7px 18px", border: "none", fontWeight: 700, fontSize: 13,
                            background: respuesta.trim() && !respondSubmitting ? "var(--navy)" : "var(--mute-2)",
                            color: "#fff",
                            cursor: respuesta.trim() && !respondSubmitting ? "pointer" : "not-allowed",
                          }}>
                          {respondSubmitting ? "Publicando…" : "Publicar respuesta"}
                        </button>
                        <button onClick={cancelRespond}
                          style={{ padding: "7px 14px", border: "1px solid var(--line)", background: "#fff", color: "var(--mute)", fontSize: 13, cursor: "pointer" }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => openRespond(c.id)}
                      style={{ background: "none", border: "none", color: "var(--orange)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: 0 }}>
                      Responder ↩
                    </button>
                  )
                ) : (
                  /* No answer, no respond permission */
                  <span style={{ fontSize: 12, color: "var(--mute-2)", fontStyle: "italic" }}>
                    Aún sin respuesta
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Question form / login prompt ── */}
      {!isLoaded ? null : !isLoggedIn ? (
        /* Not logged in */
        <div style={{
          padding: "16px 18px", background: "var(--bg-2)",
          border: "1px solid var(--line)", textAlign: "center",
        }}>
          <p style={{ fontSize: 13.5, color: "var(--mute)", margin: "0 0 10px" }}>
            Inicia sesión para hacer una pregunta.
          </p>
          <a href="/login"
            style={{ color: "var(--orange)", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
            Iniciar sesión →
          </a>
        </div>
      ) : canRespond ? (
        /* Seller/admin sees no question form */
        null
      ) : sent ? (
        /* Confirmation after sending */
        <div style={{ padding: "14px 16px", background: "rgba(37,165,90,0.08)", border: "1px solid rgba(37,165,90,0.2)" }}>
          <p style={{ fontSize: 13.5, color: "#1a8c4a", margin: 0, fontWeight: 600 }}>
            ✓ Tu pregunta fue enviada. El vendedor responderá pronto.
          </p>
        </div>
      ) : (
        /* Question form */
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", marginBottom: 14 }}>
            ¿Tienes alguna pregunta?
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <input
                className="ob-input"
                value={userName}
                readOnly
                placeholder="Tu nombre"
                style={{ background: "var(--bg-2)", color: "var(--ink-soft)", cursor: "default", paddingRight: 80 }}
              />
              <span style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                fontSize: 10.5, color: "var(--mute)", fontFamily: "JetBrains Mono, monospace",
                pointerEvents: "none",
              }}>
                auto-fill
              </span>
            </div>
            <textarea
              className="ob-textarea"
              value={pregunta}
              onChange={e => setPregunta(e.target.value)}
              placeholder="Escribe tu pregunta aquí…"
              style={{ minHeight: 80 }}
              maxLength={500}
            />
            {submitError && (
              <p style={{ fontSize: 12.5, color: "#dc2626", margin: 0 }}>⚠ {submitError}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!userName.trim() || !pregunta.trim() || submitting}
              style={{
                alignSelf: "flex-start", padding: "10px 22px", border: "none",
                background: userName.trim() && pregunta.trim() && !submitting ? "var(--navy)" : "var(--mute-2)",
                color: "#fff", fontWeight: 700, fontSize: 13.5,
                cursor: userName.trim() && pregunta.trim() && !submitting ? "pointer" : "not-allowed",
              }}>
              {submitting ? "Enviando…" : "Enviar pregunta →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
