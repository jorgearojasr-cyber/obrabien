"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EstadoBadge from "./EstadoBadge";
import type { SolicitudDestinatarioEstado, SolicitudEstado } from "@/lib/solicitudes";

// Sprint 22 (JOB-044/045/046/047) + Sprint 23 (JOB-048/049/051). Única fuente
// de datos: GET /api/solicitudes/[id] y, para asignar, POST
// /api/solicitudes/[id]/asignar. No decide acá qué destinatarios pueden
// asignarse ni qué les pasa al resto — eso vive en solicitudes.ts; este
// componente solo pide la acción y muestra lo que la API devuelve, éxito o
// error (mismo criterio que NuevaSolicitudForm, Sprint 19, JOB-030). Sigue
// mostrando el historial de TODOS los destinatarios, porque el cliente
// necesita comparar respuestas antes de elegir a quién asignar.

type Mensaje = {
  id: string;
  autorTipo: "cliente" | "maestro";
  texto: string;
  createdAt: string;
};

type Destinatario = {
  id: string;
  maestroId: string;
  estado: SolicitudDestinatarioEstado;
};

type DetalleAPI = {
  estado: SolicitudEstado;
  maestroAsignadoId: string | null;
  descripcion: string | null;
  region: string | null;
  comuna: string | null;
  createdAt: string;
  enviadaAt: string | null;
  archivos: { id: string; url: string; descripcion: string | null }[];
  destinatarios: Destinatario[];
};

