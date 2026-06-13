"use client";

import { useEffect, useState } from "react";

export default function CancelMigrationBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("message") === "cancelado") {
      setShow(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("message");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  if (!show) return null;

  return (
    <div style={{
      background: "#fff", border: "1.5px solid var(--line)",
      borderLeft: "4px solid var(--navy)",
      padding: "14px 18px", marginBottom: 24,
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <span style={{ fontSize: 18 }}>✓</span>
      <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600 }}>
        Cancelado. Tu cuenta sigue siendo de cliente.
      </span>
      <button
        onClick={() => setShow(false)}
        style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--mute)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  );
}
