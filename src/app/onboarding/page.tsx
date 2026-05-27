"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"maestro" | "cliente" | null>(null);

  async function setRole(role: "maestro" | "cliente") {
    setLoading(role);
    await fetch("/api/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.push(`/dashboard/${role}`);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="tape-thin" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <LogoMark size={36} />
              <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 20 }}>
                <span style={{ color: "var(--navy)" }}>OBRA</span>
                <span style={{ color: "var(--orange)" }}>BIEN</span>
              </span>
            </Link>
          </div>

          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(24px,4vw,34px)", color: "var(--navy)", margin: "0 0 8px", textAlign: "center", lineHeight: 1.1 }}>
            ¿Cómo usarás OBRABIEN?
          </h1>
          <p style={{ textAlign: "center", color: "var(--mute)", margin: "0 0 32px", fontSize: 15 }}>
            Selecciona tu perfil para personalizar tu experiencia
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => setRole("cliente")}
              disabled={loading !== null}
              style={{
                background: "#fff", border: "1.5px solid var(--line)", padding: "22px 20px",
                cursor: "pointer", textAlign: "left", transition: "border-color .15s",
                opacity: loading !== null && loading !== "cliente" ? 0.5 : 1,
              }}
            >
              <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 18, color: "var(--navy)", marginBottom: 6 }}>
                🏠 Soy cliente
              </div>
              <div style={{ fontSize: 14, color: "var(--mute)", lineHeight: 1.5 }}>
                Busco maestros para proyectos de construcción o reparación
              </div>
              {loading === "cliente" && (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--orange)", fontFamily: "var(--font-jetbrains), monospace" }}>
                  Configurando tu cuenta...
                </div>
              )}
            </button>

            <button
              onClick={() => setRole("maestro")}
              disabled={loading !== null}
              style={{
                background: "#fff", border: "1.5px solid var(--navy)", padding: "22px 20px",
                cursor: "pointer", textAlign: "left",
                opacity: loading !== null && loading !== "maestro" ? 0.5 : 1,
              }}
            >
              <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 18, color: "var(--navy)", marginBottom: 6 }}>
                ⛑ Soy maestro
              </div>
              <div style={{ fontSize: 14, color: "var(--mute)", lineHeight: 1.5 }}>
                Ofrezco servicios de construcción y quiero recibir clientes
              </div>
              {loading === "maestro" && (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--orange)", fontFamily: "var(--font-jetbrains), monospace" }}>
                  Configurando tu cuenta...
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
