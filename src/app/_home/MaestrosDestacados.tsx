import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, MapPin, Star } from "lucide-react";

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

function Avatar({ m }: { m: MaestroCard }) {
  if (m.photoUrl) {
    return (
      <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2.5px solid var(--line)" }}>
        <Image src={m.photoUrl} alt={m.name} width={72} height={72} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
      </div>
    );
  }
  return (
    <div style={{
      width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
      background: "var(--navy)", color: "#fff",
      display: "grid", placeItems: "center",
      fontFamily: "var(--font-archivo), sans-serif",
      fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em",
      border: "2.5px solid var(--line)",
    }}>
      {m.initials}
    </div>
  );
}

export default function MaestrosDestacados({ maestros }: { maestros: MaestroCard[] }) {
  if (maestros.length === 0) return null;

  return (
    <section style={{ background: "#fff", padding: "72px 0 64px" }}>
      <div className="wrap">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{
              display: "inline-block", fontFamily: "var(--font-jetbrains), monospace",
              textTransform: "uppercase", fontSize: 11, letterSpacing: "0.15em",
              fontWeight: 700, color: "var(--orange)", marginBottom: 10,
            }}>
              // MAESTROS REALES
            </span>
            <h2 style={{
              fontFamily: "var(--font-archivo), sans-serif",
              fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900,
              color: "var(--navy)", letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0,
            }}>
              Maestros destacados
            </h2>
          </div>
          <Link href="/buscar" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700,
            fontSize: 12.5, color: "var(--orange)", textDecoration: "none",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Ver todos →
          </Link>
        </div>

        {/* Cards grid */}
        <div className="maestros-dest-grid">
          {maestros.map(m => (
            <Link key={m.id} href={`/maestro/${m.id}`} style={{ textDecoration: "none", display: "flex" }}>
              <div className="maestro-dest-card">
                {/* Top: avatar + name + badge */}
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                  <Avatar m={m} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{
                        fontFamily: "var(--font-archivo), sans-serif",
                        fontWeight: 800, fontSize: 16, color: "var(--navy)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {m.name}
                      </span>
                      {m.verified && (
                        <BadgeCheck size={15} color="var(--orange)" strokeWidth={2} style={{ flexShrink: 0 }} />
                      )}
                    </div>
                    {m.specialties.length > 0 && (
                      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>
                        {m.specialties.slice(0, 2).join(" · ")}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={12} color="var(--mute)" strokeWidth={2} />
                      <span style={{ fontSize: 12.5, color: "var(--mute)" }}>{m.city}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {m.description && (
                  <p style={{
                    fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.55, margin: "0 0 14px",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {m.description}
                  </p>
                )}

                {/* Footer: rating */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                  {m.rating > 0 ? (
                    <>
                      <Star size={13} color="var(--orange)" fill="var(--orange)" />
                      <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>
                        {m.rating.toFixed(1)}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--mute)" }}>
                        ({m.jobs} {m.jobs === 1 ? "reseña" : "reseñas"})
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--mute)" }}>Sin reseñas aún</span>
                  )}
                  {m.verified && (
                    <span style={{
                      marginLeft: "auto", background: "var(--navy)", color: "var(--orange)",
                      fontFamily: "var(--font-jetbrains), monospace", fontSize: 9,
                      fontWeight: 700, letterSpacing: "0.1em", padding: "2px 7px",
                      textTransform: "uppercase",
                    }}>
                      VERIFICADO
                    </span>
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
