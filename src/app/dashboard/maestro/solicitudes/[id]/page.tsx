import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SolicitudDetalle from "@/components/solicitudes/SolicitudDetalle";

// Sprint 20 (JOB-034). Server Component: solo exige sesión (mismo patrón que
// dashboard/maestro/page.tsx). La carga real de datos —y el marcado
// automático de "vista" al abrir (JOB-036)— vive en SolicitudDetalle, un
// client component que consume exclusivamente GET /api/solicitudes/[id].
export default async function SolicitudDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64, maxWidth: 720 }}>
        <SolicitudDetalle id={id} />
      </div>
    </div>
  );
}
