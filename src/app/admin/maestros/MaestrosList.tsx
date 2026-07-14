"use client";

import { useEffect, useMemo, useState } from "react";
import type { MaestroAdminRow } from "./page";

const VERIF: Record<string, { label: string; color: string }> = {
  sin_enviar: { label: "Sin enviar", color: "var(--mute)" },
  pendiente:  { label: "Pendiente",  color: "#F59E0B" },
  aprobado:   { label: "Verificado", color: "#22c55e" },
  rechazado:  { label: "Rechazado",  color: "#EF4444" },
};

const DISP: Record<string, string> = {
  disponible:    "Disponible",
  no_disponible: "No disponible",
  pausado:       "Pausado",
};

// Identity-verification system temporarily disabled — hides the per-row
// "Verificar →" link to /admin/verificaciones (page/endpoint still exist).
const MOSTRAR_VERIFICACIONES = false;

type FilterEstado = "todos" | "aprobado" | "pendiente" | "sin_verificar" | "rechazado";
type Modal =
  | { type: "reminder"; id: string; nombre: string }
  | { type: "delete";   id: string; nombre: string }
  | null;

export default function MaestrosList({
  maestros,
  initialFilter = "todos",
}: {
  maestros: MaestroAdminRow[];
  initialFilter?: string;
}) {
  const [items, setItems]   = useState(maestros);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [reminderSent,    setReminderSent]    = useState<Set<string>>(new Set());
  const [modal, setModal]   = useState<Modal>(null);
  const [toast, setToast]   = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [filterEstado, setFilterEstado] = useState<FilterEstado>(
    (["todos","aprobado","pendiente","sin_verificar","rechazado"].includes(initialFilter)
      ? initialFilter
      : "todos") as FilterEstado
  );

  // Close modal on Escape
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setModal(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const counts = useMemo(() => ({
    todos:         items.length,
    aprobado:      items.filter(m => m.verificacion_estado === "aprobado").length,
    pendiente:     items.filter(m => m.verificacion_estado === "pendiente").length,
    sin_verificar: items.filter(m => !m.verificacion_estado || m.verificacion_estado === "sin_enviar").length,
    rechazado:     items.filter(m => m.verificacion_estado === "rechazado").length,
  }), [items]);

  const filteredItems = useMemo(() => {
    if (filterEstado === "todos") return items;
    if (filterEstado === "sin_verificar") {
      return items.filter(m => !m.verificacion_estado || m.verificacion_estado === "sin_enviar");
    }
    return items.filter(m => m.verificacion_estado === filterEstado);
  }, [items, filterEstado]);

  async function toggleActivo(id: string, current: boolean) {
    setToggling(id);
    const res = await fetch("/api/admin/toggle-activo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: id, activo: !current }),
    });
    if (res.ok) setItems(prev => prev.map(m => m.id === id ? { ...m, activo: !current } : m));
    setToggling(null);
  }

  async function confirmarEliminar(id: string) {
    setModal(null);
    setDeleting(id);
    const res = await fetch("/api/admin/eliminar-maestro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: id }),
    });
    if (res.ok) setItems(prev => prev.filter(m => m.id !== id));
    setDeleting(null);
  }

  async function confirmarRecordatorio(id: string) {
    setModal(null);
    setSendingReminder(id);
    const targetEmail = items.find(m => m.id === id)?.email ?? "";
    try {
      const res = await fetch("/api/admin/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maestroId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setReminderSent(prev => new Set([...prev, id]));
        setToast({ msg: `Recordatorio enviado a ${data.email || targetEmail}`, type: "success" });
      } else {
        const { error } = await res.json();
        setToast({ msg: error ?? "Error desconocido al enviar recordatorio", type: "error" });
      }
    } catch {
      setToast({ msg: "Error de red al enviar recordatorio.", type: "error" });
    }
    setSendingReminder(null);
  }

  const FILTER_OPTIONS: { value: FilterEstado; label: string }[] = [
    { value: "todos",         label: "Todos" },
    { value: "aprobado",      label: "Verificados" },
    { value: "pendiente",     label: "Pendientes" },
    { value: "sin_verificar", label: "Sin verificar" },
    { value: "rechazado",     label: "Rechazados" },
  ];

  return (
    <>
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 2000,
          background: toast.type === "success" ? "#22c55e" : "#EF4444",
          color: "#fff", padding: "12px 20px",
          fontFamily: "var(--font-archivo), sans-serif",
          fontWeight: 700, fontSize: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          maxWidth: 400, lineHeight: 1.4,
        }}>
          {toast.type === "success" ? "✓ " : "✕ "}{toast.msg}
        </div>
      )}

      {/* ── Modal overlay ── */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(14,39,66,0.5)",
            zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", border: "1px solid var(--line)",
              padding: "28px 28px 24px", maxWidth: 420, width: "100%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            }}
          >
            {modal.type === "reminder" ? (
              <>
                <h2 style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 900, fontSize: 17, color: "var(--navy)",
                  margin: "0 0 12px", lineHeight: 1.3,
                }}>
                  Enviar recordatorio a {modal.nombre}
                </h2>
                <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "0 0 24px", lineHeight: 1.6 }}>
                  Se enviará un email a este maestro recordándole que complete su verificación de identidad.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setModal(null)}
                    style={{
                      all: "unset", cursor: "pointer", padding: "9px 20px",
                      border: "1.5px solid var(--line)", fontSize: 13.5,
                      fontWeight: 700, color: "var(--ink)",
                      fontFamily: "var(--font-archivo), sans-serif",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => confirmarRecordatorio(modal.id)}
                    style={{
                      all: "unset", cursor: "pointer", padding: "9px 20px",
                      background: "#0369a1", color: "#fff",
                      fontSize: 13.5, fontWeight: 700,
                      fontFamily: "var(--font-archivo), sans-serif",
                    }}
                  >
                    Enviar correo
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 900, fontSize: 17, color: "#b91c1c",
                  margin: "0 0 12px", lineHeight: 1.3,
                }}>
                  ¿Eliminar a {modal.nombre}?
                </h2>
                <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "0 0 24px", lineHeight: 1.6 }}>
                  Esta acción no se puede deshacer. El perfil será eliminado permanentemente.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setModal(null)}
                    style={{
                      all: "unset", cursor: "pointer", padding: "9px 20px",
                      border: "1.5px solid var(--line)", fontSize: 13.5,
                      fontWeight: 700, color: "var(--ink)",
                      fontFamily: "var(--font-archivo), sans-serif",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => confirmarEliminar(modal.id)}
                    style={{
                      all: "unset", cursor: "pointer", padding: "9px 20px",
                      background: "#EF4444", color: "#fff",
                      fontSize: 13.5, fontWeight: 700,
                      fontFamily: "var(--font-archivo), sans-serif",
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
          Filtrar:
        </span>
        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value as FilterEstado)}
          style={{
            height: 36, border: "1.5px solid var(--line)", padding: "0 12px",
            fontSize: 13, color: "var(--ink)", background: "#fff",
            fontFamily: "inherit", cursor: "pointer", outline: "none",
          }}
        >
          {FILTER_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label} ({counts[value]})
            </option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
          {filteredItems.length} resultado{filteredItems.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filteredItems.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
          {items.length === 0
            ? "No hay maestros registrados."
            : "No hay maestros que coincidan con el filtro seleccionado."}
        </p>
      ) : (
        <div style={{ border: "1px solid var(--line)" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 110px 100px 120px 70px 1fr", gap: "0 10px", padding: "10px 16px", background: "var(--bg-2)", borderBottom: "1px solid var(--line)" }}>
            {["Nombre", "Especialidades", "Ciudad", "Verificación", "Disponibilidad", "Activo", "Acciones"].map(h => (
              <span key={h} style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                {h}
              </span>
            ))}
          </div>

          {filteredItems.map((m, i) => {
            const verif  = VERIF[m.verificacion_estado ?? "sin_enviar"] ?? VERIF.sin_enviar;
            const activo = m.activo ?? false;
            const ciudad = m.ciudades?.[0] ?? null;

            return (
              <div
                key={m.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1.6fr 110px 100px 120px 70px 1fr",
                  gap: "0 10px",
                  padding: "13px 16px",
                  alignItems: "center",
                  borderBottom: i < filteredItems.length - 1 ? "1px solid var(--line)" : undefined,
                  background: activo ? undefined : "rgba(239,68,68,0.04)",
                  opacity: deleting === m.id ? 0.4 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {/* Nombre */}
                <div>
                  <a
                    href={`/maestro/${m.id}`}
                    style={{ fontWeight: 700, fontSize: 13.5, color: "var(--navy)", textDecoration: "none", fontFamily: "var(--font-archivo), sans-serif", display: "block" }}
                  >
                    {m.nombre}
                  </a>
                  {m.rut && (
                    <div style={{ fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", marginTop: 2 }}>
                      {m.rut}
                    </div>
                  )}
                  {m.como_llego && (
                    <div style={{ fontSize: 10.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", marginTop: 3 }}>
                      via: {m.como_llego === "Otro" && m.como_llego_otro ? m.como_llego_otro : m.como_llego}
                      {m.referido_rut && ` · ref: ${m.referido_rut}`}
                    </div>
                  )}
                </div>

                {/* Especialidades */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {(m.especialidades ?? []).length > 0
                    ? (m.especialidades ?? []).slice(0, 3).map(e => (
                        <span key={e} style={{ fontSize: 10.5, background: "var(--bg-2)", border: "1px solid var(--line)", padding: "2px 6px", color: "var(--ink-soft)", fontFamily: "var(--font-jetbrains), monospace" }}>
                          {e}
                        </span>
                      ))
                    : <span style={{ fontSize: 12, color: "var(--mute)", fontStyle: "italic" }}>—</span>
                  }
                  {(m.especialidades ?? []).length > 3 && (
                    <span style={{ fontSize: 10.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                      +{(m.especialidades ?? []).length - 3}
                    </span>
                  )}
                </div>

                {/* Ciudad */}
                <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                  {ciudad ?? <span style={{ color: "var(--mute)", fontStyle: "italic" }}>—</span>}
                </div>

                {/* Verificación */}
                <div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: verif.color, fontFamily: "var(--font-jetbrains), monospace" }}>
                    {verif.label}
                  </span>
                </div>

                {/* Disponibilidad */}
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                  {DISP[m.disponibilidad ?? ""] ?? (m.disponibilidad ?? "—")}
                </div>

                {/* Activo toggle */}
                <div>
                  <button
                    onClick={() => toggleActivo(m.id, activo)}
                    disabled={toggling === m.id}
                    style={{
                      all: "unset", cursor: toggling === m.id ? "wait" : "pointer",
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontSize: 12, fontWeight: 700,
                      color: activo ? "#15803d" : "#b91c1c",
                      fontFamily: "var(--font-jetbrains), monospace",
                      opacity: toggling === m.id ? 0.5 : 1,
                    }}
                  >
                    <span style={{
                      width: 30, height: 17, borderRadius: 9,
                      background: activo ? "#22c55e" : "#d1d5db",
                      display: "inline-block", position: "relative",
                      transition: "background 0.15s", flexShrink: 0,
                    }}>
                      <span style={{
                        position: "absolute", top: 1.5, left: activo ? 13 : 2,
                        width: 14, height: 14, borderRadius: "50%",
                        background: "#fff", transition: "left 0.15s",
                      }} />
                    </span>
                    {activo ? "Sí" : "No"}
                  </button>
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  {m.verificado ? (
                    <span style={{ fontSize: 11.5, color: "#22c55e", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace" }}>
                      ✓
                    </span>
                  ) : MOSTRAR_VERIFICACIONES ? (
                    <a
                      href={`/admin/verificaciones?maestroId=${m.id}`}
                      style={{
                        all: "unset", cursor: "pointer",
                        fontSize: 11.5, fontWeight: 700, color: "#15803d",
                        fontFamily: "var(--font-jetbrains), monospace",
                        background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e",
                        padding: "3px 8px",
                      }}
                    >
                      Verificar →
                    </a>
                  ) : null}

                  {!m.verificado && (
                    reminderSent.has(m.id) ? (
                      <span style={{ fontSize: 11.5, color: "#0369a1", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace" }}>
                        ✓ Enviado
                      </span>
                    ) : (
                      <button
                        onClick={() => setModal({ type: "reminder", id: m.id, nombre: m.nombre })}
                        disabled={sendingReminder === m.id}
                        style={{
                          all: "unset", cursor: sendingReminder === m.id ? "wait" : "pointer",
                          fontSize: 11.5, fontWeight: 700, color: "#0369a1",
                          fontFamily: "var(--font-jetbrains), monospace",
                          background: "rgba(3,105,161,0.08)", border: "1px solid #0369a1",
                          padding: "3px 8px",
                          opacity: sendingReminder === m.id ? 0.5 : 1,
                        }}
                      >
                        {sendingReminder === m.id ? "…" : "Recordatorio"}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setModal({ type: "delete", id: m.id, nombre: m.nombre })}
                    disabled={deleting === m.id}
                    style={{
                      all: "unset", cursor: deleting === m.id ? "wait" : "pointer",
                      fontSize: 11.5, fontWeight: 700, color: "#b91c1c",
                      fontFamily: "var(--font-jetbrains), monospace",
                      background: "rgba(239,68,68,0.08)", border: "1px solid #EF4444",
                      padding: "3px 8px",
                      opacity: deleting === m.id ? 0.5 : 1,
                    }}
                  >
                    {deleting === m.id ? "…" : "Eliminar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
