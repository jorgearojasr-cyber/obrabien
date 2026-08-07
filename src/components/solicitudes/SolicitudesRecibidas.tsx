"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EstadoBadge from "./EstadoBadge";
import { ListaSkeleton } from "./Skeleton";
import type { SolicitudDestinatarioEstado, SolicitudEstado } from "@/lib/solicitudes";

// Sprint 20 (JOB-033). Única fuente de datos: GET /api/solicitudes/maestro —
// sin ninguna consulta a Supabase acá (ver solicitudes.ts para el porqué de
// cada campo). Client component porque necesita estado de carga y porque
// dashboard/maestro/page.tsx no debe cambiar su forma de obtener datos
// existente (Sprint 19: "no modificar la arquitectura").

type ItemAPI = {
  destinatario: { id: string; estado: SolicitudDestinatarioEstado; createdAt: string };
  solicitud: {
    id: string;
    titulo: string | null;
    descripcion: string | null;
    especialidad: string | null;
    region: string | null;
    comuna: string | null;
    estado: SolicitudEstado;
    createdAt: string;
    enviadaAt: string | null;
  };
  archivosCount: number;
  clienteNombre: string | null;
};

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
}

function resumen(descripcion: string | null, max = 120): string {
  if (!descripcion) return "Sin descripción.";
  return descripcion.length > max ? `${descripcion.slice(0, max).trim()}…` : descripcion;
}

export default function SolicitudesRecibidas() {
  const [items, setItems] = useState<ItemAPI[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetch("/api/solicitudes/maestro")
      .then(res => res.json())
      .then(data => { if (!cancelado) setItems(data.solicitudes ?? []); })
      .catch(() => { if (!cancelado) setError("No se pudieron cargar las solicitudes."); });
    return () => { cancelado = true; };
  }, []);

  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 24px", marginBottom: 24 }}>
      <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--ink)", margin: "0 0 16px" }}>
        Solicitudes recibidas
      </h2>

      {error && <p style={{ fontSize: 13.5, color: "#B91C1C", margin: 0 }}>{error}</p>}

      {!error && items === null && <ListaSkeleton items={2} />}

      {/* Sprint 25 (item 4): estado vacío con ícono y copy orientador. Sin CTA
          acá a propósito — "Completa tu perfil" (más visitas) ya es el CTA
          relevante para este caso y vive justo arriba, en el dashboard;
          duplicarlo en este bloque sería ruido, no ayuda nueva. */}
      {items !== null && items.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--mute)" }}>
            Todavía no recibiste ninguna solicitud de trabajo — apenas un cliente te elija, aparecerá acá.
          </p>
        </div>
      )}

      {items !== null && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(item => (
            <Link
              key={item.destinatario.id}
              href={`/dashboard/maestro/solicitudes/${item.solicitud.id}`}
              className="hoverable"
              style={{ display: "block", border: "1px solid var(--line)", padding: "14px 16px", textDecoration: "none", color: "inherit" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <EstadoBadge estado={item.destinatario.estado} />
                  {/* Sprint 25 (item 2): destinatario.estado nunca pasa a
                      "trabajo_terminado" (es un estado de la SOLICITUD, no del
                      destinatario — ver Sprint 23) — sin este indicador, un
                      trabajo ya cerrado y calificado seguía mostrando
                      "Aceptada" para siempre. */}
                  {item.solicitud.estado === "trabajo_terminado" && (
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)",
                      fontSize: 11, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace",
                      textTransform: "uppercase", letterSpacing: "0.04em",
                      padding: "3px 9px", borderRadius: 4, flexShrink: 0,
                    }}>
                      🏁 Terminado
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                  {formatFecha(item.solicitud.enviadaAt ?? item.solicitud.createdAt)}
                </span>
              </div>

              <p style={{ margin: "0 0 8px", fontSize: 13.5, color: "var(--ink)", lineHeight: 1.5 }}>
                {resumen(item.solicitud.descripcion)}
              </p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "var(--mute)" }}>
                {item.clienteNombre && <span>👤 {item.clienteNombre}</span>}
                {item.solicitud.especialidad && <span>🛠️ {item.solicitud.especialidad}</span>}
                <span>📍 {item.solicitud.region ?? "—"}{item.solicitud.comuna ? `, ${item.solicitud.comuna}` : ""}</span>
                <span>📷 {item.archivosCount} foto{item.archivosCount !== 1 ? "s" : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
