import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ActivarBtn } from "./ActivarBtn";
import { ConsultasAdmin, type ConsultaAdmin } from "./ConsultasAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "jorge.arojasr@gmail.com"
).toLowerCase().trim();

interface PendingItem {
  id:             string;
  titulo:         string;
  tipo:           string;
  categoria:      string | null;
  precio:         number | null;
  precio_unit:    string | null;
  contact_name:   string | null;
  whatsapp:       string | null;
  region:         string | null;
  created_at:     string;
  payment_status: string;
}

export default async function AdminMarketplacePage() {
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
    { data: items, error },
    { data: consultasRaw },
  ] = await Promise.all([
    supabase
      .from("marketplace_items")
      .select("id, titulo, tipo, categoria, precio, precio_unit, contact_name, whatsapp, region, created_at, payment_status")
      .eq("payment_status", "revision")
      .order("created_at", { ascending: false }),
    supabase
      .from("marketplace_consultas")
      .select("id, item_id, nombre, pregunta, created_at")
      .is("respuesta", null)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (error) {
    return <div style={{ padding: 40, color: "#dc2626" }}>Error cargando datos: {error.message}</div>;
  }

  const pending = (items ?? []) as PendingItem[];

  // Enrich consultas with item titles
  const itemIds = [...new Set((consultasRaw ?? []).map(c => c.item_id as string))];
  let titleMap: Record<string, string> = {};
  if (itemIds.length > 0) {
    const { data: titles } = await supabase
      .from("marketplace_items")
      .select("id, titulo")
      .in("id", itemIds);
    titleMap = (titles ?? []).reduce<Record<string, string>>((acc, i) => {
      acc[i.id as string] = i.titulo as string;
      return acc;
    }, {});
  }
  const consultas: ConsultaAdmin[] = (consultasRaw ?? []).map(c => ({
    id:          c.id as string,
    item_id:     c.item_id as string,
    item_titulo: titleMap[c.item_id as string] ?? "—",
    nombre:      c.nombre as string,
    pregunta:    c.pregunta as string,
    created_at:  c.created_at as string,
  }));

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>

        <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <Link href="/admin" style={{ fontSize: 12.5, color: "var(--mute)", textDecoration: "none", fontFamily: "JetBrains Mono, monospace" }}>
              ← Admin
            </Link>
            <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(20px, 3vw, 26px)", color: "var(--navy)", margin: "8px 0 6px" }}>
              Marketplace pendiente de revisión
            </h1>
            <p style={{ fontSize: 13, color: "var(--mute)", margin: 0 }}>
              Revisa cada publicación y apruébala o recházala. El vendedor recibirá una notificación.
            </p>
          </div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 13, color: "var(--mute)", paddingTop: 28 }}>
            {pending.length} en revisión
          </div>
        </div>

        {pending.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "48px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <p style={{ fontSize: 15, color: "var(--mute)", margin: 0 }}>No hay publicaciones pendientes de revisión.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pending.map(item => {
              const date = new Date(item.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
              const precioStr = item.precio
                ? `$${Number(item.precio).toLocaleString("es-CL")}${item.precio_unit && item.precio_unit !== "unidad" ? ` / ${item.precio_unit}` : ""}`
                : "A convenir";
              return (
                <div key={item.id} style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 24px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ background: "var(--bg-2)", color: "var(--mute)", fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", padding: "2px 8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {item.tipo}
                      </span>
                      {item.categoria && (
                        <span style={{ background: "var(--bg-2)", color: "var(--mute)", fontSize: 10, fontWeight: 600, fontFamily: "JetBrains Mono, monospace", padding: "2px 8px" }}>
                          {item.categoria}
                        </span>
                      )}
                      <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 15, color: "var(--orange)" }}>
                        {precioStr}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 15, color: "var(--ink)", margin: "0 0 6px", lineHeight: 1.3 }}>
                      {item.titulo}
                    </h3>
                    <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: "var(--mute)", flexWrap: "wrap" }}>
                      {item.contact_name && <span>👤 {item.contact_name}</span>}
                      {item.whatsapp     && <span>📱 {item.whatsapp}</span>}
                      {item.region       && <span>📍 {item.region}</span>}
                      <span>🕐 {date}</span>
                    </div>
                    <div style={{ marginTop: 6, fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "var(--mute-2)" }}>
                      ID: {item.id}
                    </div>
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <ActivarBtn listingId={item.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Consultas section ── */}
        <div style={{ marginTop: 52 }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 20, color: "var(--navy)", margin: "0 0 6px" }}>
              Preguntas sin respuesta
            </h2>
            <p style={{ fontSize: 13, color: "var(--mute)", margin: 0 }}>
              {consultas.length} pregunta{consultas.length !== 1 ? "s" : ""} esperando respuesta.
            </p>
          </div>
          <ConsultasAdmin consultas={consultas} />
        </div>

      </div>
    </div>
  );
}
