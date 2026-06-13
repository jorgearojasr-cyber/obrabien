type Status = "disponible" | "ocupado" | "no_disponible" | string | null | undefined;

const CONFIG: Record<string, { label: string; dot: string; bg: string; color: string }> = {
  disponible:    { label: "Disponible",              dot: "#22c55e", bg: "rgba(34,197,94,0.10)",  color: "#15803d" },
  ocupado:       { label: "Ocupado · puede agendar", dot: "#F59E0B", bg: "rgba(245,158,11,0.10)", color: "#92400e" },
  no_disponible: { label: "No disponible",           dot: "#EF4444", bg: "rgba(239,68,68,0.10)",  color: "#b91c1c" },
};

export default function AvailabilityBadge({ status, size = "md" }: { status: Status; size?: "sm" | "md" }) {
  const key = status && status in CONFIG ? status : "disponible";
  const { label, dot, bg, color } = CONFIG[key];
  const fontSize = size === "sm" ? 11 : 12.5;
  const pad      = size === "sm" ? "2px 8px" : "4px 10px";

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: bg, color,
      padding: pad, fontSize, fontWeight: 600,
      fontFamily: "var(--font-jetbrains), monospace",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}
