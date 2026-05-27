"use client";

import { useState } from "react";
import Link from "next/link";
import { FORUM_POSTS, FORUM_CATEGORIES, FORUM_CAT_COLORS, type ForumPost, type ForumAuthor } from "@/lib/forum";

/* ── Icons ──────────────────────────────────────────────────────────────── */
function PinIcon()        { return <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M17.5 3.5a2.12 2.12 0 0 1 3 3L7 20l-4 1 1-4Z"/></svg>; }
function CheckCircleIcon(){ return <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>; }
function MessageIcon()    { return <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function EyeIcon()        { return <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>; }
function PlusIcon()       { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>; }
function UsersIcon()      { return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function LightbulbIcon()  { return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.6 10.3 18 8.9 18 8A6 6 0 0 0 6 8c0 .9.4 2.3 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>; }
function TrendingUpIcon() { return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>; }

/* ── Author badge ───────────────────────────────────────────────────────── */
function AuthorBadge({ author }: { author: ForumAuthor }) {
  if (author.role === "maestro") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        padding: "1px 7px",
        background: author.verified ? "rgba(37,165,90,0.12)" : "rgba(20,55,95,0.08)",
        color: author.verified ? "#1a8c4a" : "#14375F",
        fontSize: 9.5, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
        textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap",
      }}>
        {author.verified ? "✓ Maestro verificado" : "Maestro"}
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "1px 7px", background: "rgba(20,55,95,0.07)", color: "#14375F",
      fontSize: 9.5, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
      textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap",
    }}>
      Cliente
    </span>
  );
}

