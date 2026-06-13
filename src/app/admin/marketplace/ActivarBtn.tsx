"use client";

import { useState } from "react";

export function ActivarBtn({ listingId }: { listingId: string }) {
  const [state,   setState]   = useState<"idle" | "rejecting" | "busy" | "approved" | "rejected" | "error">("idle");
  const [motivo,  setMotivo]  = useState("");
  const [errMsg,  setErrMsg]  = useState("");

  async function call(action: "aprobar" | "rechazar") {
    setState("busy");
    setErrMsg("");
    try {
      const res = await fetch("/api/admin/marketplace-activar", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ listing_id: listingId, action, motivo: motivo.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Error");
      setState(action === "aprobar" ? "approved" : "rejected");
    } catch {
      setState("error");
      setErrMsg("Error al procesar. Intenta nuevamente.");
    }
  }

  if (state === "approved") return <span style={{ color: "#25a55a", fontWeight: 700, fontSize: 13 }}>✓ Aprobada</span>;
  if (state === "rejected") return <span style={{ color: "#6B7C8F", fontWeight: 700, fontSize: 13 }}>✗ Rechazada</span>;

  if (state === "rejecting") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 240 }}>
        <textarea
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          placeholder="Motivo del rechazo (opcional)"
          rows={2}
          style={{ padding: "8px 10px", border: "1.5px solid var(--line)", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => call("rechazar")}
            disabled={state === "busy"}
            style={{ flex: 1, padding: "7px 12px", background: "#dc2626", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            Confirmar rechazo
          </button>
          <button
            onClick={() => setState("idle")}
            style={{ padding: "7px 12px", border: "1.5px solid var(--line)", background: "#fff", color: "var(--mute)", fontSize: 13, cursor: "pointer" }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => call("aprobar")}
          disabled={state === "busy"}
          style={{
            padding: "8px 18px", border: "none",
            background: state === "busy" ? "var(--mute-2)" : "#25a55a",
            color: "#fff", fontWeight: 700, fontSize: 13,
            cursor: state === "busy" ? "not-allowed" : "pointer",
          }}
        >
          {state === "busy" ? "Procesando…" : "Aprobar"}
        </button>
        <button
          onClick={() => setState("rejecting")}
          disabled={state === "busy"}
          style={{
            padding: "8px 18px",
            border: "1.5px solid #dc2626",
            background: "#fff", color: "#dc2626", fontWeight: 700, fontSize: 13,
            cursor: state === "busy" ? "not-allowed" : "pointer",
          }}
        >
          Rechazar
        </button>
      </div>
      {(state === "error") && <span style={{ fontSize: 12, color: "#dc2626" }}>⚠ {errMsg}</span>}
    </div>
  );
}