type MaestroIdentidad = { nombre: string; fotoUrl: string | null };

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}
function formatFechaHora(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function SolicitudDetalleCliente({ id }: { id: string }) {
  const [solicitud, setSolicitud] = useState<DetalleAPI | null>(null);
  const [mensajesPorDestinatario, setMensajesPorDestinatario] = useState<Record<string, Mensaje[]>>({});
  const [maestros, setMaestros] = useState<Record<string, MaestroIdentidad>>({});
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [asignando, setAsignando] = useState<string | null>(null); // maestroId en curso
  const [errorAsignar, setErrorAsignar] = useState<string | null>(null);

  function cargar() {
    return fetch(`/api/solicitudes/${id}`)
      .then(async res => {
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) { setError("No se pudo cargar la solicitud."); return; }
        const data = await res.json();
        setSolicitud(data.solicitud);
        setMensajesPorDestinatario(data.mensajesPorDestinatario ?? {});
        setMaestros(data.maestros ?? {});
      })
      .catch(() => setError("No se pudo conectar con el servidor."));
  }

  useEffect(() => {
    let cancelado = false;
    cargar().then(() => { if (cancelado) return; });
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAsignar(maestroId: string) {
    setAsignando(maestroId);
    setErrorAsignar(null);
    try {
      const res = await fetch(`/api/solicitudes/${id}/asignar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maestroId }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorAsignar(data.error ?? "No se pudo asignar el trabajo."); return; }
      await cargar();
    } catch {
      setErrorAsignar("No se pudo conectar con el servidor.");
    } finally {
      setAsignando(null);
    }
  }

  if (notFound) {
    return (
      <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 40, textAlign: "center" }}>
        <p style={{ fontSize: 14.5, color: "var(--mute)", margin: "0 0 16px" }}>
          Esta solicitud no existe o no tienes acceso a ella.
        </p>
        <Link href="/dashboard/cliente" style={{ color: "var(--orange)", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
          ← Volver al panel
        </Link>
      </div>
    );
  }

  if (error) {
    return <p style={{ fontSize: 13.5, color: "#B91C1C" }}>{error}</p>;
  }

  if (!solicitud) {
    return <p style={{ fontSize: 13.5, color: "var(--mute)" }}>Cargando…</p>;
  }

  const yaAsignada = solicitud.estado === "cerrada_asignado";

  return (
    <div>
      <Link href="/dashboard/cliente" style={{ display: "inline-block", marginBottom: 16, fontSize: 13, color: "var(--mute)", textDecoration: "none" }}>
        ← Volver al panel
      </Link>

      <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {yaAsignada && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0",
              fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace",
              textTransform: "uppercase", letterSpacing: "0.04em", padding: "3px 9px",
            }}>
              🎉 Trabajo asignado
            </span>
          )}
          <span style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", marginLeft: yaAsignada ? undefined : "auto" }}>
            {formatFecha(solicitud.enviadaAt ?? solicitud.createdAt)}
          </span>
        </div>

        <span className="label" style={{ marginBottom: 10, display: "block" }}>// Descripción</span>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 24px" }}>
          {solicitud.descripcion || "Sin descripción."}
        </p>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: solicitud.archivos.length > 0 ? 24 : 0 }}>
          <div>
            <span className="label" style={{ marginBottom: 6, display: "block" }}>// Región</span>
            <span style={{ fontSize: 14, color: "var(--ink)" }}>{solicitud.region ?? "—"}</span>
          </div>
          <div>
            <span className="label" style={{ marginBottom: 6, display: "block" }}>// Comuna</span>
            <span style={{ fontSize: 14, color: "var(--ink)" }}>{solicitud.comuna ?? "—"}</span>
          </div>
        </div>

        {solicitud.archivos.length > 0 && (
          <div>
            <span className="label" style={{ marginBottom: 10, display: "block" }}>// Fotografías</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {solicitud.archivos.map(a => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={a.id} src={a.url} alt={a.descripcion ?? "Foto del trabajo"} style={{ width: 120, height: 120, objectFit: "cover", border: "1px solid var(--line)" }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {errorAsignar && (
        <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", color: "#B91C1C", padding: "12px 16px", marginBottom: 16, fontSize: 13.5 }}>
          {errorAsignar}
        </div>
      )}

      {/* JOB-046: estado vacío si no se seleccionó ningún maestro (ej. borrador nunca enviado) */}
      {solicitud.destinatarios.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "24px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--mute)" }}>Todavía no seleccionaste ningún maestro para esta solicitud.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {solicitud.destinatarios.map(dest => {
            const maestro = maestros[dest.maestroId];
            const mensajes = mensajesPorDestinatario[dest.id] ?? [];
            const esElAsignado = yaAsignada && solicitud.maestroAsignadoId === dest.maestroId;
            // JOB-048: el botón "Asignar trabajo" solo existe cuando hay al
            // menos un destinatario "aceptada" y la solicitud todavía no
            // tiene un maestro asignado — no se recalcula ninguna regla acá,
            // solo se lee el estado que ya devolvió la API.
            const puedeAsignarse = !yaAsignada && dest.estado === "aceptada";

            return (
              <div key={dest.id} style={{ background: "#fff", border: esElAsignado ? "1.5px solid #22C55E" : "1px solid var(--line)", padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: mensajes.length > 0 || puedeAsignarse ? 16 : 0, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", background: "var(--navy)", flexShrink: 0, display: "grid", placeItems: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                      {maestro?.fotoUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={maestro.fotoUrl} alt={maestro.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : (maestro?.nombre?.[0]?.toUpperCase() ?? "?")}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{maestro?.nombre ?? "Maestro"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {esElAsignado && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A", fontFamily: "var(--font-jetbrains), monospace" }}>✓ ASIGNADO</span>
                    )}
                    <EstadoBadge estado={dest.estado} />
                  </div>
                </div>

                {mensajes.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: puedeAsignarse ? 16 : 0 }}>
                    {mensajes.map(m => (
                      <div key={m.id} style={{ maxWidth: "80%", alignSelf: m.autorTipo === "cliente" ? "flex-end" : "flex-start" }}>
                        <div style={{
                          background: m.autorTipo === "cliente" ? "var(--navy)" : "var(--bg-2)",
                          color: m.autorTipo === "cliente" ? "#fff" : "var(--ink)",
                          padding: "10px 14px", fontSize: 13.5, lineHeight: 1.5,
                        }}>
                          {m.texto}
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--mute)", marginTop: 4, textAlign: m.autorTipo === "cliente" ? "right" : "left" }}>
                          {m.autorTipo === "cliente" ? "Tú" : (maestro?.nombre ?? "Maestro")} · {formatFechaHora(m.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {mensajes.length === 0 && !puedeAsignarse && (
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--mute)" }}>Sin mensajes todavía.</p>
                )}

                {puedeAsignarse && (
                  <button
                    onClick={() => handleAsignar(dest.maestroId)}
                    disabled={asignando !== null}
                    style={{
                      background: "var(--orange)", color: "#fff", border: "none",
                      padding: "9px 18px", fontWeight: 700, fontSize: 13,
                      cursor: asignando !== null ? "default" : "pointer",
                      opacity: asignando !== null && asignando !== dest.maestroId ? 0.5 : 1,
                    }}
                  >
                    {asignando === dest.maestroId ? "Asignando…" : "Asignar trabajo"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
