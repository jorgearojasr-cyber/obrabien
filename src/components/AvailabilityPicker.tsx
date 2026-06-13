"use client";

import { useState, useRef, useEffect } from "react";
import AvailabilityBadge from "./AvailabilityBadge";

type Status = "disponible" | "ocupado" | "no_disponible";

const OPTIONS: { value: Status; label: string; dot: string; color: string; bg: string }[] = [
  { value: "disponible",    label: "Disponible",              dot: "#22c55e", color: "#15803d", bg: "rgba(34,197,94,0.10)"  },
  { value: "ocupado",       label: "Ocupado · puede agendar", dot: "#F59E0B", color: "#92400e", bg: "rgba(245,158,11,0.10)" },
  { value: "no_disponible", label: "No disponible",           dot: "#EF4444", color: "#b91c1c", bg: "rgba(239,68,68,0.10)"  },
];

function normalize(s: string | null | undefined): Status {
  if (s === "ocupado" || s === "no_disponible") return s;
  return "disponible";
}

export default function AvailabilityPicker({
  initialStatus,
  isOwnProfile,
}: {
  initialStatus: string | null | undefined;
  isOwnProfile: boolean;
}) {
  const [status, setStatus] = useState<Status>(normalize(initialStatus));
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouse(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isOwnProfile) {
    return <AvailabilityBadge status={status} />;
  }

  async function select(val: Status) {
    setOpen(false);
    if (val === status) return;
    const prev = status;
    setSaving(true);
    setStatus(val);
    try {
      const res = await fetch("/api/disponibilidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disponibilidad: val }),
      });
      if (!res.ok) setStatus(prev);
    } catch {
      setStatus(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => !saving && setOpen(v => !v)}
        title="Cambiar disponibilidad"
        style={{
          background: "none", border: "none", padding: 0,
          cursor: saving ? "default" : "pointer",
          display: "inline-flex", alignItems: "center", gap: 5,
        }}
      >
        <AvailabilityBadge status={status} />
        <span style={{
          fontSize: 10, color: "var(--mute)",
          fontFamily: "var(--font-jetbrains), monospace",
          opacity: saving ? 0.4 : 1,
        }}>
          {saving ? "…" : "▾"}
        </span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50,
          background: "#fff", border: "1.5px solid var(--line)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.13)",
          minWidth: 210,
        }}>
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => select(opt.value)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "10px 14px",
                background: opt.value === status ? opt.bg : "transparent",
                border: "none", cursor: "pointer",
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 12.5,
                fontWeight: opt.value === status ? 700 : 500,
                color: opt.value === status ? opt.color : "var(--ink)",
                textAlign: "left",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.dot, flexShrink: 0 }} />
              {opt.label}
              {opt.value === status && (
                <span style={{ marginLeft: "auto", fontSize: 11 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
