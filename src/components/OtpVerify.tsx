"use client";

import { useState, useEffect, useRef } from "react";

const WA_DEMO    = "123456";
const EMAIL_DEMO = "654321";
const RESEND_SECS = 60;
const BLOCK_SECS  = 300;
const MAX_TRIES   = 3;

export type VerifyMethod = "whatsapp" | "email";

interface Props {
  onVerified: (method: VerifyMethod, value: string) => void;
}

export function OtpVerify({ onVerified }: Props) {
  const [method,    setMethod]    = useState<VerifyMethod>("whatsapp");
  const [contact,   setContact]   = useState("");
  const [codeSent,  setCodeSent]  = useState(false);
  const [digits,    setDigits]    = useState(["", "", "", "", "", ""]);
  const [tries,     setTries]     = useState(0);
  const [error,     setError]     = useState("");
  const [verified,  setVerified]  = useState(false);
  const [timerSecs, setTimer]     = useState(RESEND_SECS);
  const [blocked,   setBlocked]   = useState(false);
  const [blockSecs, setBlockSecs] = useState(BLOCK_SECS);

  const refs = useRef<(HTMLInputElement | null)[]>([]);

  /* Resend countdown */
  useEffect(() => {
    if (!codeSent || verified || blocked || timerSecs <= 0) return;
    const id = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [codeSent, timerSecs, verified, blocked]);

  /* Block countdown */
  useEffect(() => {
    if (!blocked) return;
    if (blockSecs <= 0) {
      setBlocked(false); setTries(0); setBlockSecs(BLOCK_SECS);
      setDigits(["", "", "", "", "", ""]); setError("");
      return;
    }
    const id = setTimeout(() => setBlockSecs(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [blocked, blockSecs]);

  /* Auto-verify when all 6 digits entered */
  useEffect(() => {
    const full = digits.join("");
    if (full.length === 6 && codeSent && !verified && !blocked) checkCode(full);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  function sendCode() {
    setCodeSent(true); setTimer(RESEND_SECS);
    setDigits(["", "", "", "", "", ""]); setError("");
    setTimeout(() => refs.current[0]?.focus(), 60);
  }

  function checkCode(code: string) {
    const expected = method === "whatsapp" ? WA_DEMO : EMAIL_DEMO;
    if (code === expected) {
      setVerified(true);
      onVerified(method, method === "whatsapp" ? `56${contact}` : contact);
    } else {
      const n = tries + 1;
      setTries(n);
      if (n >= MAX_TRIES) {
        setBlocked(true); setBlockSecs(BLOCK_SECS);
      } else {
        const left = MAX_TRIES - n;
        setError(`Código incorrecto, intenta nuevamente (${left} intento${left !== 1 ? "s" : ""} restante${left !== 1 ? "s" : ""})`);
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => refs.current[0]?.focus(), 60);
      }
    }
  }

  function handleDigit(i: number, val: string) {
    const ch = val.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = ch; setDigits(next); setError("");
    if (ch && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const next = [...digits]; next[i - 1] = ""; setDigits(next);
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const raw = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!raw) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    raw.split("").forEach((ch, idx) => { next[idx] = ch; });
    setDigits(next);
    refs.current[Math.min(raw.length, 5)]?.focus();
  }

  const pad2      = (s: number) => String(s).padStart(2, "0");
  const blockFmt  = `${Math.floor(blockSecs / 60)}:${pad2(blockSecs % 60)}`;
  const canSend   = method === "whatsapp" ? /^\d{8}$/.test(contact) : /\S+@\S+\.\S+/.test(contact);
  const contactFmt = method === "whatsapp" ? `+56 9${contact}` : contact;

  /* ── Verified state ── */
  if (verified) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        border: "1.5px solid #68d391", background: "rgba(37,165,90,0.06)",
        padding: "12px 16px",
      }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#25a55a"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="m5 12 5 5L20 7"/>
        </svg>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a8c4a" }}>
            {method === "whatsapp" ? "Teléfono verificado" : "Email verificado"}
          </div>
          <div style={{ fontSize: 12, color: "#25a55a", marginTop: 1 }}>{contactFmt}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Label + method selector */}
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
          Verificación de cuenta *
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {(["whatsapp", "email"] as VerifyMethod[]).map(m => {
            const active = method === m;
            return (
              <button key={m} type="button"
                onClick={() => { if (!codeSent) { setMethod(m); setContact(""); setError(""); } }}
                disabled={codeSent}
                style={{
                  flex: 1, height: 42, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  border: `2px solid ${active ? "var(--orange)" : "var(--line)"}`,
                  background: active ? "rgba(232,108,28,0.08)" : "#fff",
                  color: active ? "var(--ink)" : "var(--mute)",
                  fontWeight: active ? 700 : 500, fontSize: 13.5,
                  cursor: codeSent ? "not-allowed" : "pointer",
                  opacity: codeSent && !active ? 0.4 : 1,
                  transition: "all .15s",
                }}>
                {m === "whatsapp" ? "📱 WhatsApp" : "✉️ Email"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact input or sent confirmation */}
      {!codeSent ? (
        <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
          {method === "whatsapp" ? (
            <div style={{ display: "flex", flex: 1 }}>
              <span style={{
                display: "flex", alignItems: "center", padding: "0 10px", flexShrink: 0,
                background: "var(--bg-2)", border: "1.5px solid var(--line)", borderRight: "none",
                fontSize: 14, color: "var(--ink-soft)", fontWeight: 600, whiteSpace: "nowrap",
              }}>
                +56 9
              </span>
              <input className="ob-input" type="tel" inputMode="numeric"
                value={contact}
                onChange={e => setContact(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="1234 5678"
                style={{ flex: 1, borderLeft: "none" }}
              />
            </div>
          ) : (
            <input className="ob-input" type="email"
              value={contact}
              onChange={e => setContact(e.target.value)}
              placeholder="tu@email.cl"
              style={{ flex: 1 }}
            />
          )}
          <button type="button" onClick={sendCode} disabled={!canSend}
            style={{
              padding: "0 14px", flexShrink: 0, whiteSpace: "nowrap",
              background: canSend ? "var(--navy)" : "var(--bg-2)",
              border: `1.5px solid ${canSend ? "var(--navy)" : "var(--line)"}`,
              color: canSend ? "#fff" : "var(--mute)",
              fontWeight: 700, fontSize: 13,
              cursor: canSend ? "pointer" : "not-allowed", transition: "all .15s",
            }}>
            Enviar código
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-soft)", flexWrap: "wrap" }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{method === "whatsapp" ? "📱" : "✉️"}</span>
          <span>Enviamos un código a <strong style={{ color: "var(--ink)" }}>{contactFmt}</strong></span>
          <button type="button"
            onClick={() => { setCodeSent(false); setDigits(["","","","","",""]); setError(""); setTries(0); setBlocked(false); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--mute)", textDecoration: "underline", padding: 0 }}>
            Cambiar
          </button>
        </div>
      )}

      {/* OTP digit boxes */}
      {codeSent && !blocked && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }} onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input key={i}
                ref={el => { refs.current[i] = el; }}
                type="text" inputMode="numeric" maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                style={{
                  width: 44, height: 52, textAlign: "center", flexShrink: 0,
                  border: `2px solid ${error ? "#e53e3e" : d ? "var(--navy)" : "var(--line)"}`,
                  background: error ? "rgba(229,62,62,0.04)" : d ? "rgba(20,55,95,0.04)" : "#fff",
                  fontSize: 22, fontWeight: 700,
                  fontFamily: "var(--font-jetbrains), JetBrains Mono, monospace",
                  color: "var(--ink)", outline: "none", transition: "border-color .15s",
                }}
              />
            ))}
          </div>

          {error && (
            <p style={{ fontSize: 12.5, color: "#e53e3e", textAlign: "center", margin: 0, fontWeight: 500 }}>
              {error}
            </p>
          )}

          {/* Timer / Resend */}
          <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--mute)" }}>
            {timerSecs > 0 ? (
              <span>
                Reenviar en{" "}
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, color: "var(--ink-soft)" }}>
                  0:{pad2(timerSecs)}
                </span>
              </span>
            ) : (
              <button type="button" onClick={sendCode}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--navy)", fontWeight: 700, fontSize: 12.5, padding: 0, textDecoration: "underline" }}>
                Reenviar código
              </button>
            )}
          </div>

          {/* Demo hint */}
          <p style={{ fontSize: 11.5, color: "var(--mute)", textAlign: "center", margin: 0 }}>
            Código de prueba:{" "}
            <strong style={{ fontFamily: "var(--font-jetbrains), monospace" }}>
              {method === "whatsapp" ? WA_DEMO : EMAIL_DEMO}
            </strong>
          </p>
        </div>
      )}

      {/* Blocked state */}
      {blocked && (
        <div style={{ background: "#fff5f5", border: "1.5px solid #fed7d7", padding: "14px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 13.5, color: "#c53030", fontWeight: 700, margin: "0 0 4px" }}>
            Demasiados intentos.
          </p>
          <p style={{ fontSize: 13, color: "#c53030", margin: 0 }}>
            Podrás intentar nuevamente en{" "}
            <strong style={{ fontFamily: "var(--font-jetbrains), monospace" }}>{blockFmt}</strong>{" "}minutos
          </p>
        </div>
      )}
    </div>
  );
}
