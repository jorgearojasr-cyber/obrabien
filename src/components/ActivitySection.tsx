"use client";

import { useState } from "react";
import Link from "next/link";

export type ActivityItem = {
  id: string;
  kind: "foro" | "marketplace";
  title: string;
  date: string;   // ISO for sorting (already sorted server-side)
  meta: string;   // "3 respuestas" | "2 consultas"
  href: string;
};

const PAGE_SIZE = 5;

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
}

export default function ActivitySection({ items }: { items: ActivityItem[] }) {
  const [page, setPage] = useState(0);
  const pages   = Math.ceil(items.length / PAGE_SIZE);
  const visible = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (items.length === 0) return null;

  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--ink)", margin: 0 }}>
          Mi actividad reciente
        </h2>
        <span style={{ fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
          {items.length} {items.length === 1 ? "registro" : "registros"}
        </span>
      </div>

      <div className="col gap-8">
        {visible.map(item => (
          <Link
            key={`${item.kind}-${item.id}`}
            href={item.href}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              border: "1px solid var(--line)", padding: "13px 16px",
              textDecoration: "none", transition: "border-color .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--orange)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--line)")}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.kind === "foro" ? "💬" : "🛒"}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.title}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--mute)", marginTop: 3, fontFamily: "var(--font-jetbrains), monospace" }}>
                {fmt(item.date)} · {item.meta}
              </div>
            </div>
            <span style={{ fontSize: 13, color: "var(--orange)", fontWeight: 700, flexShrink: 0 }}>Ver →</span>
          </Link>
        ))}
      </div>

      {pages > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 16, justifyContent: "center" }}>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              style={{
                width: 30, height: 30,
                border: i === page ? "2px solid var(--navy)" : "1px solid var(--line)",
                background: i === page ? "var(--navy)" : "#fff",
                color: i === page ? "#fff" : "var(--ink)",
                fontWeight: i === page ? 700 : 400,
                fontSize: 12, cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
