import type { SolicitudDestinatarioEstado } from "@/lib/solicitudes";

// Sprint 20 (JOB-035): representación visual de los 7 estados posibles de un
// destinatario. Componente compartido entre la lista (SolicitudesRecibidas)
// y el detalle (SolicitudDetalle) para no duplicar esta tabla en dos lados.

const ESTILO: Record<SolicitudDestinatarioEstado, { label: string; bg: string; color: string }> = {
  enviado:         { label: "Enviada",        bg: "#F1F5F9", color: "#64748B" },
  vista:           { label: "Vista",          bg: "#EFF6FF", color: "#1D4ED8" },
  respondida:      { label: "Respondida",     bg: "#FFF7ED", color: "#C2410C" },
  aceptada:        { label: "Aceptada",       bg: "#F0FDF4", color: "#16A34A" },
  rechazada:       { label: "Rechazada",      bg: "#FEF2F2", color: "#DC2626" },
  expirada:        { label: "Expirada",       bg: "#F3F4F6", color: "#6B7280" },
  no_seleccionado: { label: "No seleccionado", bg: "#F3F4F6", color: "#6B7280" },
};

export default function EstadoBadge({ estado }: { estado: SolicitudDestinatarioEstado }) {
  const s = ESTILO[estado];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace",
      textTransform: "uppercase", letterSpacing: "0.04em",
      padding: "3px 9px", borderRadius: 4, flexShrink: 0,
    }}>
      {s.label}
    </span>
  );
}
