import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function ClienteDashboard() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const firstName = user.firstName || "Cliente";
  const role = user.publicMetadata?.role as string | undefined;
  if (role && role !== "cliente") redirect("/dashboard/maestro");

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 40, paddingBottom: 24, borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {user.imageUrl ? (
              <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--orange)", flexShrink: 0 }}>
                <Image src={user.imageUrl} alt="Avatar" width={56} height={56} />
              </div>
            ) : (
              <div style={{ width: 56, height: 56, background: "var(--orange)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
                {firstName[0].toUpperCase()}
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Panel de cliente
              </p>
              <h1 style={{ margin: "4px 0 0", fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, color: "var(--navy)", lineHeight: 1.1 }}>
                Hola, {firstName} 👋
              </h1>
            </div>
          </div>
          <Link href="/buscar" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Buscar maestros
          </Link>
        </div>

        {/* Quick actions */}
        <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--ink)", margin: "0 0 14px" }}>
          ¿Qué necesitas hacer?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12, marginBottom: 40 }}>
          {[
            { icon: "🔍", title: "Buscar maestros", desc: "Encuentra especialistas por ciudad y oficio.", href: "/buscar", top: "var(--orange)" },
            { icon: "⭐", title: "Mis favoritos", desc: "Maestros que guardaste para contactar.", href: "/favoritos", top: undefined },
            { icon: "🏪", title: "Marketplace", desc: "Compra, vende y arrienda en el rubro.", href: "/marketplace", top: undefined },
            { icon: "💬", title: "Comunidad", desc: "Pregunta dudas y lee experiencias reales.", href: "/comunidad", top: undefined },
          ].map(({ icon, title, desc, href, top }) => (
            <Link key={title} href={href} className="card hoverable" style={{ textDecoration: "none", display: "block", padding: "18px 20px", borderTop: top ? `3px solid ${top}` : undefined }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
              <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 13, color: "var(--mute)", lineHeight: 1.5 }}>{desc}</div>
            </Link>
          ))}
        </div>

        {/* How it works mini */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "24px 24px 20px" }}>
          <h3 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--navy)", margin: "0 0 18px" }}>
            Cómo encontrar tu maestro ideal
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
            {[
              { n: "01", label: "Busca por especialidad y ciudad" },
              { n: "02", label: "Revisa reseñas y fotos de trabajos" },
              { n: "03", label: "Contacta directo por WhatsApp" },
              { n: "04", label: "Deja tu reseña después del trabajo" },
            ].map(({ n, label }) => (
              <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: 24, color: "var(--orange)", lineHeight: 1, flexShrink: 0 }}>{n}</span>
                <span style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{label}</span>
              </div>
            ))}
          </div>
          <Link href="/buscar" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Buscar maestros →
          </Link>
        </div>
      </div>
    </div>
  );
}
