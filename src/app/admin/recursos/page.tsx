"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PdfItem = { label: string; url: string };

type Recurso = {
  id: string;
  titulo: string;
  descripcion: string | null;
  contenido: string | null;
  tipo: string;
  categoria: string;
  url: string | null;
  video_url: string | null;
  pdf_url: string | null;
  pdfs: PdfItem[] | null;
  imagenes_extra: string[] | null;
  imagen_url: string | null;
  para_quien: string;
  destacado: boolean;
  estado: string;
  created_at: string;
};

const TIPOS = ["video", "pdf", "artículo", "guía"];
const CATEGORIAS = [
  { value: "normativas", label: "📐 Normativas y Permisos" },
  { value: "oficios",    label: "🔨 Oficios y Construcción" },
  { value: "finanzas",   label: "💰 Finanzas y Presupuestos" },
  { value: "contratos",  label: "📄 Contratos y Documentos" },
  { value: "negocios",   label: "🚀 Negocios y Emprendimiento" },
  { value: "materiales", label: "🏗️ Materiales de Construcción" },
  { value: "seguridad",  label: "⚠️ Seguridad y Prevención de Riesgos" },
  { value: "guias",      label: "📚 Guías y Manuales" },
];
const ESTADOS    = [
  { value: "proximamente", label: "Próximamente" },
  { value: "publicado",    label: "Publicado" },
  { value: "borrador",     label: "Borrador" },
];

const ESTADO_STYLE: Record<string, React.CSSProperties> = {
  publicado:    { color: "#15803d", background: "rgba(34,197,94,0.12)", padding: "2px 8px", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-jetbrains),monospace" },
  proximamente: { color: "#92400e", background: "rgba(245,158,11,0.12)", padding: "2px 8px", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-jetbrains),monospace" },
  borrador:     { color: "var(--mute)", background: "var(--bg-2)", padding: "2px 8px", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-jetbrains),monospace" },
};

const SL: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-jetbrains),monospace",
  fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.1em", color: "var(--mute)", marginBottom: 6,
};
const SI: React.CSSProperties = {
  width: "100%", height: 44, border: "1.5px solid var(--line)",
  padding: "0 12px", fontSize: 13.5, color: "var(--ink)",
  background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};

type FormState = {
  titulo: string; descripcion: string; contenido: string;
  tipo: string; categoria: string; para_quien: string; estado: string;
  url: string; video_url: string; pdf_url: string;
  pdfs: PdfItem[];
  imagen_url: string; imagenes_extra: string[];
  destacado: boolean;
};

const EMPTY: FormState = {
  titulo: "", descripcion: "", contenido: "",
  tipo: "guía", categoria: "normativas",
  para_quien: "todos", estado: "proximamente",
  url: "", video_url: "", pdf_url: "",
  pdfs: [],
  imagen_url: "", imagenes_extra: [],
  destacado: false,
};

