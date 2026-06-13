import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import StatsCharts from "./StatsCharts";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "jorge.arojasr@gmail.com"
).toLowerCase().trim();

export default async function EstadisticasPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const email = (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    ""
  ).toLowerCase().trim();
  if (!email || email !== ADMIN_EMAIL) redirect("/");

  const supabase = getSupabaseAdmin();

  const [
    { count: totalMaestros },
    { count: totalClientes },
    { count: totalResenas },
    { count: maestrosVerificados },
    { data: maestrosDates },
    { data: clientesDates },
    { data: resenasDates },
    { count: verifSinEnviar },
    { count: verifPendiente },
    { count: verifAprobado },
    { count: verifRechazado },
  ] = await Promise.all([
    supabase.from("maestros").select("*", { count: "exact", head: true }),
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase.from("resenas").select("*", { count: "exact", head: true }),
    supabase.from("maestros").select("*", { count: "exact", head: true }).eq("verificado", true),
    supabase.from("maestros").select("created_at").order("created_at", { ascending: true }),
    supabase.from("clientes").select("created_at").order("created_at", { ascending: true }),
    supabase.from("resenas").select("created_at").order("created_at", { ascending: true }),
    supabase.from("maestros").select("*", { count: "exact", head: true }).or("verificacion_estado.eq.sin_enviar,verificacion_estado.is.null"),
    supabase.from("maestros").select("*", { count: "exact", head: true }).eq("verificacion_estado", "pendiente"),
    supabase.from("maestros").select("*", { count: "exact", head: true }).eq("verificacion_estado", "aprobado"),
    supabase.from("maestros").select("*", { count: "exact", head: true }).eq("verificacion_estado", "rechazado"),
  ]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>

        <div style={{ marginBottom: 32 }}>
          <Link href="/admin" style={{
            fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mute)",
            textDecoration: "none", display: "block", marginBottom: 6,
          }}>
            ← Admin · ObraBien
          </Link>
          <h1 style={{
            fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900,
            fontSize: "clamp(22px, 3vw, 28px)", color: "var(--navy)", margin: "0 0 8px",
          }}>
            Estadísticas
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>
            Métricas y crecimiento de la plataforma
          </p>
        </div>

        <StatsCharts
          summary={{
            totalMaestros:       totalMaestros       ?? 0,
            totalClientes:       totalClientes       ?? 0,
            totalResenas:        totalResenas        ?? 0,
            maestrosVerificados: maestrosVerificados ?? 0,
          }}
          maestrosDates={(maestrosDates ?? []).map(r => r.created_at as string)}
          clientesDates={(clientesDates ?? []).map(r => r.created_at as string)}
          resenasDates={(resenasDates   ?? []).map(r => r.created_at as string)}
          verifStats={{
            sinEnviar: verifSinEnviar ?? 0,
            pendiente: verifPendiente ?? 0,
            aprobado:  verifAprobado  ?? 0,
            rechazado: verifRechazado ?? 0,
          }}
        />

      </div>
    </div>
  );
}
