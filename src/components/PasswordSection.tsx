"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

const SI: React.CSSProperties = {
  width: "100%", height: 48, border: "1.5px solid var(--line)",
  padding: "0 14px", fontSize: 14.5, color: "var(--ink)",
  background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const SL: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-jetbrains), monospace",
  fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.1em", color: "var(--mute)", marginBottom: 8,
};

export default function PasswordSection() {
  const { user } = useUser();

  const [open,      setOpen]      = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState("");
  const [error,     setError]     = useState("");

  function toggle() {
    setOpen(o => !o);
    setError("");
    setSuccess("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPw.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPw !== confirmPw) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!user) { setError("No se pudo verificar tu sesión. Recarga la página."); return; }

    setSaving(true);
    try {
      await user.updatePassword({
        newPassword:            newPw,
        currentPassword:        currentPw || undefined,
        signOutOfOtherSessions: false,
      });
      setSuccess("Contraseña actualizada correctamente.");
      setNewPw("");
      setConfirmPw("");
      setCurrentPw("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar contraseña.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)" }}>
      {/* Toggle header */}
      <button
        type="button"
        onClick={toggle}
        style={{
          all: "unset", width: "100%", boxSizing: "border-box",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700, fontSize: 14.5, color: "var(--ink)",
          }}>
            Configurar contraseña
          </span>
        </div>
        <span style={{
          fontSize: 11, color: "var(--mute)",
          fontFamily: "var(--font-jetbrains), monospace",
          display: "inline-block",
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.15s",
        }}>
          ▼
        </span>
      </button>

      {open && (
        <form
          onSubmit={handleSave}
          style={{
            borderTop: "1px solid var(--line)",
            padding: "20px 20px 24px",
            display: "flex", flexDirection: "column", gap: 16,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "var(--mute)", lineHeight: 1.5 }}>
            Establece o cambia la contraseña de acceso a tu cuenta.
          </p>

          <div>
            <label style={SL}>
              Contraseña actual{" "}
              <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                (solo si ya tienes una)
              </span>
            </label>
            <input
              type="password"
              style={SI}
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="Contraseña actual"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label style={SL}>Nueva contraseña *</label>
            <input
              type="password"
              style={SI}
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
            {newPw.length > 0 && newPw.length < 8 && (
              <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#DC2626" }}>
                {8 - newPw.length} caracteres más
              </p>
            )}
          </div>

          <div>
            <label style={SL}>Confirmar contraseña *</label>
            <input
              type="password"
              style={SI}
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Repite la nueva contraseña"
              autoComplete="new-password"
            />
            {confirmPw.length > 0 && confirmPw !== newPw && (
              <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#DC2626" }}>
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", padding: "10px 14px" }}>
              <p style={{ margin: 0, color: "#DC2626", fontSize: 13, fontWeight: 600 }}>{error}</p>
            </div>
          )}
          {success && (
            <div style={{ background: "rgba(34,197,94,0.08)", border: "1.5px solid #22c55e", padding: "10px 14px" }}>
              <p style={{ margin: 0, color: "#15803d", fontSize: 13, fontWeight: 700 }}>✓ {success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || newPw.length < 8 || newPw !== confirmPw}
            style={{
              alignSelf: "flex-start",
              height: 44, padding: "0 24px",
              background: saving || newPw.length < 8 || newPw !== confirmPw
                ? "var(--mute)"
                : "var(--navy)",
              color: "#fff", border: "none",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 700, fontSize: 14,
              cursor: saving || newPw.length < 8 || newPw !== confirmPw
                ? "default"
                : "pointer",
            }}
          >
            {saving ? "Guardando…" : "Guardar contraseña →"}
          </button>
        </form>
      )}
    </div>
  );
}
