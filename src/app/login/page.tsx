"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LogoMark } from "@/components/LogoMark";
import { clerkAppearance } from "@/lib/clerk-appearance";

type Tab = "cliente" | "maestro" | "entrar";

const TABS: { id: Tab; label: string }[] = [
  { id: "cliente", label: "🏠 Soy cliente" },
  { id: "maestro", label: "⛑ Soy maestro" },
  { id: "entrar",  label: "→ Iniciar sesión" },
];

const BENEFITS: Record<Tab, { color: string; items: string[] }> = {
  cliente: {
    color: "#F97316",
    items: ["Gratis para clientes", "Maestros verificados", "Contacto directo"],
  },
  maestro: {
    color: "#14375F",
    items: ["100% gratis", "Sin comisiones", "Badge verificado"],
  },
  entrar: {
    color: "#14375F",
    items: ["Acceso seguro", "Tus datos protegidos", "Soporte 24/7"],
  },
};

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("cliente");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "cliente" || t === "maestro" || t === "entrar") setTab(t);
  }, []);

  const benefits = BENEFITS[tab];

  return (
    <div style={{
      background: "var(--bg)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 16px 80px",
    }}>
      <div style={{ width: "100%", maxWidth: 500 }}>

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
        <div style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1.5px solid var(--line)" }}>
            {TABS.map(({ id, label }, i) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  flex: 1,
                  padding: "14px 6px",
                  background: tab === id ? "var(--navy)" : "#f8f9fa",
                  border: "none",
                  borderRight: i < TABS.length - 1 ? "1.5px solid var(--line)" : "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700,
                  fontSize: 12.5,
                  color: tab === id ? "#fff" : "var(--mute)",
                  transition: "background .15s, color .15s",
                  letterSpacing: "0.01em",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Clerk component */}
          <div style={{ padding: "40px 40px 36px" }}>
            {tab === "cliente" && (
              <SignUp appearance={clerkAppearance} forceRedirectUrl="/dashboard?role=cliente" />
            )}
            {tab === "maestro" && (
              <SignUp appearance={clerkAppearance} forceRedirectUrl="/dashboard?role=maestro" />
            )}
            {tab === "entrar" && (
              <SignIn appearance={clerkAppearance} forceRedirectUrl="/dashboard" />
            )}
          </div>

          {/* Benefits strip */}
          <div style={{
            background: benefits.color,
            padding: "14px 24px",
            display: "flex",
            gap: 20,
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            {benefits.items.map(item => (
              <span key={item} style={{
                color: "#fff",
                fontSize: 11.5,
                fontFamily: "var(--font-jetbrains), monospace",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <span style={{ color: tab === "maestro" ? "#F97316" : "rgba(255,255,255,0.85)", fontWeight: 900 }}>✓</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Toggle hint */}
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13.5, color: "var(--mute)" }}>
          {tab === "entrar" ? (
            <>¿No tienes cuenta?{" "}
              <button onClick={() => setTab("cliente")} style={{ background: "none", border: "none", color: "var(--navy)", fontWeight: 600, fontSize: 13.5, cursor: "pointer", padding: 0 }}>
                Regístrate gratis
              </button>
            </>
          ) : (
            <>¿Ya tienes cuenta?{" "}
              <button onClick={() => setTab("entrar")} style={{ background: "none", border: "none", color: "var(--navy)", fontWeight: 600, fontSize: 13.5, cursor: "pointer", padding: 0 }}>
                Iniciar sesión
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  );
}
