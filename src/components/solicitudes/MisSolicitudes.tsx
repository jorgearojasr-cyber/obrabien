"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EstadoBadge from "./EstadoBadge";
import type { SolicitudDestinatarioEstado } from "@/lib/solicitudes";

// Sprint 22 (JOB-043/046). Única fuente de datos: GET /api/solicitudes/cliente
// — sin ninguna consulta a Supabase acá. Mismo patrón que SolicitudesRecibidas
// (Sprint 20, dashboard del maestro): client component con su propio fetch,
// insertado en dashboard/cliente/page.tsx sin tocar su forma de obtener datos
// existente.

type ItemAPI = {
  id: string;
  titulo: string | null;
  descripcion: string | null;
  especialidad: string | null;
  region: string | null;
  comuna: string | null;
  createdAt: string;
  enviadaAt: string | null;
  destinatariosEstados: SolicitudDestinatarioEstado[];
  respondidos: number;
  propuestas: number;
};

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
}

function resumen(descripcion: string | null, max = 120): string {
  if (!descripcion) return "Sin descripción.";
  return descripcion.length > max ? `${descripcion.slice(0, max).trim()}…` : descripcion;
}

export default function MisSolicitudes() {
  const [items, setItems] = useState<ItemAPI[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetch("/api/solicitudes/cliente")
      .then(res => res.json())
      .then(data => { if (!cancelado) setItems(data.solicitudes ?? []); })
      .catch(() => { if (!cancelado) setError("No se pudieron cargar tus solicitudes."); });
    return () => { cancelado = true; };
  }, []);

  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", marginBottom: 36 }}>
      <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 16, color: "var(--ink)", margin: 0, padding: "18px 20px 0" }}>
        Mis solicitudes
      </h2>

      <div style={{ padding: "16px 20px 20px" }}>
        {error && <p style={{ fontSize: 13.5, color: "#B91C1C", margin: 0 }}>{error}</p>}

        {!error && items === null && (
          <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>Cargando…</p>
        )}

        {/* JOB-046: estado vacío */}
        {items !== null && items.length === 0 && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <p style={{ margin: "0 0 12px", fontSize: 13.5, color: "var(--mute)" }}>
              Todavía no has creado ninguna solicitud de trabajo.
            </p>
            <Link href="/solicitudes/nueva" style={{ color: "var(--navy)", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
              Crear una solicitud →
            </Link>
          </div>
        )}

        {items !== null && items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map(item => (
              <Link
                key={item.id}
                href={`/dashboard/cliente/solicitudes/${item.id}`}
                className="hoverable"
                style={{ display: "block", border: "1px solid var(--line)", padding: "14px 16px", textDecoration: "none", color: "inherit" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {item.destinatariosEstados.length === 0 ? (
                      <span style={{ fontSize: 11.5, color: "var(--mute)" }}>Sin maestros seleccionados</span>
                    ) : (
                      item.destinatariosEstados.map((estado, i) => <EstadoBadge key={i} estado={estado} />)
                    )}
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                    {formatFecha(item.enviadaAt ?? item.createdAt)}
                  </span>
                </div>

                <p style={{ margin: "0 0 8px", fontSize: 13.5, color: "var(--ink)", lineHeight: 1.5 }}>
                  {resumen(item.descripcion)}
                </p>

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "var(--mute)" }}>
                  {item.especialidad && <span>🛠️ {item.especialidad}</span>}
                  <span>📍 {item.region ?? "—"}{item.comuna ? `, ${item.comuna}` : ""}</span>
                  <span>💬 {item.respondidos} de {item.destinatariosEstados.length} respondieron</span>
                  <span>✓ {item.propuestas} propuesta{item.propuestas !== 1 ? "s" : ""}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
