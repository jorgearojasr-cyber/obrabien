import { currentUser } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/authz";
import { redirect } from "next/navigation";
import { adminDocumentLink } from "@/lib/admin-documents";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import VerifList from "./VerifList";

export const dynamic = "force-dynamic";

export default async function VerificacionesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ maestroId?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");

  if (!isAdminUser(user)) redirect("/");

  const { maestroId } = await searchParams;

  // Hotfix 19A.1: las referencias a Cloudinary no viajan al navegador; cada documento se abre por /api/admin/documento (enlace firmado de 2 minutos).
  type Fila = { id: string; cedula_frente: string | null; cedula_reverso: string | null; selfie_cedula: string | null };
  const conEnlaces = <T extends Fila>(m: T): T => ({
    ...m,
    cedula_frente:  m.cedula_frente  ? adminDocumentLink(m.id, "frente")  : null,
    cedula_reverso: m.cedula_reverso ? adminDocumentLink(m.id, "reverso") : null,
    selfie_cedula:  m.selfie_cedula  ? adminDocumentLink(m.id, "selfie")  : null,
  });

  let maestros;
  let isSingle = false;

  if (maestroId) {
    isSingle = true;
    const { data } = await getSupabaseAdmin()
      .from("maestros")
      .select("id, nombre, rut, cedula_frente, cedula_reverso, selfie_cedula, created_at, verificacion_estado")
      .eq("id", maestroId)
      .single();
    maestros = data ? [conEnlaces(data)] : [];
  } else {
    const { data } = await getSupabaseAdmin()
      .from("maestros")
      .select("id, nombre, rut, cedula_frente, cedula_reverso, selfie_cedula, created_at, verificacion_estado")
      .eq("verificacion_estado", "pendiente")
      .order("created_at", { ascending: true });
    maestros = (data ?? []).map(conEnlaces);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>

        <div style={{ marginBottom: 32 }}>
          {isSingle && (
            <Link
              href="/admin/verificaciones"
              style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--mute)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}
            >
              ← Todas las verificaciones
            </Link>
          )}
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mute)", display: "block", marginBottom: 6 }}>
            // Admin · ObraBien
          </span>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(22px, 3vw, 28px)", color: "var(--navy)", margin: "0 0 8px" }}>
            {isSingle ? "Revisar maestro" : "Verificaciones pendientes"}
          </h1>
          {!isSingle && (
            <p style={{ fontSize: 13.5, color: "var(--mute)", margin: 0 }}>
              {maestros.length} maestro{maestros.length !== 1 ? "s" : ""} esperando revisión de identidad
            </p>
          )}
        </div>

        <VerifList maestros={maestros} isSingle={isSingle} />

      </div>
    </div>
  );
}
