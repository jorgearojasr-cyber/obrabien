"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MaestroPendiente = {
  id: string;
  nombre: string | null;
  rut: string | null;
  cedula_frente: string | null;
  cedula_reverso: string | null;
  selfie_cedula: string | null;
  created_at: string;
  verificacion_estado?: string | null;
};

const ESTADO_LABELS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pendiente:  { label: "Pendiente",   bg: "rgba(234,179,8,0.10)",   color: "#a16207", border: "rgba(234,179,8,0.35)"    },
  aprobado:   { label: "Aprobado",    bg: "rgba(34,197,94,0.10)",   color: "#15803d", border: "rgba(34,197,94,0.3)"     },
  rechazado:  { label: "Rechazado",   bg: "rgba(239,68,68,0.10)",   color: "#DC2626", border: "rgba(239,68,68,0.3)"     },
  sin_enviar: { label: "Sin enviar",  bg: "var(--bg-2)",            color: "var(--mute)", border: "var(--line)"         },
};

export default function VerifList({ maestros, isSingle }: { maestros: MaestroPendiente[]; isSingle?: boolean }) {
  const router = useRouter();
  const [acting, setActing] = useState<string | null>(null);
  const [done, setDone]     = useState<Record<string, "aprobado" | "rechazado">>({});

  async function actuar(maestroId: string, accion: "aprobar" | "rechazar") {
    setActing(maestroId);
    try {
      const res = await fetch("/api/admin/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maestroId, accion }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setDone(prev => ({ ...prev, [maestroId]: accion === "aprobar" ? "aprobado" : "rechazado" }));
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
        {isSingle ? "No se encontró este maestro." : "No hay verificaciones pendientes. ✓"}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {maestros.map(m => {
        const isActing = acting === m.id;
        const resultado = done[m.id];

        return (
          <div key={m.id} style={{ background: "#fff", border: "1px solid var(--line)", padding: 24, opacity: resultado ? 0.55 : 1, transition: "opacity .2s" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 18, color: "var(--navy)", marginBottom: 3 }}>
                  {m.nombre ?? "Sin nombre"}
                </div>
                <div style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                  RUT: {m.rut ?? "—"} · {new Date(m.created_at).toLocaleDateString("es-CL")}
                  {m.verificacion_estado && (() => {
                    const est = ESTADO_LABELS[m.verificacion_estado] ?? ESTADO_LABELS["sin_enviar"];
                    return (
                      <span style={{
                        marginLeft: 10, padding: "2px 8px",
                        background: est.bg, color: est.color,
                        border: `1px solid ${est.border}`,
                        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>
                        {est.label}
                      </span>
                    );
                  })()}
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
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => actuar(m.id, "aprobar")}
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
                    onClick={() => actuar(m.id, "rechazar")}
                    disabled={isActing}
                    style={{
                      padding: "10px 22px", background: "#EF4444", color: "#fff",
                      border: "none", fontWeight: 700, fontSize: 13.5,
                      cursor: isActing ? "default" : "pointer",
                      opacity: isActing ? 0.6 : 1,
                    }}
                  >
                    {isActing ? "…" : "✕ Rechazar"}
                  </button>
                </div>
              )}
            </div>

            {/* Document photos */}
            {!m.cedula_frente && !m.cedula_reverso && !m.selfie_cedula && (
              <div style={{ padding: "20px 0", color: "var(--mute)", fontSize: 13.5, fontStyle: "italic" }}>
                Este maestro aún no ha subido documentos de verificación.
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {[
                { label: "Cédula — frente",   url: m.cedula_frente },
                { label: "Cédula — reverso",  url: m.cedula_reverso },
                { label: "Selfie con cédula", url: m.selfie_cedula },
              ].map(({ label, url }) => (
                <div key={label}>
                  <div style={{ fontSize: 10.5, fontFamily: "var(--font-jetbrains), monospace", color: "var(--mute)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                    {label}
                  </div>
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer" style={{ display: "block" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={label}
                        style={{ width: "100%", aspectRatio: "3/2", objectFit: "cover", border: "1px solid var(--line)", cursor: "zoom-in", display: "block" }}
                      />
                      <span style={{ fontSize: 11, color: "var(--navy)", fontFamily: "var(--font-jetbrains), monospace", marginTop: 4, display: "block" }}>
                        Abrir en tamaño completo ↗
                      </span>
                    </a>
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "3/2", background: "var(--bg-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--mute)", fontSize: 12 }}>
                      Sin foto
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
