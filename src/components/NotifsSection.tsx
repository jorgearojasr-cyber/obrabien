"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type Notif = {
  id: string;
  tipo: string;
  mensaje: string;
  link: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function notifIcon(tipo: string) {
  if (tipo === "marketplace_consulta") return "🛒";
  if (tipo === "respuesta_foro" || tipo === "foro_respuesta") return "💬";
  if (tipo === "verificacion") return "✅";
  return "🔔";
}

export default function NotifsSection({ initial }: { initial: Notif[] }) {
  const router   = useRouter();
  const [notifs, setNotifs]   = useState(initial);
  const [marking, setMarking] = useState(false);

  if (notifs.length === 0) return null;

  async function markOne(n: Notif) {
    // Optimistically remove from list
    setNotifs(prev => prev.filter(x => x.id !== n.id));
    try {
      await fetch("/api/notificaciones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      });
    } catch { /* silent */ }
    if (n.link) router.push(n.link);
  }

  async function markAllRead() {
    setMarking(true);
    try {
      await fetch("/api/notificaciones", { method: "POST" });
      setNotifs([]);
    } finally {
      setMarking(false);
    }
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--ink)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          Notificaciones
          <span style={{ background: "#EF4444", color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "1px 8px", fontFamily: "var(--font-jetbrains), monospace" }}>
            {notifs.length}
          </span>
        </h2>
        <button
          onClick={markAllRead}
          disabled={marking}
          style={{
            padding: "6px 14px", border: "1px solid var(--line)", background: "#fff",
            color: "var(--mute)", fontSize: 12.5, fontWeight: 600,
            cursor: marking ? "default" : "pointer", opacity: marking ? 0.6 : 1,
          }}
        >
          {marking ? "Marcando…" : "Marcar todas como leídas"}
        </button>
      </div>

      <div className="col gap-8">
        {notifs.map(n => (
          <button
            key={n.id}
            type="button"
            onClick={() => markOne(n)}
            style={{
              width: "100%", textAlign: "left", background: "#fff",
              border: "1px solid var(--line)", borderLeft: "3px solid var(--orange)",
              padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 12,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{notifIcon(n.tipo)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1.45, display: "block" }}>
                {n.mensaje}
              </span>
              <span style={{ fontSize: 11, color: "var(--mute)", marginTop: 4, display: "block", fontFamily: "var(--font-jetbrains), monospace" }}>
                {formatDate(n.created_at)}
              </span>
            </div>
            {n.link && (
              <span style={{ fontSize: 12.5, color: "var(--orange)", fontWeight: 700, flexShrink: 0 }}>
                Ver →
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
