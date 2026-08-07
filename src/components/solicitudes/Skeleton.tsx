// Sprint 25 (item 8): loader compartido para las 4 pantallas de Solicitudes
// que hasta ahora mostraban el texto plano "Cargando…" (SolicitudDetalle,
// SolicitudDetalleCliente, SolicitudesRecibidas, MisSolicitudes). Reutiliza
// la animación @keyframes pulse ya definida en globals.css — ninguna CSS
// nueva, ningún componente por pantalla.

function Bar({ width = "100%", height = 14 }: { width?: string | number; height?: number }) {
  return (
    <div style={{
      width, height, background: "var(--bg-2)",
      animation: "pulse 1.4s ease-in-out infinite",
    }} />
  );
}

/** Loader para una pantalla de detalle (encabezado + un par de bloques). */
export function DetalleSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
        <Bar width={90} height={18} />
        <Bar width="70%" height={22} />
        <Bar width="100%" />
        <Bar width="85%" />
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Bar width={140} height={12} />
        <Bar width="60%" height={18} />
      </div>
    </div>
  );
}

/** Loader para una lista de tarjetas (Solicitudes recibidas / Mis solicitudes). */
export function ListaSkeleton({ items = 2 }: { items?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} style={{ border: "1px solid var(--line)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <Bar width={90} height={16} />
          <Bar width="90%" />
          <Bar width="50%" />
        </div>
      ))}
    </div>
  );
}
