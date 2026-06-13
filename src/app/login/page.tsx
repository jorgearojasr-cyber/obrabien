"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

export default function LoginPage() {
  return (
    <div style={{
      background: "var(--bg)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "32px 16px 48px",
    }}>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <LogoMark size={36} />
          <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 24 }}>
            <span style={{ color: "var(--navy)" }}>OBRA</span>
            <span style={{ color: "var(--orange)" }}>BIEN</span>
          </span>
        </Link>
      </div>

      {/* Card + button share the same width container */}
      <div style={{ width: "100%", maxWidth: 400 }}>

        <SignIn
          routing="hash"
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: { width: "100%" },
              card: {
                width: "100%",
                boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
                borderRadius: 12,
                margin: 0,
              },
              footer: { display: "none" },
            },
          }}
        />

        <div style={{ marginTop: 16 }}>
          <p style={{
            textAlign: "center", fontSize: 13.5,
            color: "var(--mute)", marginBottom: 10,
            fontFamily: "var(--font-inter-tight), sans-serif",
          }}>
            ¿No tienes cuenta aún?
          </p>
          <Link href="/registro" style={{
            display: "block", width: "100%", boxSizing: "border-box",
            padding: "13px 0", textAlign: "center",
            background: "var(--orange)", color: "#fff",
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700, fontSize: 14,
            textDecoration: "none", borderRadius: 8,
          }}>
            Crear cuenta gratis →
          </Link>
        </div>

      </div>
    </div>
  );
}
