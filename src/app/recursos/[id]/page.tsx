import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import RecursoBody from "./_body";
import TrackDownloadLink from "./_download-link";

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function fileIcon(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  if (["xlsx", "xls"].includes(ext)) return "📊";
  if (["docx", "doc"].includes(ext)) return "📝";
  if (["pptx", "ppt"].includes(ext)) return "📑";
  return "📄";
}

function fileButtonLabel(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  if (["xlsx", "xls", "docx", "doc", "pptx", "ppt"].includes(ext)) return "Descargar →";
  return "Ver archivo →";
}

function fileTypeLabel(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  if (["xlsx", "xls"].includes(ext)) return "Planilla Excel disponible para descargar";
  if (["docx", "doc"].includes(ext)) return "Documento Word disponible para descargar";
  if (["pptx", "ppt"].includes(ext)) return "Presentación PowerPoint disponible para descargar";
  return "PDF disponible para ver";
}

const TIPO_CFG: Record<string, { label: string; color: string; bg: string }> = {
  "video":    { label: "VIDEO",    color: "#DC2626", bg: "#FEF2F2" },
  "pdf":      { label: "PDF",      color: "#14375F", bg: "rgba(20,55,95,0.1)" },
  "guía":     { label: "GUÍA",     color: "#15803d", bg: "rgba(34,197,94,0.1)" },
  "artículo": { label: "ARTÍCULO", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
};

const CATS: Record<string, { emoji: string; label: string }> = {
  normativas: { emoji: "📐", label: "Normativas y Permisos" },
  oficios:    { emoji: "🔨", label: "Oficios y Construcción" },
  finanzas:   { emoji: "💰", label: "Finanzas y Presupuestos" },
  contratos:  { emoji: "📄", label: "Contratos y Documentos" },
  negocios:   { emoji: "🚀", label: "Negocios y Emprendimiento" },
  materiales: { emoji: "🏗️", label: "Materiales de Construcción" },
  seguridad:  { emoji: "⚠️", label: "Seguridad y Prevención de Riesgos" },
  guias:      { emoji: "📚", label: "Guías y Manuales" },
};

// ── Metadata ───────────────────────────────────────────────────────────────────

async function getRecursoForMetadata(id: string) {
  const { data } = await getSupabaseAdmin()
    .from("recursos")
    .select("titulo, descripcion, imagen_url, created_at")
    .eq("id", id)
    .or("estado.is.null,estado.neq.borrador")
    .maybeSingle();
  return data as { titulo: string | null; descripcion: string | null; imagen_url: string | null; created_at: string | null } | null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const recurso = await getRecursoForMetadata(id);
  if (!recurso) return { title: "Recurso no encontrado | ObraBien" };

  const titulo = recurso.titulo || "Recurso";
  const title  = `${titulo} | Recursos ObraBien`;
  const description = (
    recurso.descripcion?.trim() || `Guía práctica para maestros y clientes de la construcción en Chile: ${titulo}.`
  ).slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      // og/route.tsx genera hoy una imagen genérica de marca (no personalizada
      // — no lee ningún query param). Igual mejora sobre no tener ninguna
      // imagen OG; personalizarla es trabajo aparte.
      images: [{ url: "/og", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og"],
    },
  };
}

// Evita que texto de usuario (título, descripción) rompa el <script> del
// JSON-LD si llegara a contener el substring "</script>".
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export default async function RecursoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Use or() so resources with estado=null are also accessible (neq alone excludes nulls in PostgREST)
  const { data: recurso, error } = await getSupabaseAdmin()
    .from("recursos")
    .select("*")
    .eq("id", id)
    .or("estado.is.null,estado.neq.borrador")
    .maybeSingle();

  if (error || !recurso) notFound();

  const youtubeId = recurso.video_url ? getYouTubeId(recurso.video_url as string) : null;
  const tipo = (recurso.tipo as string)?.toLowerCase() ?? "";
  const cfg = TIPO_CFG[tipo] ?? { label: (recurso.tipo as string)?.toUpperCase() ?? "", color: "var(--mute)", bg: "var(--bg-2)" };
  const catCfg = CATS[recurso.categoria as string];
  const catIcon = catCfg?.emoji ?? "📄";
  const catLabel = catCfg?.label ?? (recurso.categoria as string);
  const imagenes = (recurso.imagenes_extra as string[] | null) ?? [];
  const contenido = (recurso.contenido as string | null) ?? null;
  const pdfsArr = (recurso.pdfs as { label: string; url: string }[] | null) ?? [];
  const pdfItems: { label: string; url: string }[] =
    pdfsArr.length > 0
      ? pdfsArr
      : recurso.pdf_url
        ? [{ label: recurso.titulo as string, url: recurso.pdf_url as string }]
        : [];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: recurso.titulo as string,
    ...(recurso.descripcion ? { description: recurso.descripcion as string } : {}),
    ...(recurso.created_at ? { datePublished: recurso.created_at as string } : {}),
    ...(recurso.imagen_url ? { image: recurso.imagen_url as string } : {}),
    author: { "@type": "Organization", name: "ObraBien" },
    publisher: { "@type": "Organization", name: "ObraBien" },
    mainEntityOfPage: `https://www.obrabien.cl/recursos/${id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />
      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "32px 0 28px" }}>
        <div className="wrap">
          <Link href="/recursos" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "#9AA7B5", fontSize: 13,
            fontFamily: "var(--font-jetbrains),monospace",
            textDecoration: "none", marginBottom: 16,
          }}>
            ← Volver a Recursos
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 9.5, fontFamily: "var(--font-jetbrains),monospace", fontWeight: 700,
              letterSpacing: "0.1em", color: cfg.color, background: cfg.bg, padding: "2px 8px",
            }}>
              {cfg.label}
            </span>
            <span style={{
              fontSize: 9.5, fontFamily: "var(--font-jetbrains),monospace", fontWeight: 700,
              letterSpacing: "0.08em", color: "#9AA7B5", padding: "2px 8px",
            }}>
              {catIcon} {catLabel}
            </span>
          </div>

          <h1 style={{
            fontFamily: "var(--font-archivo),sans-serif", fontWeight: 800,
            fontSize: "clamp(22px,3vw,36px)", color: "#fff", margin: "0 0 10px", lineHeight: 1.2,
          }}>
            {recurso.titulo as string}
          </h1>

          {recurso.descripcion && (
            <p style={{ color: "#9AA7B5", fontSize: 15, margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
              {recurso.descripcion as string}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div style={{ maxWidth: 760 }}>

          {/* YouTube embed */}
          {youtubeId && (
            <div style={{
              position: "relative", paddingBottom: "56.25%", height: 0,
              overflow: "hidden", marginBottom: 28,
            }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Non-YouTube video link */}
          {recurso.video_url && !youtubeId && (
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "16px 20px", marginBottom: 24 }}>
              <a href={recurso.video_url as string} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--navy)", color: "#fff", padding: "10px 20px",
                fontSize: 14, fontWeight: 700, textDecoration: "none",
                fontFamily: "var(--font-archivo),sans-serif",
              }}>
                Ver video →
              </a>
            </div>
          )}

          {/* Archivos adjuntos */}
          {pdfItems.map((pdf, i) => (
            <div key={i} style={{
              background: "#fff", border: "1px solid var(--line)", padding: "16px 20px",
              marginBottom: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 28 }}>{fileIcon(pdf.url)}</span>
              <div style={{ flex: 1, minWidth: 120 }}>
                <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                  {pdf.label || (recurso.titulo as string)}
                </p>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--mute)" }}>{fileTypeLabel(pdf.url)}</p>
              </div>
              <TrackDownloadLink
                href={pdf.url}
                resourceId={id}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
                  background: "var(--orange)", color: "#fff", padding: "9px 18px",
                  fontSize: 13.5, fontWeight: 700, textDecoration: "none",
                  fontFamily: "var(--font-archivo),sans-serif",
                }}
              >
                {fileButtonLabel(pdf.url)}
              </TrackDownloadLink>
            </div>
          ))}

          {/* Cover image — only when no video */}
          {recurso.imagen_url && !youtubeId && !recurso.video_url && (
            <div style={{ marginBottom: 28, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={recurso.imagen_url as string}
                alt={recurso.titulo as string}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          )}

          {/* Interactive: images (with lightbox) + collapsible content */}
          <RecursoBody contenido={contenido} imagenes={imagenes} />

          {/* Footer back link */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
            <Link href="/recursos" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              color: "var(--navy)", fontFamily: "var(--font-jetbrains),monospace",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              ← Volver a Recursos
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
