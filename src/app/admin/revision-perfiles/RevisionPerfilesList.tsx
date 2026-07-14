"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MaestroPendiente = {
  id: string;
  nombre: string | null;
  rut: string | null;
  telefono: string | null;
  especialidades: string[] | null;
  descripcion: string | null;
  foto_url: string | null;
  updated_at: string | null;
  created_at: string;
};

export default function RevisionPerfilesList({
  maestros,
  fotosCountMap,
}: {
  maestros: MaestroPendiente[];
  fotosCountMap: Record<string, number>;
}) {
  const router = useRouter();
  const [acting, setActing]       = useState<string | null>(null);
  const [done, setDone]           = useState<Record<string, "aprobado" | "rechazado">>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [motivo, setMotivo]       = useState("");
  const [motivoError, setMotivoError] = useState("");

  function startRechazo(maestroId: string) {
    setRejectingId(maestroId);
    setMotivo("");
    setMotivoError("");
  }

  function cancelRechazo() {
    setRejectingId(null);
    setMotivo("");
    setMotivoError("");
  }

  async function aprobar(maestroId: string) {
    await actuar(maestroId, "aprobar");
  }

  async function confirmarRechazo(maestroId: string) {
    if (!motivo.trim()) {
      setMotivoError("Escribe el motivo del rechazo.");
      return;
    }
    await actuar(maestroId, "rechazar", motivo.trim());
  }

  async function actuar(maestroId: string, accion: "aprobar" | "rechazar", motivoTexto?: string) {
    setActing(maestroId);
    try {
      const res = await fetch("/api/admin/revisar-perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maestroId, accion, motivo: motivoTexto }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setDone(prev => ({ ...prev, [maestroId]: accion === "aprobar" ? "aprobado" : "rechazado" }));
      setRejectingId(null);
      router.refresh();
    } catch (err) {
      alert(`Error al procesar la acción: ${err instanceof Error ? err.message : "Intenta de nuevo."}`);
    } finally {
      setActing(null);
    }
  }

  if (maestros.length === 0) {
    return (
      <div style={{ padding: "40px 24px", border: "1px solid var(--line)", background: "#fff", textAlign: "center", color: "var(--mute)", fontSize: 14 }}>
        No hay perfiles esperando revisión. ✓
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {maestros.map(m => {
        const isActing = acting === m.id;
        const resultado = done[m.id];
        const isRejecting = rejectingId === m.id;
        const fotosCount = fotosCountMap[m.id] ?? 0;
        const fecha = m.updated_at ?? m.created_at;

        return (
          <div key={m.id} style={{ background: "#fff", border: "1px solid var(--line)", padding: 24, opacity: resultado ? 0.55 : 1, transition: "opacity .2s" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {m.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.foto_url} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--line)", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-2)", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0 }}>
                    👤
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 18, color: "var(--navy)", marginBottom: 3 }}>
                    {m.nombre ?? "Sin nombre"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                    RUT: {m.rut ?? "—"} · Tel: {m.telefono ?? "—"} · {new Date(fecha).toLocaleDateString("es-CL")}
                  </div>
                </div>
              </div>

              {resultado ? (
                <span style={{
                  fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: 700,
                  padding: "4px 12px",
                  background: resultado === "aprobado" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.10)",
                  color: resultado === "aprobado" ? "#15803d" : "#DC2626",
                  border: `1px solid ${resultado === "aprobado" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  textTransform: "uppercase", letterSpacing: "0.07em",
                }}>
                  {resultado === "aprobado" ? "✓ Aprobado" : "✕ Rechazado"}
                </span>
              ) : !isRejecting ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => aprobar(m.id)}
                    disabled={isActing}
                    style={{
                      padding: "10px 22px", background: "#22c55e", color: "#fff",
                      border: "none", fontWeight: 700, fontSize: 13.5,
                      cursor: isActing ? "default" : "pointer",
                      opacity: isActing ? 0.6 : 1,
                    }}
                  >
                    {isActing ? "…" : "✓ Aprobar"}
                  </button>
                  <button
                    onClick={() => startRechazo(m.id)}
                    disabled={isActing}
                    style={{
                      padding: "10px 22px", background: "#EF4444", color: "#fff",
                      border: "none", fontWeight: 700, fontSize: 13.5,
                      cursor: isActing ? "default" : "pointer",
                      opacity: isActing ? 0.6 : 1,
                    }}
                  >
                    ✕ Rechazar
                  </button>
                </div>
              ) : null}
            </div>

            {/* Especialidades */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {(m.especialidades ?? []).length > 0 ? (m.especialidades ?? []).map(esp => (
                <span key={esp} style={{ padding: "4px 10px", background: "var(--bg-2)", border: "1px solid var(--line)", fontSize: 12, color: "var(--ink-soft)" }}>
                  {esp}
                </span>
              )) : (
                <span style={{ fontSize: 12.5, color: "var(--mute)", fontStyle: "italic" }}>Sin especialidades</span>
              )}
            </div>

            {/* Descripción */}
            {m.descripcion && (
              <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 14px" }}>
                {m.descripcion}
              </p>
            )}

            {/* Meta row: gallery count + public profile link */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", paddingTop: 14, borderTop: "1px solid var(--line)" }}>
              <span style={{ fontSize: 12.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                📷 {fotosCount} foto{fotosCount !== 1 ? "s" : ""} en galería
              </span>
              <a
                href={`/maestro/${m.id}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12.5, color: "var(--navy)", fontFamily: "var(--font-jetbrains), monospace", textDecoration: "none", fontWeight: 700 }}
              >
                Ver perfil público (como cliente) ↗
              </a>
            </div>

            {/* Inline reject form */}
            {isRejecting && (
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", marginBottom: 8 }}>
                  Motivo del rechazo
                </label>
                <textarea
                  value={motivo}
                  onChange={e => { setMotivo(e.target.value); if (motivoError) setMotivoError(""); }}
                  placeholder="Ej: Las fotos de la cédula no son legibles, vuelve a subirlas."
                  rows={3}
                  style={{
                    width: "100%", border: `1.5px solid ${motivoError ? "#EF4444" : "var(--line)"}`,
                    padding: "10px 14px", fontSize: 13.5, color: "var(--ink)",
                    fontFamily: "inherit", resize: "vertical", boxSizing: "border-box",
                  }}
                />
                {motivoError && <p style={{ margin: "5px 0 0", fontSize: 12, color: "#DC2626" }}>{motivoError}</p>}
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button
                    onClick={() => confirmarRechazo(m.id)}
                    disabled={isActing}
                    style={{
                      padding: "9px 20px", background: "#EF4444", color: "#fff",
                      border: "none", fontWeight: 700, fontSize: 13,
                      cursor: isActing ? "default" : "pointer",
                      opacity: isActing ? 0.6 : 1,
                    }}
                  >
                    {isActing ? "…" : "Confirmar rechazo"}
                  </button>
                  <button
                    onClick={cancelRechazo}
                    disabled={isActing}
                    style={{
                      padding: "9px 20px", background: "#fff", color: "var(--mute)",
                      border: "1.5px solid var(--line)", fontWeight: 700, fontSize: 13,
                      cursor: isActing ? "default" : "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