/* ── Post card ──────────────────────────────────────────────────────────── */
function PostCard({ post, pinned = false }: { post: ForumPost; pinned?: boolean }) {
  const [usefulCount, setUsefulCount] = useState(post.useful);
  const [voted, setVoted]             = useState(false);
  const [saved, setSaved]             = useState(false);

  const catStyle = FORUM_CAT_COLORS[post.category] ?? { bg: "var(--bg-2)", color: "var(--mute)" };
  const catLabel = FORUM_CATEGORIES.find(c => c.id === post.category)?.label ?? post.category;

  const avatarBg = post.author.role === "maestro" ? "#E86C1C" : "#14375F";
  const avatarFg = "#fff";

  function handleUseful(e: React.MouseEvent) {
    e.preventDefault();
    if (voted) { setUsefulCount(c => c - 1); setVoted(false); }
    else       { setUsefulCount(c => c + 1); setVoted(true); }
  }
  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    setSaved(s => !s);
  }

  return (
    <div className="post-card" style={{ borderTop: pinned ? "3px solid var(--orange)" : undefined }}>
      <Link href={`/comunidad/${post.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div className="post-card-body">
          {/* Badge row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {pinned && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px",
                background: "rgba(232,108,28,0.1)", color: "var(--orange)",
                fontSize: 10.5, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                <PinIcon /> Destacado
              </span>
            )}
            <span style={{
              display: "inline-flex", alignItems: "center", padding: "3px 9px",
              background: catStyle.bg, color: catStyle.color,
              fontSize: 11.5, fontWeight: 600, borderRadius: 2,
            }}>
              {catLabel}
            </span>
            {post.solved && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px",
                background: "rgba(37,165,90,0.1)", color: "#25a55a",
                fontSize: 10.5, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                <CheckCircleIcon /> Resuelto
              </span>
            )}
          </div>

          <h3 className="post-card-title">{post.title}</h3>
          <p className="post-excerpt">{post.excerpt}</p>
        </div>
      </Link>

      {/* Footer */}
      <div className="post-card-footer">
        {/* Author */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <div style={{
            width: 30, height: 30, background: avatarBg, color: avatarFg, flexShrink: 0,
            display: "grid", placeItems: "center",
            fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 10,
          }}>
            {post.author.initials}
          </div>
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{post.author.name}</span>
              <AuthorBadge author={post.author} />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--mute)", marginTop: 1 }}>
              {post.author.role === "maestro"
                ? `${post.author.specialty ?? "Maestro"} · ${post.time}`
                : `Cliente · ${post.time}`}
            </div>
          </div>
        </div>

        {/* Actions + stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button onClick={handleUseful}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 9px", border: `1px solid ${voted ? "var(--orange)" : "var(--line)"}`,
              background: voted ? "rgba(232,108,28,0.08)" : "#fff",
              color: voted ? "var(--orange)" : "var(--mute)",
              fontSize: 12, fontWeight: voted ? 700 : 500, cursor: "pointer",
              transition: "all .15s",
            }}>
            👍 {usefulCount}
          </button>

          <Link href={`/comunidad/${post.id}#responder`}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 9px", border: "1px solid var(--line)",
              background: "#fff", color: "var(--mute)",
              fontSize: 12, fontWeight: 500,
            }}>
            <MessageIcon /> {post.seedReplies.length}
          </Link>

          <button onClick={handleSave}
            title={saved ? "Guardado" : "Guardar"}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 8px", border: `1px solid ${saved ? "var(--navy)" : "var(--line)"}`,
              background: saved ? "var(--navy)" : "#fff",
              color: saved ? "#fff" : "var(--mute)",
              fontSize: 12, cursor: "pointer", transition: "all .15s",
            }}>
            🔖
          </button>

          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--mute)" }}>
            <EyeIcon /> {post.views}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function ComunidadPage() {
  const [activeCat, setActiveCat] = useState("todos");

  const filtered = activeCat === "todos"
    ? FORUM_POSTS
    : FORUM_POSTS.filter(p => p.category === activeCat);

  const pinned = filtered.filter(p => p.pinned);
  const rest   = filtered.filter(p => !p.pinned);

  return (
    <div style={{ background: "var(--bg)", minHeight: "70vh", overflowX: "hidden" }}>
      {/* Hero */}
      <div style={{ background: "var(--navy)", color: "#fff", padding: "48px 0 40px" }}>
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <div>
              <span className="label" style={{ color: "rgba(255,255,255,0.5)", marginBottom: 10, display: "block" }}>// Comunidad</span>
              <h1 style={{ color: "#fff", fontSize: "clamp(28px,4vw,40px)", margin: "0 0 10px" }}>Foro de Maestros</h1>
              <p style={{ color: "rgba(255,255,255,0.65)", margin: 0, fontSize: 15.5, maxWidth: 480 }}>
                Consultas, tips del oficio y experiencias entre profesionales del rubro de la construcción.
              </p>
            </div>
            <Link
              href="/comunidad/nueva"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 22px", background: "var(--orange)", color: "#fff",
                fontWeight: 700, fontSize: 15, textDecoration: "none", flexShrink: 0,
              }}
            >
              <PlusIcon /> Nueva pregunta
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32, marginTop: 32, flexWrap: "wrap" }}>
            {[
              { icon: <UsersIcon />, value: "1.240", label: "Maestros activos" },
              { icon: <LightbulbIcon />, value: "3.890", label: "Respuestas dadas" },
              { icon: <TrendingUpIcon />, value: "87%", label: "Preguntas resueltas" },
            ].map(({ icon, value, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>{icon}</span>
                <div>
                  <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tape" />

      <div className="wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>
        <div className="comunidad-grid">

          {/* LEFT — feed */}
          <div className="col gap-0" style={{ minWidth: 0, width: "100%" }}>
            {/* Category filter */}
            <div className="comunidad-cats">
              {FORUM_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                  style={{
                    padding: "6px 14px", border: "1.5px solid var(--ink)",
                    background: activeCat === cat.id ? "var(--ink)" : "#fff",
                    color: activeCat === cat.id ? "#fff" : "var(--ink)",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>
                  {cat.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--mute)" }}>
                No hay publicaciones en esta categoría todavía.{" "}
                <Link href="/comunidad/nueva" style={{ color: "var(--orange)", fontWeight: 600 }}>¡Sé el primero!</Link>
              </div>
            )}

            {pinned.map(post => <PostCard key={post.id} post={post} pinned />)}
            {rest.map(post => <PostCard key={post.id} post={post} />)}

            {filtered.length > 0 && (
              <div style={{ textAlign: "center", marginTop: 32 }}>
                <button style={{
                  padding: "12px 28px", border: "1.5px solid var(--ink)",
                  background: "#fff", color: "var(--ink)", fontWeight: 600, fontSize: 14, cursor: "pointer",
                }}>
                  Cargar más discusiones
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — sidebar */}
          <div className="col gap-20 comunidad-sidebar">

            {/* CTA nueva publicación */}
            <Link href="/comunidad/nueva"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px", background: "var(--orange)", color: "#fff",
                fontWeight: 700, fontSize: 14, textDecoration: "none",
              }}>
              <PlusIcon /> Nueva pregunta
            </Link>

            {/* Rules card */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 20 }}>
              <span className="label" style={{ marginBottom: 12, display: "block" }}>// Normas del foro</span>
              <div className="col gap-8">
                {[
                  "Respeta a tus colegas siempre.",
                  "Comparte experiencia real, no rumores.",
                  "No publiques precios de clientes.",
                  "Reporta contenido inapropiado.",
                ].map((rule, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13.5, color: "var(--ink-soft)" }}>
                    <span style={{ color: "var(--orange)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top contributors */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 20 }}>
              <span className="label" style={{ marginBottom: 14, display: "block" }}>// Más activos este mes</span>
              <div className="col gap-10">
                {[
                  { name: "Roberto M.", role: "Gasfiter", replies: 47, initials: "RM", type: "maestro" as const },
                  { name: "Juan P.",    role: "Albañil",  replies: 38, initials: "JP", type: "maestro" as const },
                  { name: "Pedro R.",   role: "Pintor",   replies: 31, initials: "PR", type: "maestro" as const },
                  { name: "Carlos V.", role: "Electricista", replies: 26, initials: "CV", type: "maestro" as const },
                ].map((u, i) => (
                  <div key={u.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "var(--mute)", fontFamily: "JetBrains Mono, monospace", width: 16, flexShrink: 0 }}>{i + 1}</span>
                    <div style={{
                      width: 32, height: 32, background: "#E86C1C", color: "#fff",
                      display: "grid", placeItems: "center",
                      fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 11, flexShrink: 0,
                    }}>
                      {u.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.2 }}>{u.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--mute)" }}>{u.role}</div>
                    </div>
                    <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "var(--orange)", fontWeight: 700, flexShrink: 0 }}>{u.replies}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular tags */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 20 }}>
              <span className="label" style={{ marginBottom: 12, display: "block" }}>// Tags populares</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["precios", "contrato", "cerámica", "gasfitería", "radier", "permiso", "pintura", "materiales", "herramientas", "técnica", "albañilería"].map(tag => (
                  <button key={tag} style={{
                    padding: "4px 10px", border: "1px solid var(--line)",
                    background: "var(--bg)", color: "var(--mute)",
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                  }}>
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ background: "var(--navy)", color: "#fff", padding: 20 }}>
              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 6 }}>¿Eres maestro?</div>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)", margin: "0 0 14px", lineHeight: 1.5 }}>
                Registra tu perfil y accede a todas las funciones del foro.
              </p>
              <Link href="/registro" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "10px", background: "var(--orange)", color: "#fff",
                fontWeight: 700, fontSize: 13.5, textDecoration: "none",
              }}>
                Registrarme gratis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
