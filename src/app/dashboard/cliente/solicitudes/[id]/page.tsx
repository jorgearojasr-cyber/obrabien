import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SolicitudDetalleCliente from "@/components/solicitudes/SolicitudDetalleCliente";

// Sprint 22 (JOB-044). Server Component: solo exige sesión (mismo patrón que
// dashboard/cliente/page.tsx y dashboard/maestro/solicitudes/[id]/page.tsx,
// Sprint 20). La carga real de datos vive en SolicitudDetalleCliente, un
// client component que consume exclusivamente GET /api/solicitudes/[id].
export default async function SolicitudDetalleClientePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64, maxWidth: 720 }}>
        <SolicitudDetalleCliente id={id} />
      </div>
    </div>
  );
}
