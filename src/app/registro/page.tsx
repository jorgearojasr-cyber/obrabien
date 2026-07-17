"use client";

import { useSignUp, useAuth, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { LogoMark } from "@/components/LogoMark";

type Tab = "cliente" | "maestro";

const TABS: { id: Tab; label: string }[] = [
  { id: "cliente", label: "🏠 Soy cliente" },
  { id: "maestro", label: "⛑ Soy maestro" },
];

const BENEFITS: Record<Tab, { color: string; items: string[] }> = {
  cliente: { color: "#14375F", items: ["Gratis para clientes", "Maestros verificados", "Contacto directo"] },
  maestro: { color: "#F97316", items: ["100% gratis", "Sin comisiones", "Badge verificado"] },
};

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "jorge.arojasr@gmail.com").toLowerCase().trim();

function clerkErrMsg(err: unknown): string {
  if (!err) return "Ocurrió un error.";
  if (typeof err === "object") {
    const e = err as { longMessage?: string; message?: string; errors?: { longMessage?: string; message?: string }[] };
    if (e.longMessage) return e.longMessage;
    if (e.message) return e.message;
    if (e.errors?.[0]?.longMessage) return e.errors[0].longMessage;
    if (e.errors?.[0]?.message) return e.errors[0].message;
  }
  return "Ocurrió un error. Intenta de nuevo.";
}

const F_LABEL: React.CSSProperties = {
  display: "block", fontSize: 11.5, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.08em",
  color: "#6b7280", marginBottom: 6,
  fontFamily: "var(--font-jetbrains), monospace",
};

const F_INPUT: React.CSSProperties = {
  width: "100%", height: 44,
  border: "1.5px solid var(--line)",
  padding: "0 14px", fontSize: 14,
  color: "var(--ink)", background: "#fff",
  outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};

const GOOGLE_STYLE: React.CSSProperties = {
  width: "100%", height: 44, boxSizing: "border-box",
  background: "#fff", border: "1.5px solid var(--line)",
  cursor: "pointer", fontFamily: "var(--font-archivo), sans-serif",
  fontWeight: 600, fontSize: 14, color: "var(--ink)",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
      <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
      <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
      <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
    </svg>
  );
}

function SectionLabel({ text, color = "var(--navy)" }: { text: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color, flexShrink: 0 }}>
        {text}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
    </div>
  );
}

// ── Sign-Up ────────────────────────────────────────────────────────────────────

