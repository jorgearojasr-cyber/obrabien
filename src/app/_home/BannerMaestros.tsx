import Link from "next/link";
import { UserPlus, PhoneCall, ImageIcon, Star } from "lucide-react";

const STEPS = [
  { Icon: UserPlus,   label: "Crea tu perfil gratis" },
  { Icon: PhoneCall,  label: "Recibe contactos" },
  { Icon: ImageIcon,  label: "Muestra tus trabajos" },
  { Icon: Star,       label: "Obtén reseñas" },
];

export default function BannerMaestros() {
  return (
    <section style={{ background: "var(--navy)", padding: "48px 0" }}>
      <div className="wrap">
        <div className="banner-maestros-inner">
          {/* Left: text + CTA */}
          <div className="banner-maestros-text">
            <span style={{
              display: "inline-block",
              fontFamily: "var(--font-jetbrains), monospace",
              textTransform: "uppercase", fontSize: 10.5, letterSpacing: "0.15em",
              fontWeight: 700, color: "var(--orange)", marginBottom: 12,
            }}>
              // PARA MAESTROS
            </span>
            <h2 style={{
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 900, fontSize: "clamp(22px, 3vw, 36px)",
              color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.1,
              margin: "0 0 12px",
            }}>
              ¿Eres maestro? Consigue más clientes<br className="desktop-only" /> y haz crecer tu negocio.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", margin: "0 0 28px", lineHeight: 1.6 }}>
              Sin comisiones, sin intermediarios. Solo tú y tus clientes.
            </p>
            <Link href="/registro?tab=maestro" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "var(--orange)", color: "#fff",
              fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800,
              fontSize: 15, padding: "14px 32px", borderRadius: 8,
              textDecoration: "none", letterSpacing: "-0.01em",
            }}>
              Quiero registrarme →
            </Link>
          </div>

          {/* Right: 4 steps */}
          <div className="banner-maestros-steps">
            {STEPS.map(({ Icon, label }, i) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)",
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>
                  <Icon size={22} color="var(--orange)" strokeWidth={1.8} />
                </div>
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)", fontWeight: 500, lineHeight: 1.3 }}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="banner-step-arrow" style={{ color: "rgba(255,255,255,0.25)", fontSize: 18, marginTop: -4 }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
