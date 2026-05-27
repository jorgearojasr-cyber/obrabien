"use client";

import Link from "next/link";
import { SAMPLE_MASTERS } from "@/lib/data";
import { useFavorites } from "@/hooks/useFavorites";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function StarIcon() {
  return <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 17.3 5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6L18.2 21z" /></svg>;
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>;
}
function ArrowIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

const AV_COLORS: [string, string][] = [["#14375F", "#fff"], ["#E86C1C", "#fff"], ["#ECEAE3", "#14375F"]];

export default function FavoritosPage() {
  const { favs, toggle, ready } = useFavorites();

  const masters = SAMPLE_MASTERS.filter(m => favs.has(m.id));

  return (
    <div style={{ background: "var(--bg)", minHeight: "70vh" }}>
      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "32px 0 28px" }}>
        <div className="wrap">
          <span className="label" style={{ color: "var(--orange)" }}>// Mis guardados</span>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", color: "#fff", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, marginTop: 6 }}>
            Maestros favoritos
          </h1>
          <p style={{ color: "#9AA7B5", marginTop: 8, fontSize: 15 }}>
            {ready ? `${masters.length} maestro${masters.length !== 1 ? "s" : ""} guardado${masters.length !== 1 ? "s" : ""}` : "Cargando…"}
          </p>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {!ready ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--mute)" }}>Cargando…</div>
        ) : masters.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "#fff", border: "1px solid var(--line)" }}>
            <div style={{ color: "var(--line)", marginBottom: 16 }}>
              <HeartIcon filled={false} />
            </div>
            <div style={{ fontSize: 56, marginBottom: 16 }}>♡</div>
            <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 22, color: "var(--navy)", marginBottom: 10 }}>
              Aún no tienes favoritos
            </div>
            <p style={{ fontSize: 14.5, color: "var(--mute)", marginBottom: 24, maxWidth: 340, margin: "0 auto 24px" }}>
              Guarda maestros tocando el corazón en su tarjeta. Aparecerán aquí para acceso rápido.
            </p>
            <Link
              href="/buscar"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--orange)", color: "#fff", border: "none",
                padding: "12px 24px", fontWeight: 700, fontSize: 14, textDecoration: "none",
              }}
            >
              Explorar maestros <ArrowIcon />
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {masters.map((m, i) => {
                const [bg, fg] = AV_COLORS[i % AV_COLORS.length];
                const idx = SAMPLE_MASTERS.findIndex(x => x.id === m.id);
                return (
                  <div key={m.id} style={{ position: "relative" }}>
                    {/* Remove favorite button */}
                    <button
                      onClick={() => toggle(m.id)}
                      title="Quitar de favoritos"
                      style={{
                        position: "absolute", top: 12, right: 12, zIndex: 2,
                        width: 34, height: 34, background: "#fff", border: "1px solid var(--line)",
                        borderRadius: "50%", display: "grid", placeItems: "center",
                        cursor: "pointer", color: "var(--orange)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    >
                      <HeartIcon filled />
                    </button>

                    <Link
                      href={`/maestro/${m.id}`}
                      className="card hoverable col"
                      style={{ textDecoration: "none", padding: 0, borderRadius: 10 }}
                    >
                      <div className="row gap-12" style={{ padding: 16, borderBottom: "1px solid var(--line)" }}>
                        <div style={{
                          width: 64, height: 64, background: bg, color: fg, display: "grid",
                          placeItems: "center", fontFamily: "var(--font-archivo), sans-serif",
                          fontWeight: 800, fontSize: 20, flexShrink: 0, border: "1px solid var(--ink)",
                        }}>
                          {m.initials}
                        </div>
                        <div className="col gap-4" style={{ flex: 1, minWidth: 0, paddingRight: 36 }}>
                          <div className="row center gap-6 wrap-flex">
                            <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 16, fontWeight: 700, lineHeight: 1.15 }}>{m.name}</span>
                            {m.verified && <span className="verified"><CheckIcon /> Verificado</span>}
                          </div>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 600 }}>
                            <StarIcon /> {m.rating.toFixed(1)}
                            <span style={{ color: "var(--mute)", fontWeight: 500 }}>· {m.jobs} trabajos</span>
                          </span>
                          <span style={{ fontSize: 13, color: "var(--mute)" }}>📍 {m.city}</span>
                        </div>
                      </div>
                      <div className="col gap-8" style={{ padding: 16 }}>
                        <div className="row gap-6 wrap-flex">
                          {m.specialties.map(sp => <span key={sp} className="chip">{sp}</span>)}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 4, color: "var(--navy)" }}>
                            Ver perfil <ArrowIcon />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 28, textAlign: "center" }}>
              <Link href="/buscar" style={{ color: "var(--mute)", fontSize: 13, textDecoration: "underline" }}>
                Explorar más maestros
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
