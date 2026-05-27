"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LogoMark } from "@/components/LogoMark";
import { clerkAppearance } from "@/lib/clerk-appearance";

type Tab = "cliente" | "maestro";

const TABS: { id: Tab; label: string }[] = [
  { id: "cliente", label: "🏠 Soy cliente" },
  { id: "maestro", label: "⛑ Soy maestro" },
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
};

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("cliente");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "cliente" || t === "maestro") setTab(t);
  }, []);

  const benefits = BENEFITS[tab];

  return (
    <div style={{
      background: "var(--bg)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px",
    }}>
      <div className="tape-thin" style={{ position: "fixed", top: 0, left: 0, right: 0 }} />
      <div style={{ width: "100%", maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <LogoMark size={34} />
            <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 22 }}>
              <span style={{ color: "var(--navy)" }}>OBRA</span>
              <span style={{ color: "var(--orange)" }}>BIEN</span>
            </span>
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", border: "1.5px solid var(--line)", marginBottom: 0 }}>
          {TABS.map(({ id, label }, i) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                padding: "13px 8px",
                background: tab === id ? "var(--navy)" : "#fff",
                border: "none",
                borderRight: i < TABS.length - 1 ? "1.5px solid var(--line)" : "none",
                cursor: "pointer",
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: tab === id ? "#fff" : "var(--mute)",
                transition: "background .15s, color .15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Clerk card */}
        <div style={{ background: "#fff", border: "1.5px solid var(--line)", borderTop: "none", padding: "32px 28px 24px" }}>
          {tab === "cliente" && (
            <SignUp appearance={clerkAppearance} forceRedirectUrl="/dashboard?role=cliente" />
          )}
          {tab === "maestro" && (
            <SignUp appearance={clerkAppearance} forceRedirectUrl="/dashboard?role=maestro" />
          )}
        </div>

        {/* Benefits strip */}
        <div style={{
          background: benefits.color,
          padding: "12px 20px",
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
              gap: 5,
            }}>
              <span style={{ color: tab === "maestro" ? "#F97316" : "rgba(255,255,255,0.85)", fontWeight: 900 }}>✓</span>
              {item}
            </span>
          ))}
        </div>

        {/* Sign in link */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13.5, color: "var(--mute)" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/sign-in" style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "none" }}>
            Iniciar sesión
          </Link>
        </p>

      </div>
    </div>
  );
}
