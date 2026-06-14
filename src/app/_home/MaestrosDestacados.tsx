"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { MapPin, Star } from "lucide-react";

export interface MaestroCard {
  id: string;
  name: string;
  initials: string;
  photoUrl?: string;
  specialties: string[];
  city: string;
  rating: number;
  jobs: number;
  verified: boolean;
  description: string;
}

function PhotoOrInitials({ m }: { m: MaestroCard }) {
  if (m.photoUrl) {
    return (
      <Image
        src={m.photoUrl}
        alt={m.name}
        fill
        sizes="220px"
        style={{ objectFit: "cover" }}
      />
    );
  }
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "var(--navy)",
      display: "grid", placeItems: "center",
      fontFamily: "var(--font-archivo), sans-serif",
      fontWeight: 900, fontSize: 36, color: "#fff",
      letterSpacing: "-0.02em",
    }}>
      {m.initials}
    </div>
  );
}

export default function MaestrosDestacados({ maestros }: { maestros: MaestroCard[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (maestros.length === 0) return null;

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 440 : -440, behavior: "smooth" });
  }

  return (
    <section style={{ background: "#fff", padding: "56px 0 52px" }}>
      <div className="wrap">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
          <h2 style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 800, fontSize: "clamp(18px, 2.5vw, 24px)",
            color: "var(--navy)", letterSpacing: "-0.02em", margin: 0,
          }}>
            Maestros destacados
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/buscar" style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 12, fontWeight: 700, color: "var(--orange)",
              textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}>
              Ver todos →
            </Link>
            <div className="esp-arrows">
              {(["left", "right"] as const).map(dir => (
                <button key={dir} onClick={() => scroll(dir)} aria-label={dir === "left" ? "Anterior" : "Siguiente"} style={{
                  width: 34, height: 34, borderRadius: "50%",
                  border: "1.5px solid var(--line)", background: "#fff",
                  display: "grid", placeItems: "center", cursor: "pointer",
                  color: "var(--navy)", flexShrink: 0,
                  transition: "border-color .15s, background .15s",
                }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div ref={scrollRef} className="maestros-carousel no-scrollbar">
          {maestros.map(m => (
            <Link key={m.id} href={`/maestro/${m.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
              <div className="maestro-carousel-card">
                {/* Photo */}
                <div style={{ position: "relative", width: "100%", height: 180, flexShrink: 0, borderRadius: "12px 12px 0 0", overflow: "hidden", background: "var(--bg-2)" }}>
                  <PhotoOrInitials m={m} />
                </div>

                {/* Info */}
                <div style={{ padding: "12px 12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontWeight: 700, fontSize: 13.5, color: "var(--navy)", lineHeight: 1.3,
                  }}>
                    {m.name}
                  </div>

                  {m.specialties.length > 0 && (
                    <div style={{
                      fontSize: 11.5, color: "var(--mute)", fontWeight: 500,
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
                    }}>
                      {m.specialties[0]}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <MapPin size={10} color="var(--mute)" strokeWidth={2} />
                    <span style={{ fontSize: 11.5, color: "var(--mute)" }}>{m.city}</span>
                  </div>

                  {m.rating > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                      <Star size={11} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)" }}>
                        {m.rating.toFixed(1)}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--mute)" }}>
                        ({m.jobs} {m.jobs === 1 ? "reseña" : "reseñas"})
                      </span>
                    </div>
                  )}

                  {m.verified && (
                    <div style={{
                      marginTop: 5,
                      display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start",
                      background: "#dcfce7", color: "#15803d",
                      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em",
                      padding: "3px 8px", borderRadius: 999,
                    }}>
                      ✓ Verificado
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
