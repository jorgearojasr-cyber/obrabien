import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "jorge.arojasr@gmail.com"
).toLowerCase().trim();

type ClienteRow = {
  id: string;
  nombre: string;
  ciudad: string | null;
  telefono: string | null;
  created_at: string;
};

export default async function AdminClientes() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const email = (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    ""
  ).toLowerCase().trim();
  if (!email || email !== ADMIN_EMAIL) redirect("/");

  const { data } = await getSupabaseAdmin()
    .from("clientes")
    .select("id, nombre, ciudad, telefono, created_at")
    .order("created_at", { ascending: false });

  const clientes = (data ?? []) as ClienteRow[];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>

        <div style={{ marginBottom: 32 }}>
          <Link href="/admin" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mute)", textDecoration: "none", display: "block", marginBottom: 6 }}>
            ← Admin · ObraBien
          </Link>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(22px, 3vw, 28px)", color: "var(--navy)", margin: "0 0 8px" }}>
            Clientes
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrado{clientes.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div style={{ border: "1px solid var(--line)" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 150px 140px", gap: "0 16px", padding: "10px 16px", background: "var(--bg-2)", borderBottom: "1px solid var(--line)" }}>
            {["Nombre", "Ciudad", "Teléfono", "Registrado"].map(h => (
              <span key={h} style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                {h}
              </span>
            ))}
          </div>

          {clientes.length === 0 ? (
            <div style={{ padding: "24px 16px", fontSize: 14, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
              No hay clientes registrados aún.
            </div>
          ) : (
            clientes.map((c, i) => {
              const fecha = new Date(c.created_at);
              const fechaStr = `${fecha.getDate().toString().padStart(2, "0")}/${(fecha.getMonth() + 1).toString().padStart(2, "0")}/${fecha.getFullYear()}`;
              return (
                <div
                  key={c.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 140px 150px 140px",
                    gap: "0 16px",
                    padding: "13px 16px",
                    alignItems: "center",
                    borderBottom: i < clientes.length - 1 ? "1px solid var(--line)" : undefined,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-archivo), sans-serif" }}>
                    {c.nombre}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                    {c.ciudad ?? <span style={{ color: "var(--mute)", fontStyle: "italic" }}>—</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)", fontFamily: "var(--font-jetbrains), monospace" }}>
                    {c.telefono || <span style={{ color: "var(--mute)", fontStyle: "italic" }}>—</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                    {fechaStr}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
