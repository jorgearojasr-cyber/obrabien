"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

export default function OnboardingForm() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [loading, setLoading] = useState<"maestro" | "cliente" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (user?.primaryEmailAddress?.emailAddress === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.replace("/admin");
    }
  }, [isLoaded, user, router]);

  // Show spinner while Clerk loads or while redirecting admin
  if (!isLoaded || user?.primaryEmailAddress?.emailAddress === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--mute)", letterSpacing: "0.05em" }}>
          Cargando...
        </div>
      </div>
    );
  }

  async function setRole(role: "maestro" | "cliente") {
    setLoading(role);
    setError(null);
    try {
      const res = await fetch("/api/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }
      // Route through /dashboard (central routing) instead of jumping straight to
      // /dashboard/{role} — for maestros, dashboard/page.tsx decides between
      // registro-basico (no Supabase row yet) and the maestro dashboard.
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar tu perfil. Intenta de nuevo.");
      setLoading(null);
    }
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
            ¿Cómo usarás ObraBien?
          </h1>
          <p style={{ textAlign: "center", color: "var(--mute)", margin: "0 0 32px", fontSize: 15 }}>
            Selecciona tu perfil para personalizar tu experiencia
          </p>

          {error && (
            <div style={{ marginBottom: 16, padding: "12px 16px", background: "#fff0f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: 13.5, lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => setRole("cliente")}
              disabled={loading !== null}
              style={{
                background: "#fff", border: "1.5px solid var(--navy)", padding: "22px 20px",
                cursor: "pointer", textAlign: "left",
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
                background: "#fff", border: "1.5px solid var(--orange)", padding: "22px 20px",
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