export default function AdminRecursosPage() {
  const [recursos, setRecursos]         = useState<Recurso[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [form, setForm]                 = useState<FormState>(EMPTY);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [deleting, setDeleting]         = useState<string | null>(null);
  const [pdfsUploading, setPdfsUploading] = useState<boolean[]>([]);
  const [imgUploading, setImgUploading] = useState([false, false, false]);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/recursos");
    const d = await r.json();
    setRecursos(d.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const upd = (patch: Partial<FormState>) => setForm(p => ({ ...p, ...patch }));

  function handleEdit(r: Recurso) {
    setEditingId(r.id);
    setForm({
      titulo:         r.titulo,
      descripcion:    r.descripcion  ?? "",
      contenido:      r.contenido    ?? "",
      tipo:           r.tipo,
      categoria:      r.categoria,
      para_quien:     r.para_quien,
      estado:         r.estado       ?? "proximamente",
      url:            r.url          ?? "",
      video_url:      r.video_url    ?? "",
      pdf_url:        r.pdf_url      ?? "",
      pdfs: (() => {
        const existing = Array.isArray(r.pdfs) ? r.pdfs : [];
        if (existing.length === 0 && r.pdf_url) return [{ label: "PDF", url: r.pdf_url }];
        return existing;
      })(),
      imagen_url:     r.imagen_url   ?? "",
      imagenes_extra: Array.isArray(r.imagenes_extra) ? r.imagenes_extra : [],
      destacado:      r.destacado,
    });
    setError(""); setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
    setError(""); setSuccess("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim()) { setError("El título es obligatorio."); return; }
    setSaving(true); setError(""); setSuccess("");

    const body = {
      ...form,
      imagenes_extra: form.imagenes_extra.filter(Boolean),
      ...(editingId ? { id: editingId } : {}),
    };

    console.log("[admin/recursos] save payload pdfs:", JSON.stringify(body.pdfs), "pdf_url:", body.pdf_url);

    try {
      const res = await fetch("/api/admin/recursos", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Error");
      setSuccess(editingId ? "Recurso actualizado." : "Recurso agregado.");
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este recurso? Esta acción no se puede deshacer.")) return;
    setDeleting(id);
    await fetch(`/api/admin/recursos?id=${id}`, { method: "DELETE" });
    setDeleting(null);
    if (editingId === id) handleCancelEdit();
    load();
  }

  function fileContentType(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (ext === "xls")  return "application/vnd.ms-excel";
    if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (ext === "doc")  return "application/msword";
    if (ext === "pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    if (ext === "ppt")  return "application/vnd.ms-powerpoint";
    return "application/pdf";
  }

  function fileIcon(url: string): string {
    const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
    if (["xlsx", "xls"].includes(ext)) return "📊";
    if (["docx", "doc"].includes(ext)) return "📝";
    if (["pptx", "ppt"].includes(ext)) return "📑";
    return "📄";
  }

  async function uploadPdfForSlot(file: File, idx: number) {
    if (file.size > 20 * 1024 * 1024) {
      setError("El archivo no puede superar 20 MB.");
      return;
    }
    setPdfsUploading(prev => { const n = [...prev]; n[idx] = true; return n; });
    setError("");
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `archivos/${Date.now()}-${safeName}`;
      const { error: uploadErr } = await supabase.storage
        .from("recursos")
        .upload(path, file, { contentType: fileContentType(file.name), upsert: false });
      if (uploadErr) throw new Error(uploadErr.message);
      const { data: { publicUrl } } = supabase.storage.from("recursos").getPublicUrl(path);
      setForm(prev => {
        const newPdfs = [...prev.pdfs];
        newPdfs[idx] = { ...newPdfs[idx], url: publicUrl };
        return { ...prev, pdfs: newPdfs };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo.");
    }
    setPdfsUploading(prev => { const n = [...prev]; n[idx] = false; return n; });
  }

  async function uploadImagen(file: File, idx: number) {
    setImgUploading(prev => { const n = [...prev]; n[idx] = true; return n; }); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-foto?type=recurso-imagen", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Error");
      const arr = [...form.imagenes_extra];
      while (arr.length <= idx) arr.push("");
      arr[idx] = d.url;
      upd({ imagenes_extra: arr.filter(Boolean) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen.");
    }
    setImgUploading(prev => { const n = [...prev]; n[idx] = false; return n; });
  }

  function removeImagen(idx: number) {
    const arr = [...form.imagenes_extra];
    arr.splice(idx, 1);
    upd({ imagenes_extra: arr });
  }

  const relDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });

  const isEditing = !!editingId;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>

        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 12, color: "var(--mute)", textDecoration: "none", fontFamily: "var(--font-jetbrains),monospace" }}>
            ← Admin
          </Link>
          <h1 style={{ fontFamily: "var(--font-archivo),sans-serif", fontWeight: 900, fontSize: "clamp(20px,3vw,26px)", color: "var(--navy)", margin: "8px 0 0" }}>
            Gestión de recursos
          </h1>
        </div>

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <div style={{ background: "#fff", border: `1.5px solid ${isEditing ? "var(--navy)" : "var(--line)"}`, padding: 24, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <p style={{ ...SL, fontSize: 11, color: "var(--navy)", margin: 0 }}>
              {isEditing ? "// Editando recurso" : "// Agregar recurso"}
            </p>
            {isEditing && (
              <button type="button" onClick={handleCancelEdit} style={{
                background: "none", border: "1px solid var(--line)", padding: "4px 12px",
                fontSize: 12, color: "var(--mute)", cursor: "pointer", fontFamily: "var(--font-jetbrains),monospace",
              }}>
                Cancelar edición
              </button>
            )}
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#DC2626", fontWeight: 600 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC", padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#15803d", fontWeight: 600 }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid-2" style={{ marginBottom: 16, gap: 14 }}>

              {/* Título */}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={SL}>Título *</label>
                <input style={SI} value={form.titulo} onChange={e => upd({ titulo: e.target.value })} placeholder="Título del recurso" />
              </div>

              {/* Descripción */}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={SL}>Descripción corta</label>
                <input style={SI} value={form.descripcion} onChange={e => upd({ descripcion: e.target.value })} placeholder="Resumen breve visible en la tarjeta (opcional)" />
              </div>

              {/* Contenido */}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={SL}>Contenido del artículo (opcional)</label>
                <textarea
                  value={form.contenido}
                  onChange={e => upd({ contenido: e.target.value })}
                  placeholder="Escribe aquí el contenido completo del artículo..."
                  style={{
                    ...SI, height: "auto", minHeight: 200, padding: "10px 12px",
                    resize: "vertical", lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Tipo + Categoría */}
              <div>
                <label style={SL}>Tipo *</label>
                <select style={{ ...SI }} value={form.tipo} onChange={e => upd({ tipo: e.target.value })}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={SL}>Categoría *</label>
                <select style={{ ...SI }} value={form.categoria} onChange={e => upd({ categoria: e.target.value })}>
                  {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Para quién + Estado */}
              <div>
                <label style={SL}>Para quién</label>
                <select style={{ ...SI }} value={form.para_quien} onChange={e => upd({ para_quien: e.target.value })}>
                  <option value="todos">Todos</option>
                  <option value="maestros">Maestros</option>
                  <option value="clientes">Clientes</option>
                </select>
              </div>
              <div>
                <label style={SL}>Estado</label>
                <select style={{ ...SI }} value={form.estado} onChange={e => upd({ estado: e.target.value })}>
                  {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Video URL */}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={SL}>Video (YouTube o Vimeo)</label>
                <input
                  style={SI} value={form.video_url}
                  onChange={e => upd({ video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* Archivos adjuntos — up to 4 */}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={SL}>Archivos adjuntos (hasta 4)</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {form.pdfs.map((slot, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "stretch", flexWrap: "wrap" }}>
                      <input
                        style={{ ...SI, flex: 1, minWidth: 160, height: 40 }}
                        value={slot.label}
                        onChange={e => setForm(prev => {
                          const p = [...prev.pdfs];
                          p[i] = { ...p[i], label: e.target.value };
                          return { ...prev, pdfs: p };
                        })}
                        placeholder={`Nombre del archivo (ej. "Planilla", "Manual", "Presentación")`}
                      />
                      {slot.url ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, height: 40, padding: "0 10px", border: "1.5px solid #86EFAC", background: "#F0FDF4", flexShrink: 0, maxWidth: 260, overflow: "hidden" }}>
                          <span style={{ fontSize: 13 }}>{fileIcon(slot.url)}</span>
                          <a href={slot.url} target="_blank" rel="noopener noreferrer" style={{ color: "#15803d", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                            {decodeURIComponent(slot.url.split("/").pop() ?? "archivo")}
                          </a>
                        </div>
                      ) : pdfsUploading[i] ? (
                        <div style={{ height: 40, padding: "0 14px", border: "1.5px dashed var(--line)", display: "flex", alignItems: "center", fontSize: 12.5, color: "var(--mute)", flexShrink: 0, background: "#fafafa" }}>
                          Subiendo…
                        </div>
                      ) : (
                        <label style={{ height: 40, padding: "0 14px", border: "1.5px dashed var(--line)", display: "flex", alignItems: "center", fontSize: 12.5, color: "var(--navy)", fontWeight: 600, cursor: "pointer", flexShrink: 0, background: "#fafafa" }}>
                          📎 Seleccionar archivo (máx. 20 MB)
                          <input
                            type="file"
                            accept=".pdf,.xlsx,.xls,.docx,.doc,.pptx,.ppt"
                            style={{ display: "none" }}
                            onChange={e => { const f = e.target.files?.[0]; if (f) uploadPdfForSlot(f, i); e.target.value = ""; }}
                          />
                        </label>
                      )}
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, pdfs: prev.pdfs.filter((_, j) => j !== i) }))}
                        style={{ width: 34, height: 40, background: "none", border: "1.5px solid #FCA5A5", color: "#DC2626", fontSize: 18, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {form.pdfs.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, pdfs: [...prev.pdfs, { label: "", url: "" }] }))}
                    style={{ marginTop: 10, background: "none", border: "1.5px dashed var(--navy)", padding: "6px 18px", fontSize: 13, color: "var(--navy)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-archivo),sans-serif" }}
                  >
                    + Agregar otro archivo
                  </button>
                )}
              </div>

              {/* URL imagen miniatura */}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={SL}>URL imagen miniatura</label>
                <input style={SI} value={form.imagen_url} onChange={e => upd({ imagen_url: e.target.value })} placeholder="https://... (URL de imagen de portada)" />
              </div>

              {/* Imágenes adicionales */}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={SL}>Imágenes adicionales (hasta 3)</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[0, 1, 2].map(i => {
                    const url = form.imagenes_extra[i];
                    const busy = imgUploading[i];
                    return (
                      <div key={i} style={{
                        width: 130, height: 90, border: "1.5px dashed var(--line)",
                        position: "relative", overflow: "hidden", background: "#fafafa",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {url ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            <button type="button" onClick={() => removeImagen(i)} style={{
                              position: "absolute", top: 3, right: 3,
                              width: 22, height: 22, background: "rgba(0,0,0,0.65)", border: "none",
                              color: "#fff", fontSize: 14, cursor: "pointer", lineHeight: 1,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>×</button>
                          </>
                        ) : busy ? (
                          <span style={{ fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-jetbrains),monospace" }}>…</span>
                        ) : (
                          <label style={{ cursor: "pointer", fontSize: 26, color: "var(--mute)", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                            +
                            <input
                              type="file" accept="image/*" style={{ display: "none" }}
                              onChange={e => { const f = e.target.files?.[0]; if (f) uploadImagen(f, i); e.target.value = ""; }}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "var(--mute)" }}>
                  Haz clic en "+" para subir cada imagen
                </p>
              </div>

            </div>

            {/* Destacado + submit */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13.5, color: "var(--ink)" }}>
                <input type="checkbox" checked={form.destacado} onChange={e => upd({ destacado: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: "var(--orange)", cursor: "pointer" }} />
                Recurso destacado (aparece en sección superior)
              </label>
              <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                {isEditing && (
                  <button type="button" onClick={handleCancelEdit} style={{
                    height: 44, padding: "0 20px", background: "none",
                    border: "1.5px solid var(--line)", color: "var(--mute)",
                    fontSize: 13, cursor: "pointer", fontFamily: "var(--font-jetbrains),monospace",
                  }}>
                    Cancelar
                  </button>
                )}
                <button type="submit" disabled={saving} style={{
                  height: 44, padding: "0 24px",
                  background: saving ? "var(--mute)" : isEditing ? "var(--orange)" : "var(--navy)",
                  color: "#fff", border: "none", fontWeight: 700, fontSize: 14,
                  cursor: saving ? "default" : "pointer",
                  fontFamily: "var(--font-archivo),sans-serif",
                }}>
                  {saving ? "Guardando…" : isEditing ? "Actualizar recurso" : "Agregar recurso"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ── List ─────────────────────────────────────────────────────── */}
        <div>
          <p style={{ ...SL, fontSize: 11, color: "var(--navy)", marginBottom: 16 }}>
            // {recursos.length} recurso{recursos.length !== 1 ? "s" : ""}
          </p>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", fontSize: 13, color: "var(--mute)", fontFamily: "var(--font-jetbrains),monospace" }}>
              Cargando…
            </div>
          ) : recursos.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", background: "#fff", border: "1px solid var(--line)", fontSize: 13, color: "var(--mute)" }}>
              No hay recursos aún. Agrega uno arriba.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recursos.map(r => {
                const estadoStyle = ESTADO_STYLE[r.estado] ?? ESTADO_STYLE.borrador;
                return (
                  <div key={r.id} style={{
                    background: editingId === r.id ? "rgba(232,108,28,0.04)" : "#fff",
                    border: `1px solid ${editingId === r.id ? "var(--orange)" : "var(--line)"}`,
                    padding: "14px 18px",
                    display: "flex", alignItems: "flex-start", gap: 16, justifyContent: "space-between",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontFamily: "var(--font-archivo),sans-serif", fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                          {r.titulo}
                        </span>
                        <span style={estadoStyle}>{r.estado ?? "proximamente"}</span>
                        {r.destacado && (
                          <span style={{ fontSize: 9.5, fontFamily: "var(--font-jetbrains),monospace", fontWeight: 700, background: "var(--orange)", color: "#fff", padding: "2px 6px" }}>
                            DESTACADO
                          </span>
                        )}
                      </div>
                      {r.descripcion && (
                        <p style={{ margin: "0 0 6px", fontSize: 12.5, color: "var(--mute)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500 }}>
                          {r.descripcion}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11, fontFamily: "var(--font-jetbrains),monospace", color: "var(--mute)" }}>
                        <span style={{ background: "var(--bg-2)", padding: "2px 8px" }}>{r.tipo}</span>
                        <span style={{ background: "var(--bg-2)", padding: "2px 8px" }}>{r.categoria}</span>
                        <span style={{ background: "var(--bg-2)", padding: "2px 8px" }}>{r.para_quien}</span>
                        {r.contenido && <span style={{ background: "var(--bg-2)", padding: "2px 8px" }}>📝 contenido</span>}
                        {r.video_url  && <span style={{ background: "var(--bg-2)", padding: "2px 8px" }}>▶ video</span>}
                        {r.pdf_url    && <span style={{ background: "var(--bg-2)", padding: "2px 8px" }}>📄 pdf</span>}
                        {(r.imagenes_extra?.length ?? 0) > 0 && <span style={{ background: "var(--bg-2)", padding: "2px 8px" }}>🖼 {r.imagenes_extra!.length} img</span>}
                        <span>{relDate(r.created_at)}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => handleEdit(r)}
                        disabled={editingId === r.id}
                        style={{
                          height: 34, padding: "0 14px", background: editingId === r.id ? "var(--bg-2)" : "none",
                          border: "1.5px solid var(--line)", color: editingId === r.id ? "var(--mute)" : "var(--navy)",
                          fontSize: 12, fontWeight: 700, cursor: editingId === r.id ? "default" : "pointer",
                          fontFamily: "var(--font-jetbrains),monospace",
                        }}
                      >
                        {editingId === r.id ? "Editando" : "Editar"}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deleting === r.id}
                        style={{
                          height: 34, padding: "0 14px", background: "none",
                          border: "1.5px solid #FCA5A5", color: "#DC2626",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                          fontFamily: "var(--font-jetbrains),monospace",
                          opacity: deleting === r.id ? 0.5 : 1,
                        }}
                      >
                        {deleting === r.id ? "…" : "Eliminar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
