"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.31.07 2.22.74 2.98.8 1.13-.23 2.2-.93 3.37-.84 1.43.12 2.51.7 3.22 1.79-2.96 1.77-2.26 5.65.34 6.74-.51 1.35-1.19 2.7-1.91 4.37zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

type Tab = "cliente" | "maestro";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("cliente");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
  }

  const TAB_LABELS: { id: Tab; label: string; href: string }[] = [
    { id: "cliente", label: "Soy cliente", href: "/registro-cliente" },
    { id: "maestro", label: "Soy maestro", href: "/registro" },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="tape-thin" />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <LogoMark size={36} />
              <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 20 }}>
                <span style={{ color: "var(--navy)" }}>OBRA</span>
                <span style={{ color: "var(--orange)" }}>BIEN</span>
              </span>
            </Link>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "32px 28px" }}>
            <span className="label" style={{ display: "block", marginBottom: 6 }}>// Acceder a tu cuenta</span>
            <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 24, fontWeight: 800, color: "var(--navy)", margin: "0 0 20px" }}>
              Iniciar sesión
            </h1>

            {/* Tabs */}
            <div style={{ display: "flex", border: "1.5px solid var(--ink)", marginBottom: 24 }}>
              {TAB_LABELS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setDone(false); }}
                  style={{
                    flex: 1, height: 42, border: "none",
                    background: tab === t.id ? "var(--navy)" : "#fff",
                    color: tab === t.id ? "#fff" : "var(--ink-soft)",
                    fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                    borderRight: t.id === "cliente" ? "1.5px solid var(--ink)" : "none",
                    transition: "all .15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {done ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
                <div style={{ fontWeight: 700, color: "#25a55a", fontSize: 18, marginBottom: 8 }}>¡Sesión iniciada!</div>
                <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 20 }}>
                  Bienvenido de vuelta a OBRABIEN.
                </p>
                <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--navy)", color: "#fff", border: "none", padding: "12px 24px", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
                  Ir al inicio
                </Link>
              </div>
            ) : (
              <>
                {/* Social buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Entrar con Google", icon: <GoogleIcon />, bg: "#fff", border: "#dadce0", color: "#3c4043" },
                    { label: "Entrar con Facebook", icon: <FacebookIcon />, bg: "#1877F2", border: "#1877F2", color: "#fff" },
                    { label: "Entrar con Apple", icon: <AppleIcon />, bg: "#000", border: "#000", color: "#fff" },
                  ].map(({ label, icon, bg, border, color }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setDone(true)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        height: 44, border: `1.5px solid ${border}`, background: bg, color,
                        fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%",
                      }}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                  <span style={{ fontSize: 12, color: "var(--mute)", whiteSpace: "nowrap" }}>o con email</span>
                  <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="field">
                    <label>Correo electrónico</label>
                    <input
                      className="ob-input"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="field">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <label style={{ margin: 0 }}>Contraseña</label>
                      <Link href="/recuperar-contrasena" style={{ fontSize: 12, color: "var(--mute)" }}>¿Olvidaste tu contraseña?</Link>
                    </div>
                    <input
                      className="ob-input"
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Tu contraseña"
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      height: 48, background: "var(--orange)", color: "#fff", border: "none",
                      fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4,
                    }}
                  >
                    Iniciar sesión
                  </button>
                </form>
              </>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--mute)", marginTop: 20 }}>
            ¿No tienes cuenta?{" "}
            <Link
              href={tab === "cliente" ? "/registro-cliente" : "/registro"}
              style={{ color: "var(--navy)", fontWeight: 600 }}
            >
              {tab === "cliente" ? "Registrarte como cliente" : "Registrarte como maestro"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
