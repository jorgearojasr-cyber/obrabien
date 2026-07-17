"use client";

import { useState } from "react";

export default function CopyReferralLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const [error,  setError]  = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar — copia el link manualmente");
      setTimeout(() => setError(""), 3500);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <code style={{
          fontFamily: "var(--font-jetbrains), monospace", fontSize: 12.5, color: "var(--ink-soft)",
          background: "var(--bg-2)", border: "1px solid var(--line)", padding: "8px 12px",
          wordBreak: "break-all", flex: "1 1 260px",
        }}>
          {url}
        </code>
        <button
          type="button"
          onClick={copy}
          style={{
            height: 38, padding: "0 16px", border: "none", background: "var(--orange)",
            color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          {copied ? "✓ Copiado" : "Copiar link"}
        </button>
      </div>
      {error && (
        <span style={{ fontSize: 11.5, color: "#b91c1c", fontFamily: "var(--font-jetbrains), monospace" }}>
          {error}
        </span>
      )}
    </div>
  );
}
