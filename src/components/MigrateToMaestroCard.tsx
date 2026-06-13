"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  /** "dashboard" = full standalone card; "empleos" = compact block; "subtle" = small bottom banner */
  context?: "dashboard" | "empleos" | "subtle";
  /** Called when the user dismisses (empleos: switches back to oferta tab) */
  onCancel?: () => void;
}

export default function MigrateToMaestroCard({ context = "dashboard", onCancel }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/migrate-to-maestro", { method: "POST" });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error al migrar cuenta");
      // Hard navigate so Clerk client-side state re-initializes with the new role
      window.location.href = "/dashboard/maestro/completar-perfil?from=migration";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al migrar cuenta");
      setLoading(false);
    }
  }

  return (
    <>
      {context === "dashboard" ? (
        /* ── Full card for dashboard ── */
        <div style={{ background: "#fff", border: "1.5px solid var(--orange)", padding: "28px 28px 24px", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 38, lineHeight: 1, flexShrink: 0 }}>⛑</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: 17, color: "var(--navy)", margin: "0 0 6px" }}>
                ¿Eres un profesional de la construcción?
              </h3>
              <p style={{ fontSize: 14, color: "var(--mute)", margin: "0 0 18px", lineHeight: 1.6 }}>
                Cambia tu cuenta a maestro y empieza a recibir clientes gratis.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                style={{ padding: "11px 22px", background: "var(--orange)", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                Convertir mi cuenta a maestro →
              </button>
            </div>
          </div>
        </div>
      ) : context === "subtle" ? (
        /* ── Subtle bottom banner for cliente dashboard ── */
        <div style={{
          background: "#fff", border: "1px solid var(--line)",
          padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>⛑</span>
            <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
              ¿Eres profesional de la construcción?{" "}
              <span style={{ fontSize: 12.5, color: "var(--mute)" }}>Convierte tu cuenta a maestro gratis.</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{ background: "none", border: "none", padding: 0, fontSize: 13, color: "var(--navy)", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Convertir a maestro →
          </button>
        </div>
      ) : (
        /* ── Compact block for /empleos/publicar blocked state ── */
        <div style={{ border: "1.5px solid var(--line)", padding: "32px 28px", textAlign: "center", background: "var(--bg)" }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>👷</div>
          <h3 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--navy)", margin: "0 0 10px" }}>
            Convierte tu cuenta a maestro
          </h3>
          <p style={{ fontSize: 14, color: "var(--mute)", margin: "0 0 24px", lineHeight: 1.6, maxWidth: 380, marginInline: "auto" }}>
            Para ofrecerte como maestro necesitas cambiar tu cuenta.
            ¿Quieres convertirte en maestro?
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              style={{ padding: "11px 22px", background: "var(--navy)", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Sí, convertir mi cuenta →
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{ padding: "11px 22px", border: "1.5px solid var(--line)", background: "#fff", color: "var(--ink-soft)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Confirmation modal ── */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", zIndex: 300, display: "grid", placeItems: "center", padding: "0 16px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ background: "#fff", padding: "36px 32px", maxWidth: 460, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 38, marginBottom: 14, textAlign: "center" }}>⛑</div>
            <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: 20, color: "var(--navy)", margin: "0 0 12px", textAlign: "center" }}>
              ¿Convertirte en maestro?
            </h2>
            <p style={{ fontSize: 14, color: "var(--mute)", lineHeight: 1.7, margin: "0 0 24px", textAlign: "center" }}>
              Al convertirte en maestro, tu perfil de cliente se convertirá en perfil de maestro.
              Podrás completar tu información profesional y aparecer en el directorio.
            </p>
            {error && (
              <p style={{ fontSize: 13, color: "#dc2626", margin: "0 0 14px", textAlign: "center" }}>⚠ {error}</p>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  padding: "12px 24px", background: loading ? "var(--mute-2)" : "var(--navy)",
                  border: "none", color: "#fff", fontWeight: 700, fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Convirtiendo…" : "Sí, quiero ser maestro"}
              </button>
              <button
                type="button"
                onClick={() => { setShowModal(false); setError(""); }}
                disabled={loading}
                style={{ padding: "12px 24px", border: "1.5px solid var(--line)", background: "#fff", color: "var(--ink-soft)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
