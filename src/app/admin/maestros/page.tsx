import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import MaestrosList from "./MaestrosList";

export const dynamic = "force-dynamic";

export type MaestroAdminRow = {
  id: string;
  nombre: string;
  rut: string | null;
  especialidades: string[] | null;
  ciudades: string[] | null;
  verificado: boolean | null;
  verificacion_estado: string | null;
  disponibilidad: string | null;
  activo: boolean | null;
  clerk_user_id: string | null;
  created_at: string;
  email: string;
  como_llego: string | null;
  como_llego_otro: string | null;
  referido_rut: string | null;
};

export default async function AdminMaestros({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const initialFilter = estado ?? "todos";
  const user = await currentUser();
  if (!user) redirect("/login");

  const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "jorge.arojasr@gmail.com").toLowerCase().trim();
  const email = (user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "").toLowerCase().trim();
  if (!email || email !== adminEmail) redirect("/");

  const { data, error: fetchError } = await getSupabaseAdmin()
    .from("maestros")
    .select("*")
    .order("created_at", { ascending: false });

  if (fetchError) console.error("[admin/maestros] fetch error:", fetchError.message);

  const rows: MaestroAdminRow[] = (data ?? []).map(m => ({ ...m, email: "" }));

  const clerkIds = rows.map(m => m.clerk_user_id).filter(Boolean) as string[];
  if (clerkIds.length > 0) {
    try {
      const clerk = await clerkClient();
      const clerkUsers = await clerk.users.getUserList({ userId: clerkIds, limit: 500 });
      const emailMap = new Map(
        clerkUsers.data.map(u => [u.id, u.emailAddresses[0]?.emailAddress ?? ""])
      );
      rows.forEach(m => {
        if (m.clerk_user_id) m.email = emailMap.get(m.clerk_user_id) ?? "";
      });
    } catch {
      // emails are optional; silently continue
    }
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>

        <div style={{ marginBottom: 32 }}>
          <a href="/admin" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mute)", textDecoration: "none", display: "block", marginBottom: 6 }}>
            ← Admin · ObraBien
          </a>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(22px, 3vw, 28px)", color: "var(--navy)", margin: "0 0 8px" }}>
            Maestros
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>
            {rows.length} maestro{rows.length !== 1 ? "s" : ""} registrado{rows.length !== 1 ? "s" : ""}
          </p>
        </div>

        <MaestrosList maestros={rows} initialFilter={initialFilter} />

      </div>
    </div>
  );
}
