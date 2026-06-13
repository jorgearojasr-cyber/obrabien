"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Notif = {
  id: string;
  tipo: string;
  mensaje: string;
  link: string | null;
  created_at: string;
};

const ICONS: Record<string, string> = {
  empleo_postulacion:   "💼",
  marketplace_consulta: "🛒",
  respuesta_foro:       "💬",
};

export default function NotificacionesBanner() {
  const [notifs,  setNotifs]  = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState(false);

  useEffect(() => {
    fetch("/api/notificaciones")
      .then(r => r.ok ? r.json() : { data: [] })
      .then(d => setNotifs(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function markAllRead() {
    setBusy(true);
    await fetch("/api/notificaciones", { method: "POST" }).catch(() => {});
    setNotifs([]);
    setBusy(false);
  }

  async function dismiss(id: string) {
    await fetch("/api/notificaciones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
    setNotifs(n => n.filter(x => x.id !== id));
  }

  if (loading || notifs.length === 0) return null;

  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderLeft: "3px solid #EF4444", marginBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", flexShrink: 0, display: "inline-block" }} />
          <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>
            {notifs.length} notificación{notifs.length !== 1 ? "es" : ""} sin leer
          </span>
        </div>
        <button
          onClick={markAllRead}
          disabled={busy}
          style={{ fontSize: 12, color: "var(--mute)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}
        >
          Marcar todo leído
        </button>
      </div>

      {/* Items */}
      <div style={{ borderTop: "1px solid var(--line)" }}>
        {notifs.map((n, i) => (
          <div key={n.id} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "11px 16px",
            borderBottom: i < notifs.length - 1 ? "1px solid var(--line)" : undefined,
          }}>
            <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>
              {ICONS[n.tipo] ?? "🔔"}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              {n.link ? (
                <Link
                  href={n.link}
                  onClick={() => dismiss(n.id)}
                  style={{ fontSize: 13.5, color: "var(--ink)", textDecoration: "none", lineHeight: 1.4, display: "block" }}
                >
                  {n.mensaje}
                </Link>
              ) : (
                <span style={{ fontSize: 13.5, color: "var(--ink)", lineHeight: 1.4 }}>{n.mensaje}</span>
              )}
            </div>
            <button
              onClick={() => dismiss(n.id)}
              title="Descartar"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mute)", fontSize: 15, padding: "0 0 0 4px", flexShrink: 0, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
