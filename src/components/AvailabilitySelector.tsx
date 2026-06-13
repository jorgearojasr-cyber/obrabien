"use client";

import { useState } from "react";

type Status = "disponible" | "ocupado" | "no_disponible";

const OPTIONS: { value: Status; label: string; dot: string; activeBg: string }[] = [
  { value: "disponible",    label: "Disponible",    dot: "#22c55e", activeBg: "#22c55e" },
  { value: "ocupado",       label: "Ocupado",       dot: "#F59E0B", activeBg: "#F59E0B" },
  { value: "no_disponible", label: "No disponible", dot: "#EF4444", activeBg: "#EF4444" },
];

export default function AvailabilitySelector({ initialValue }: { initialValue: string }) {
  const [status,  setStatus]  = useState<Status>((initialValue as Status) || "disponible");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [saveErr, setSaveErr] = useState("");

  async function select(val: Status) {
    if (val === status || saving) return;
    const prev = status;
    setStatus(val);
    setSaving(true);
    setSaved(false);
    setSaveErr("");
    try {
      const res = await fetch("/api/disponibilidad", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ disponibilidad: val }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Error ${res.status}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setStatus(prev);
      setSaveErr(err instanceof Error ? err.message : "Error al guardar");
      setTimeout(() => setSaveErr(""), 3500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="avail-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
      {/* Segmented toggle */}
      <div className="avail-selector" style={{ display: "inline-flex", height: 34 }}>
        {OPTIONS.map((opt, i) => {
          const active = status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => select(opt.value)}
              disabled={saving}
              style={{
                position: "relative",
                zIndex: active ? 1 : 0,
                height: 34,
                padding: "0 13px",
                border: `1.5px solid ${opt.dot}`,
                marginLeft: i > 0 ? -1.5 : 0,
                background: active ? opt.activeBg : "#fff",
                color: active ? "#fff" : "var(--ink-soft)",
                cursor: saving ? "default" : "pointer",
                fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                fontFamily: "var(--font-archivo), sans-serif",
                whiteSpace: "nowrap",
                transition: "background .15s, color .15s",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                opacity: saving && !active ? 0.65 : 1,
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                background: active ? "rgba(255,255,255,0.85)" : opt.dot,
              }} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Status feedback — small line below */}
      {saving && (
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-jetbrains), monospace" }}>
          Guardando…
        </span>
      )}
      {saved && !saving && (
        <span style={{ fontSize: 10, color: "#86efac", fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700 }}>
          ✓ Guardado
        </span>
      )}
      {saveErr && !saving && (
        <span style={{ fontSize: 10, color: "#fca5a5", fontFamily: "var(--font-jetbrains), monospace" }}>
          {saveErr}
        </span>
      )}
    </div>
  );
}
