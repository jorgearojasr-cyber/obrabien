"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EstadoBadge from "./EstadoBadge";
import type { SolicitudDestinatarioEstado } from "@/lib/solicitudes";

// Sprint 20 (JOB-034/036) + Sprint 21 (JOB-038/039/040). Única fuente de
// datos: GET /api/solicitudes/[id] (detalle + historial) y los 3 endpoints de
// transición (responder/aceptar/rechazar). Este componente nunca decide si
// una acción es válida — solo la pide y muestra tal cual lo que la API
// responde, éxito o error (mismo criterio que NuevaSolicitudForm, Sprint 19,
// JOB-030). No hay chat en tiempo real: cada acción recarga el detalle una
// vez con fetch, no hay polling ni sockets.

type Mensaje = {
  id: string;
  autorTipo: "cliente" | "maestro";
  texto: string;
  createdAt: string;
};

type DetalleAPI = {
  descripcion: string | null;
  region: string | null;
  comuna: string | null;
  createdAt: string;
  enviadaAt: string | null;
  archivos: { id: string; url: string; descripcion: string | null }[];
  destinatarios: { id: string; estado: SolicitudDestinatarioEstado }[];
};

// Estos dos conjuntos solo reflejan, para efectos de UI, el mismo `estado`
// que ya devolvió la API — no son una regla nueva. Ocultar un botón que de
// todas formas la API rechazaría no es "duplicar la regla", es no ofrecer una
// acción que ya se sabe, por el propio dato, que no aplica; si de todas
// formas se dispara (ej. pestaña vieja), el error que se muestra es el de la
// API, sin reinterpretarlo.
const ESTADOS_CON_ACCIONES_DISPONIBLES: SolicitudDestinatarioEstado[] = ["enviado", "vista", "respondida"];
const ESTADOS_QUE_PERMITEN_RESPONDER: SolicitudDestinatarioEstado[] = ["enviado", "vista"];

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}
function formatFechaHora(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function SolicitudDetalle({ id }: { id: string }) {
  const [solicitud, setSolicitud] = useState<DetalleAPI | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [texto, setTexto] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  function cargar() {
    return fetch(`/api/solicitudes/${id}`)
      .then(async res => {
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) { setError("No se pudo cargar la solicitud."); return; }
        const data = await res.json();
        setSolicitud(data.solicitud);
        setMensajes(data.mensajes ?? []);
      })
      .catch(() => setError("No se pudo conectar con el servidor."));
  }

  useEffect(() => {
    let cancelado = false;
    cargar().then(() => { if (cancelado) return; });
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleResponder() {
    setEnviandoRespuesta(true);
    setErrorAccion(null);
    try {
      const res = await fetch(`/api/solicitudes/${id}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorAccion(data.error ?? "No se pudo enviar la respuesta."); return; }
      setTexto("");
      await cargar();
    } catch {
      setErrorAccion("No se pudo conectar con el servidor.");
    } finally {
      setEnviandoRespuesta(false);
    }
  }

  async function handleAccion(accion: "aceptar" | "rechazar") {
    setActualizandoEstado(true);
    setErrorAccion(null);
    try {
      const res = await fetch(`/api/solicitudes/${id}/${accion}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setErrorAccion(data.error ?? "No se pudo actualizar la solicitud."); return; }
      await cargar();
    } catch {
      setErrorAccion("No se pudo conectar con el servidor.");
    } finally {
      setActualizandoEstado(false);
    }
  }

  if (notFound) {
    return (
      <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 40, textAlign: "center" }}>
        <p style={{ fontSize: 14.5, color: "var(--mute)", margin: "0 0 16px" }}>
          Esta solicitud no existe o no tienes acceso a ella.
        </p>
        <Link href="/dashboard/maestro" style={{ color: "var(--orange)", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
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

  // JOB-034 pide "estado" — el de MI copia como maestro, no el de otros
  // destinatarios. La ruta ya filtra la lista a solo la mía (ver
  // api/solicitudes/[id]/route.ts), así que acá siempre hay como máximo una.
  const miEstado = solicitud.destinatarios[0]?.estado;
  const mostrarAcciones = !!miEstado && ESTADOS_CON_ACCIONES_DISPONIBLES.includes(miEstado);
  const puedeResponder = !!miEstado && ESTADOS_QUE_PERMITEN_RESPONDER.includes(miEstado);

  return (
    <div>
      <Link href="/dashboard/maestro" style={{ display: "inline-block", marginBottom: 16, fontSize: 13, color: "var(--mute)", textDecoration: "none" }}>
        ← Volver al panel
      </Link>

      <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {miEstado && <EstadoBadge estado={miEstado} />}
          <span style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
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

      {errorAccion && (
        <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", color: "#B91C1C", padding: "12px 16px", marginBottom: 20, fontSize: 13.5 }}>
          {errorAccion}
        </div>
      )}

      {/* JOB-039 — Aceptar / Rechazar */}
      {mostrarAcciones && (
        <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 24px", marginBottom: 20 }}>
          <span className="label" style={{ marginBottom: 12, display: "block" }}>// ¿Puedes realizar este trabajo?</span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => handleAccion("aceptar")}
              disabled={actualizandoEstado}
              style={{ background: "#16A34A", color: "#fff", border: "none", padding: "10px 20px", fontWeight: 700, fontSize: 13.5, cursor: actualizandoEstado ? "default" : "pointer", opacity: actualizandoEstado ? 0.6 : 1 }}
            >
              ✓ Aceptar trabajo
            </button>
            <button
              onClick={() => handleAccion("rechazar")}
              disabled={actualizandoEstado}
              style={{ background: "#fff", color: "#DC2626", border: "1.5px solid #DC2626", padding: "10px 20px", fontWeight: 700, fontSize: 13.5, cursor: actualizandoEstado ? "default" : "pointer", opacity: actualizandoEstado ? 0.6 : 1 }}
            >
              No puedo realizarlo
            </button>
          </div>
        </div>
      )}

      {/* JOB-040 — Historial */}
      {mensajes.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 24px", marginBottom: 20 }}>
          <span className="label" style={{ marginBottom: 14, display: "block" }}>// Historial</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mensajes.map(m => (
              <div key={m.id} style={{ maxWidth: "80%", alignSelf: m.autorTipo === "maestro" ? "flex-end" : "flex-start" }}>
                <div style={{
                  background: m.autorTipo === "maestro" ? "var(--navy)" : "var(--bg-2)",
                  color: m.autorTipo === "maestro" ? "#fff" : "var(--ink)",
                  padding: "10px 14px", fontSize: 13.5, lineHeight: 1.5,
                }}>
                  {m.texto}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--mute)", marginTop: 4, textAlign: m.autorTipo === "maestro" ? "right" : "left" }}>
                  {m.autorTipo === "maestro" ? "Tú" : "Cliente"} · {formatFechaHora(m.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JOB-038 — Responder al cliente */}
      {puedeResponder && (
        <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 24px" }}>
          <span className="label" style={{ marginBottom: 12, display: "block" }}>// Responder al cliente</span>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Escribe tu respuesta..."
            style={{ width: "100%", height: 100, border: "1.5px solid var(--line)", padding: 12, fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", marginBottom: 12 }}
          />
          <button
            onClick={handleResponder}
            disabled={enviandoRespuesta}
            style={{ background: "var(--orange)", color: "#fff", border: "none", padding: "10px 22px", fontWeight: 700, fontSize: 13.5, cursor: enviandoRespuesta ? "default" : "pointer", opacity: enviandoRespuesta ? 0.6 : 1 }}
          >
            {enviandoRespuesta ? "Enviando…" : "Enviar respuesta"}
          </button>
        </div>
      )}
    </div>
  );
}
