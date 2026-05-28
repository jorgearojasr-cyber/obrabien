import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SignOutBtn from "@/components/SignOutBtn";
import { supabase } from "@/lib/supabase";

export default async function MaestroDashboard() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const firstName = user.firstName || "Maestro";
  const role = user.publicMetadata?.role as string | undefined;
  if (role && role !== "maestro") redirect("/dashboard/cliente");

  const profile = user.publicMetadata?.profile as Record<string, unknown> | null | undefined;
  console.log("[maestro-dashboard] publicMetadata:", JSON.stringify(user.publicMetadata));
  console.log("[maestro-dashboard] profile:", JSON.stringify(profile));
  console.log("[maestro-dashboard] checks — nombre:", !!profile?.nombre, "rut:", !!profile?.rut, "telefono:", !!profile?.telefono, "especialidades:", profile?.especialidades);
  if (!profile || !profile.nombre || !profile.rut || !profile.telefono ||
      !Array.isArray(profile.especialidades) || (profile.especialidades as unknown[]).length === 0) {
    console.log("[maestro-dashboard] → redirecting to completar-perfil");
    redirect("/dashboard/maestro/completar-perfil");
  }

  // Fetch Supabase UUID for public profile link
  const { data: maestroRow } = await supabase
    .from("maestros")
    .select("id")
    .eq("clerk_user_id", user.id)
    .single();
  const publicProfileUrl = maestroRow?.id ? `/maestro/${maestroRow.id}` : null;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {user.imageUrl ? (
              <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--navy)", flexShrink: 0 }}>
                <Image src={user.imageUrl} alt="Avatar" width={56} height={56} />
              </div>
            ) : (
              <div style={{ width: 56, height: 56, background: "var(--navy)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
                {firstName[0].toUpperCase()}
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Panel de maestro
              </p>
              <h1 style={{ margin: "4px 0 0", fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, color: "var(--navy)", lineHeight: 1.1 }}>
                Hola, {firstName} 👋
              </h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ background: "var(--ink)", color: "var(--orange)", padding: "4px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
              MAESTRO
            </span>
            {publicProfileUrl && (
              <Link href={publicProfileUrl} target="_blank" style={{ background: "var(--navy)", color: "#fff", padding: "7px 14px", fontSize: 12.5, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                Ver mi perfil →
              </Link>
            )}
            <SignOutBtn />
          </div>
        </div>

        {/* Profile complete banner */}
        <div style={{ background: "var(--navy)", padding: "20px 24px", marginBottom: 36, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ background: "#22c55e", color: "#fff", fontSize: 9, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.08em", padding: "2px 7px" }}>
                ACTIVO
              </span>
              <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 15.5, color: "#fff" }}>
                Tu perfil está publicado
              </span>
            </div>
            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.68)" }}>
              Agrega fotos de trabajos y más especialidades para recibir más contactos.
            </div>
          </div>
          <Link href="/dashboard/maestro/completar-perfil" style={{ background: "var(--orange)", color: "#fff", padding: "10px 20px", fontWeight: 700, fontSize: 13.5, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
            Editar perfil →
          </Link>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          {[
            { n: "—", label: "Visitas al perfil", sub: "Últimos 30 días", accent: "var(--navy)" },
            { n: "—", label: "Contactos recibidos", sub: "Este mes", accent: "var(--orange)" },
            { n: "—", label: "Calificación promedio", sub: "Sin reseñas aún", accent: "var(--navy)" },
          ].map(({ n, label, sub, accent }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 18px" }}>
              <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 38, fontWeight: 900, color: accent, lineHeight: 1, marginBottom: 8 }}>{n}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--ink)", margin: "0 0 14px" }}>
          Acciones rápidas
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12, marginBottom: 36 }}>
          {[
            { icon: "📋", title: "Editar perfil", desc: "Actualiza especialidades, zona y fotos de trabajos.", href: "/dashboard/maestro/completar-perfil", top: undefined },
            { icon: "🛒", title: "Publicar en marketplace", desc: "Vende herramientas o servicios al rubro.", href: "/marketplace/publicar", top: undefined },
            { icon: "💬", title: "Ir a la comunidad", desc: "Responde preguntas y gana reputación.", href: "/comunidad", top: undefined },
            { icon: "🏪", title: "Ver marketplace", desc: "Compra y arrienda equipos del rubro.", href: "/marketplace", top: undefined },
          ].map(({ icon, title, desc, href, top }) => (
            <Link key={title} href={href} className="card hoverable" style={{ textDecoration: "none", display: "block", padding: "18px 20px", borderTop: top ? `3px solid ${top}` : undefined }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
              <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 13, color: "var(--mute)", lineHeight: 1.5 }}>{desc}</div>
            </Link>
          ))}
        </div>

        {/* Tip */}
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55 }}>
            Los perfiles con foto, especialidades y al menos 3 reseñas reciben{" "}
            <strong style={{ color: "var(--navy)" }}>4× más contactos</strong> que los incompletos.
          </p>
        </div>
      </div>
    </div>
  );
}
