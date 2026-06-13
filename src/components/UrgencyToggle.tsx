"use client";

import { useState } from "react";

export default function UrgencyToggle({ initialValue, variant = "dark" }: { initialValue: boolean; variant?: "dark" | "light" }) {
  const [active,  setActive]  = useState(initialValue);
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState("");

  async function handleToggle() {
    if (saving) return;
    const next = !active;
    setActive(next);
    setSaving(true);
    setSaveErr("");
    try {
      const res = await fetch("/api/urgencias", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ atiende_urgencias: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Error ${res.status}`);
      }
    } catch (err) {
      setActive(!next);
      setSaveErr(err instanceof Error ? err.message : "Error al guardar");
      setTimeout(() => setSaveErr(""), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <label
      style={{ display: "flex", alignItems: "center", gap: 10, cursor: saving ? "default" : "pointer" }}
      title={active ? "Desactivar atención de urgencias" : "Activar atención de urgencias"}
    >
      {/* Hidden checkbox */}
      <input
        type="checkbox"
        checked={active}
        onChange={handleToggle}
        disabled={saving}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
      />

      {/* Toggle track */}
      <span style={{
        width: 38, height: 22, borderRadius: 11, flexShrink: 0,
        background: active ? "#DC2626" : variant === "light" ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)",
        display: "inline-flex", alignItems: "center",
        padding: "3px", transition: "background 0.2s",
        opacity: saving ? 0.6 : 1,
      }}>
        <span style={{
          width: 16, height: 16, borderRadius: "50%",
          background: variant === "light" ? (active ? "#fff" : "#fff") : "#fff",
          transform: active ? "translateX(16px)" : "translateX(0)",
          transition: "transform 0.2s",
          display: "block", flexShrink: 0,
        }} />
      </span>

      {/* Label */}
      <span style={{
        fontSize: 13, fontWeight: active ? 700 : 500,
        color: active ? "#DC2626" : variant === "light" ? "var(--mute)" : "rgba(255,255,255,0.65)",
        fontFamily: "var(--font-archivo), sans-serif",
        transition: "color 0.2s",
      }}>
        🚨 Atiendo llamados de urgencia
      </span>

      {saveErr && (
        <span style={{ fontSize: 10, color: "#fca5a5", fontFamily: "var(--font-jetbrains), monospace" }}>
          {saveErr}
        </span>
      )}
    </label>
  );
}