function SignUpSection({ redirectUrl }: { redirectUrl: string }) {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [confirmPwd,   setConfirmPwd]   = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [serverError,  setServerError]  = useState("");
  const [busy,         setBusy]         = useState(false);
  const [step,         setStep]         = useState<"form" | "verifying">("form");
  const [code,         setCode]         = useState("");

  async function handleGoogle() {
    setServerError("");
    const { error } = await signUp.sso({
      strategy: "oauth_google",
      redirectUrl: redirectUrl,
      redirectCallbackUrl: `${window.location.origin}/sso-callback`,
    });
    if (error) setServerError(clerkErrMsg(error));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (password !== confirmPwd) { setConfirmError("Las contraseñas no coinciden"); return; }
    setConfirmError("");
    setBusy(true);
    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) { setServerError(clerkErrMsg(error)); setBusy(false); return; }
    if (signUp.status === "complete") {
      const { error: finalErr } = await signUp.finalize();
      if (!finalErr) router.push(redirectUrl);
      else setServerError(clerkErrMsg(finalErr));
    } else {
      const { error: sendErr } = await signUp.verifications.sendEmailCode();
      if (sendErr) setServerError(clerkErrMsg(sendErr));
      else setStep("verifying");
    }
    setBusy(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setBusy(true);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) { setServerError(clerkErrMsg(error)); setBusy(false); return; }
    if (signUp.status === "complete") {
      const { error: finalErr } = await signUp.finalize();
      if (!finalErr) router.push(redirectUrl);
      else setServerError(clerkErrMsg(finalErr));
    }
    setBusy(false);
  }

  const confirmBorder = !confirmPwd ? "1.5px solid var(--line)" : confirmError ? "1.5px solid #EF4444" : "1.5px solid #22c55e";

  const navyBtn: React.CSSProperties = {
    width: "100%", height: 46, border: "none", boxSizing: "border-box",
    background: busy ? "#9ca3af" : "#1a2b4a", color: "#fff",
    fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800,
    fontSize: 14, cursor: busy ? "not-allowed" : "pointer",
  };

  if (step === "verifying") {
    return (
      <form onSubmit={handleVerify} noValidate>
        <div style={{ background: "rgba(20,55,95,0.05)", border: "1.5px solid var(--line)", padding: "12px 16px", marginBottom: 18, fontSize: 13.5, color: "var(--navy)", lineHeight: 1.6 }}>
          Enviamos un código a <strong>{email}</strong>. Revisa tu correo.
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={F_LABEL}>Código de verificación</label>
          <input type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value)} placeholder="123456" style={F_INPUT} required />
        </div>
        {serverError && <p style={{ fontSize: 12.5, color: "#b91c1c", margin: "0 0 12px", fontFamily: "var(--font-jetbrains), monospace" }}>{serverError}</p>}
        <button type="submit" disabled={busy} style={navyBtn}>{busy ? "Verificando…" : "Verificar y crear cuenta →"}</button>
        <button type="button" onClick={() => { setStep("form"); setCode(""); setServerError(""); }} style={{ all: "unset", cursor: "pointer", display: "block", textAlign: "center", marginTop: 12, fontSize: 12.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", width: "100%" }}>
          ← Volver
        </button>
      </form>
    );
  }

  return (
    <div>
      <button type="button" onClick={handleGoogle} style={GOOGLE_STYLE}>
        <GoogleIcon /> Continuar con Google
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
        <span style={{ fontSize: 11.5, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>o con correo</span>
        <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 14 }}>
          <label style={F_LABEL}>Correo electrónico</label>
          <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.cl" style={F_INPUT} required />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={F_LABEL}>Contraseña</label>
          <input type="password" autoComplete="new-password" value={password}
            onChange={e => { setPassword(e.target.value); if (confirmPwd) setConfirmError(e.target.value !== confirmPwd ? "Las contraseñas no coinciden" : ""); }}
            placeholder="Crea tu contraseña" style={F_INPUT} required />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={F_LABEL}>Confirma tu contraseña</label>
          <input type="password" autoComplete="new-password" value={confirmPwd}
            onChange={e => { setConfirmPwd(e.target.value); setConfirmError(e.target.value && e.target.value !== password ? "Las contraseñas no coinciden" : ""); }}
            placeholder="Repite tu contraseña" style={{ ...F_INPUT, border: confirmBorder }} required />
          {confirmError && <p style={{ fontSize: 12.5, color: "#b91c1c", margin: "5px 0 0", fontFamily: "var(--font-jetbrains), monospace" }}>{confirmError}</p>}
        </div>
        {serverError && <p style={{ fontSize: 12.5, color: "#b91c1c", margin: "0 0 14px", fontFamily: "var(--font-jetbrains), monospace" }}>{serverError}</p>}
        <button type="submit" disabled={busy} style={navyBtn}>{busy ? "Creando cuenta…" : "Crear cuenta →"}</button>
      </form>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function RegistroContent() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<Tab>(tabParam === "cliente" ? "cliente" : "maestro");

  useEffect(() => {
    if (!authLoaded || !isSignedIn) return;
    const email = (user?.primaryEmailAddress?.emailAddress ?? "").toLowerCase().trim();
    router.replace(email === ADMIN_EMAIL ? "/admin" : "/dashboard");
  }, [authLoaded, isSignedIn, user, router]);

  // Captura ?ref=<rut> del link de invitación en localStorage — sobrevive la
  // cadena de redirects hasta completar-perfil (donde vive el campo real),
  // que un query param por sí solo no sobreviviría. Se ignora si tiene más de
  // 30 días (ver completar-perfil/page.tsx).
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;
    try {
      localStorage.setItem("obrabien_ref", JSON.stringify({ rut: ref, ts: Date.now() }));
    } catch {
      // localStorage no disponible (modo privado, etc.) — el ref simplemente no se precarga
    }
  }, [searchParams]);

  const benefits = BENEFITS[tab];
  const redirectUrl = tab === "maestro" ? "/dashboard?role=maestro" : "/dashboard?role=cliente";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "48px 16px 120px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <LogoMark size={36} />
            <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 24 }}>
              <span style={{ color: "var(--navy)" }}>OBRA</span>
              <span style={{ color: "var(--orange)" }}>BIEN</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1.5px solid var(--line)" }}>
            {TABS.map(({ id, label }, i) => (
              <button key={id} onClick={() => setTab(id)} style={{
                flex: 1, padding: "16px 8px", border: "none",
                borderRight: i < TABS.length - 1 ? "1.5px solid var(--line)" : "none",
                background: tab === id ? (id === "maestro" ? "var(--orange)" : "var(--navy)") : "#f8f9fa",
                cursor: "pointer", fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700, fontSize: 14,
                color: tab === id ? "#fff" : "var(--mute)",
                transition: "background .15s, color .15s", letterSpacing: "0.01em",
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* // INICIA SESIÓN */}
          <div style={{ padding: "28px 28px 24px" }}>
            <SectionLabel text="// INICIA SESIÓN" color="var(--navy)" />
            <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "var(--mute)" }}>
              ¿Ya tienes cuenta?
            </p>
            <Link href="/login" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", height: 46, boxSizing: "border-box",
              background: "var(--orange)", color: "#fff",
              fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800,
              fontSize: 14, textDecoration: "none",
            }}>
              Inicia sesión →
            </Link>
          </div>

          {/* Divider */}
          <div style={{ height: 2, background: "var(--line)", margin: "0 28px" }} />

          {/* // CREAR CUENTA NUEVA */}
          <div style={{ padding: "24px 28px 28px" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 20, fontWeight: 900, color: "var(--navy)", fontFamily: "var(--font-archivo), sans-serif" }}>
              Crea tu cuenta
            </h2>
            <SectionLabel text="// CREAR CUENTA NUEVA" color="var(--orange)" />
            <p style={{ margin: "-6px 0 18px", fontSize: 13.5, color: "var(--mute)", lineHeight: 1.4 }}>
              {tab === "maestro"
                ? "Regístrate como maestro y empieza a recibir contactos."
                : "Regístrate gratis para contactar maestros verificados."}
            </p>
            <SignUpSection key={`signup-${tab}`} redirectUrl={redirectUrl} />
          </div>

          {/* Benefits strip */}
          <div style={{ background: benefits.color, padding: "14px 28px", display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {benefits.items.map(item => (
              <span key={item} style={{ color: "#fff", fontSize: 11.5, fontFamily: "var(--font-jetbrains), monospace", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 900 }}>✓</span>
                {item}
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense>
      <RegistroContent />
    </Suspense>
  );
}
