import Link from "next/link";

export default function MaestroNotFound() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "40px 24px", maxWidth: 480 }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          // 404
        </div>
        <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(26px, 4vw, 38px)", color: "var(--navy)", margin: "0 0 12px" }}>
          Maestro no encontrado
        </h1>
        <p style={{ fontSize: 15, color: "var(--mute)", lineHeight: 1.6, margin: "0 0 28px" }}>
          Este perfil no existe o fue eliminado.
        </p>
        <Link
          href="/buscar"
          style={{ background: "var(--navy)", color: "#fff", padding: "11px 24px", fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-block" }}
        >
          Volver a buscar
        </Link>
      </div>
    </div>
  );
}
