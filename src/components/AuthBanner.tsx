import Link from "next/link";

export default function AuthBanner({ message }: { message: string }) {
  return (
    <div style={{
      padding: "16px 18px", border: "1px solid var(--line)",
      background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, flexWrap: "wrap",
    }}>
      <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>{message}</span>
      <div style={{ display: "flex", gap: 8 }}>
        <Link href="/login" style={{
          padding: "8px 16px", background: "var(--orange)", color: "#fff",
          fontWeight: 700, fontSize: 13.5, textDecoration: "none",
        }}>
          Iniciar sesión
        </Link>
        <Link href="/registro" style={{
          padding: "8px 14px", border: "1.5px solid var(--orange)", color: "var(--orange)",
          fontWeight: 700, fontSize: 13.5, textDecoration: "none",
        }}>
          Registrarse
        </Link>
      </div>
    </div>
  );
}
