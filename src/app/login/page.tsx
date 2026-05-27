"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LogoMark } from "@/components/LogoMark";
import { clerkAppearance } from "@/lib/clerk-appearance";

type Tab = "login" | "cliente" | "maestro";

const TABS: { id: Tab; label: string }[] = [
  { id: "login", label: "Iniciar sesión" },
  { id: "cliente", label: "🏠 Soy cliente" },
  { id: "maestro", label: "⛑ Soy maestro" },
];

const BENEFITS: Record<"cliente" | "maestro", { color: string; items: string[] }> = {
  cliente: {
    color: "#F97316",
    items: ["Gratis para clientes", "Maestros verificados", "Contacto directo"],
  },
  maestro: {
    color: "#0F2640",
    items: ["100% gratis", "Sin comisiones", "Badge verificado"],
  },
};

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "cliente" || t === "maestro") setTab(t);
  }, []);

  const benefits = tab !== "login" ? BENEFITS[tab] : null;

  return (
    <div style={{
      background: "#14375F",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <LogoMark size={34} />
            <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 22 }}>
              <span style={{ color: "#fff" }}>OBRA</span>
              <span style={{ color: "#F97316" }}>BIEN</span>
            </span>
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {TABS.map(({ id, label }, i) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                padding: "12px 6px",
                background: tab === id ? "#fff" : "rgba(255,255,255,0.1)",
                border: "none",
                borderRight: i < TABS.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none",
                cursor: "pointer",
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 700,
                fontSize: 12.5,
                color: tab === id ? "#14375F" : "rgba(255,255,255,0.65)",
                transition: "background .15s, color .15s",
                letterSpacing: "0.01em",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Clerk card */}
        <div style={{ background: "#fff", padding: "36px 28px 28px" }}>
          {tab === "login" && (
            <SignIn appearance={clerkAppearance} />
          )}
          {tab === "cliente" && (
            <SignUp appearance={clerkAppearance} forceRedirectUrl="/dashboard?role=cliente" />
          )}
          {tab === "maestro" && (
            <SignUp appearance={clerkAppearance} forceRedirectUrl="/dashboard?role=maestro" />
          )}
        </div>

        {/* Benefits strip */}
        {benefits && (
          <div style={{
            background: benefits.color,
            padding: "13px 20px",
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
        )}

        {/* Back to home */}
        <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, margin: "22px 0 0" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 500 }}>
            ← Volver al inicio
          </Link>
        </p>

      </div>
    </div>
  );
}
