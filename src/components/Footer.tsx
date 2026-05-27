import Link from "next/link";
import { LogoMark } from "./LogoMark";

const SPECIALTIES_FOOTER = ["Albañil", "Gasfiter", "Electricista", "Carpintero", "Pintor"];

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 80, background: "var(--navy)", color: "#F6F4EF" }}>
      <div className="tape" />
      <div className="wrap" style={{ padding: "48px 24px 32px" }}>
        <div className="row between wrap-flex gap-24" style={{ alignItems: "flex-start" }}>
          <div className="col gap-12" style={{ maxWidth: 360 }}>
            <div className="brand">
              <span style={{ width: 40, height: 40, display: "grid", placeItems: "center" }}>
                <LogoMark size={40} navy="#FFFFFF" orange="#E86C1C" />
              </span>
              <span className="wordmark">
                <span className="word" style={{ color: "#fff" }}>
                  OBRA<span style={{ color: "var(--orange)" }}>BIEN</span>
                </span>
                <span className="tag" style={{ color: "#9AA7B5" }}>Conectamos clientes con buenos maestros</span>
              </span>
            </div>
            <p style={{ color: "#9AA7B5", margin: 0, fontSize: 14 }}>
              OBRABIEN es la plataforma chilena que conecta a clientes con maestros confiables de la construcción. Busca por especialidad y ciudad, sin intermediarios.
            </p>
          </div>

          <div className="col gap-8">
            <span className="label" style={{ color: "#9AA7B5" }}>Plataforma</span>
            {[
              { href: "/buscar", label: "Buscar maestros" },
              { href: "/registro", label: "Registrarse como maestro" },
              { href: "/como-funciona", label: "Cómo funciona" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontSize: 14, color: "#F6F4EF" }}>{label}</Link>
            ))}
          </div>

          <div className="col gap-8">
            <span className="label" style={{ color: "#9AA7B5" }}>Especialidades</span>
            {SPECIALTIES_FOOTER.map(s => (
              <Link key={s} href={`/buscar?esp=${encodeURIComponent(s)}`} style={{ fontSize: 14, color: "#F6F4EF" }}>{s}</Link>
            ))}
          </div>

          <div className="col gap-8">
            <span className="label" style={{ color: "#9AA7B5" }}>Contacto</span>
            <span style={{ fontSize: 14, color: "#9AA7B5" }}>contacto@obrabien.cl</span>
            <span style={{ fontSize: 14, color: "#9AA7B5" }}>Talca, Chile</span>
          </div>
        </div>

        <div className="mono" style={{ marginTop: 40, fontSize: 11, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          © 2026 · OBRABIEN · Hecho en Chile 🇨🇱
        </div>
      </div>
    </footer>
  );
}
