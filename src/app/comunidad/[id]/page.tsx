"use client";

import { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FORUM_CATEGORIES, FORUM_CAT_COLORS, getPost, type ForumAuthor, type ForumReply } from "@/lib/forum";

/* ── Icons ──────────────────────────────────────────────────────────────── */
function BackIcon()        { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>; }
function CheckCircleIcon() { return <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>; }
function ShieldIcon()      { return <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function PinIcon()         { return <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M17.5 3.5a2.12 2.12 0 0 1 3 3L7 20l-4 1 1-4Z"/></svg>; }

/* ── Author badge ───────────────────────────────────────────────────────── */
function AuthorBadge({ author }: { author: ForumAuthor }) {
  if (author.role === "maestro") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px",
        background: author.verified ? "rgba(37,165,90,0.12)" : "rgba(20,55,95,0.08)",
        color: author.verified ? "#1a8c4a" : "#14375F",
        fontSize: 9.5, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
        textTransform: "uppercase", letterSpacing: "0.07em",
      }}>
        {author.verified ? "✓ Maestro verificado" : "Maestro"}
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 8px",
      background: "rgba(20,55,95,0.07)", color: "#14375F",
      fontSize: 9.5, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
      textTransform: "uppercase", letterSpacing: "0.07em",
    }}>
      Cliente
    </span>
  );
}

/* ── Author row ─────────────────────────────────────────────────────────── */
function AuthorRow({ author, time, size = "md" }: { author: ForumAuthor; time: string; size?: "sm" | "md" | "lg" }) {
  const avatarSize = size === "lg" ? 44 : size === "md" ? 36 : 30;
  const fontSize   = size === "lg" ? 14 : size === "md" ? 11 : 10;
  const nameSize   = size === "lg" ? 15.5 : 14;
  const avatarBg   = author.role === "maestro" ? "#E86C1C" : "#14375F";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: avatarSize, height: avatarSize, background: avatarBg, color: "#fff", flexShrink: 0,
        display: "grid", placeItems: "center",
        fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize,
      }}>
        {author.initials}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: nameSize, fontWeight: 700, color: "var(--ink)" }}>{author.name}</span>
          <AuthorBadge author={author} />
        </div>
        <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 2 }}>
          {author.role === "maestro"
            ? `${author.specialty ?? "Maestro"} · ${time}`
            : `Cliente · ${time}`}
        </div>
      </div>
    </div>
  );
}

/* ── Reply card ─────────────────────────────────────────────────────────── */
function ReplyCard({ reply, isNew = false }: { reply: ForumReply; isNew?: boolean }) {
  const [usefulCount, setUsefulCount] = useState(reply.useful);
  const [voted, setVoted] = useState(false);
  const isExpert = reply.author.role === "maestro";

  return (
    <div id={`reply-${reply.id}`} style={{
      background: "#fff",
      border: `1px solid ${isExpert ? "rgba(37,165,90,0.3)" : "var(--line)"}`,
      borderLeft: isExpert ? "3px solid #25a55a" : "1px solid var(--line)",
      padding: "18px 20px",
      position: "relative",
    }}>
      {/* Expert badge */}
      {isExpert && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 10px", background: "rgba(37,165,90,0.1)", color: "#1a8c4a",
          fontSize: 10.5, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
          textTransform: "uppercase", letterSpacing: "0.07em",
          marginBottom: 12,
        }}>
          <ShieldIcon /> Respuesta experta
        </div>
      )}

      {isNew && (
        <div style={{
          position: "absolute", top: 12, right: 14,
          padding: "2px 8px", background: "var(--orange)", color: "#fff",
          fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          Nueva
        </div>
      )}

      <AuthorRow author={reply.author} time={reply.time} size="sm" />

      <p style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.7, margin: "14px 0 14px" }}>
        {reply.content}
      </p>

      {/* Reply actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => { if (voted) { setUsefulCount(c => c - 1); setVoted(false); } else { setUsefulCount(c => c + 1); setVoted(true); } }}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 12px",
            border: `1px solid ${voted ? "var(--orange)" : "var(--line)"}`,
            background: voted ? "rgba(232,108,28,0.08)" : "var(--bg)",
            color: voted ? "var(--orange)" : "var(--mute)",
            fontSize: 13, fontWeight: voted ? 700 : 500, cursor: "pointer",
            transition: "all .15s",
          }}>
          👍 Útil · {usefulCount}
        </button>
        <span style={{ fontSize: 12, color: "var(--mute)" }}>Hace un momento</span>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const post = getPost(id);
  if (!post) notFound();

  const catStyle = FORUM_CAT_COLORS[post.category] ?? { bg: "var(--bg-2)", color: "var(--mute)" };
  const catLabel = FORUM_CATEGORIES.find(c => c.id === post.category)?.label ?? post.category;

  // Sort seed replies: most useful first
  const sortedReplies = [...post.seedReplies].sort((a, b) => b.useful - a.useful);

  // New replies from form
  const [newReplies, setNewReplies] = useState<ForumReply[]>([]);

  // Reply form state
  const [replyName,    setReplyName]    = useState("");
  const [replyRole,    setReplyRole]    = useState<"maestro" | "cliente">("maestro");
  const [replyContent, setReplyContent] = useState("");
  const [replySpecialty, setReplySpecialty] = useState("");
  const [replySent,    setReplySent]    = useState(false);

  const canReply = replyName.trim().length >= 2 && replyContent.trim().length >= 20;

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!canReply) return;
    const newReply: ForumReply = {
      id: `new-${Date.now()}`,
      author: {
        name: replyName.trim(),
        initials: replyName.trim().split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase(),
        role: replyRole,
        specialty: replyRole === "maestro" ? replySpecialty || undefined : undefined,
        verified: false,
      },
      content: replyContent.trim(),
      time: "Ahora",
      useful: 0,
    };
    setNewReplies(prev => [newReply, ...prev]);
    setReplyContent("");
    setReplySent(true);
    setTimeout(() => setReplySent(false), 3000);
  }

  const canReplyAtAll = post.whoCanReply === "todos" || replyRole === "maestro";

  return (
    <div style={{ background: "var(--bg)", minHeight: "70vh" }}>
      {/* Back bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "12px 0" }}>
        <div className="wrap">
          <Link href="/comunidad" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mute)", textDecoration: "none", fontWeight: 500 }}>
            <BackIcon /> Volver al foro
          </Link>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Post header */}
          <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "24px 28px", marginBottom: 20 }}>
            {/* Badges */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {post.pinned && (
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
                padding: "3px 10px", background: catStyle.bg, color: catStyle.color,
                fontSize: 12, fontWeight: 600, borderRadius: 2,
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

            <h1 style={{ fontFamily: "Archivo, sans-serif", fontSize: "clamp(20px,2.8vw,26px)", fontWeight: 800, color: "var(--ink)", margin: "0 0 18px", lineHeight: 1.25 }}>
              {post.title}
            </h1>

            <AuthorRow author={post.author} time={post.time} size="lg" />

            {/* Full content */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
              {post.content.split("\n\n").map((para, i) => (
                <p key={i} style={{ fontSize: 15.5, color: "var(--ink-soft)", lineHeight: 1.75, margin: "0 0 14px" }}>
                  {para.startsWith("**") ? (
                    <strong style={{ color: "var(--ink)" }}>{para.replace(/\*\*/g, "")}</strong>
                  ) : para}
                </p>
              ))}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {post.tags.map(tag => (
                  <span key={tag} style={{
                    padding: "3px 10px", border: "1px solid var(--line)",
                    background: "var(--bg)", color: "var(--mute)", fontSize: 12,
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Post actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
              <PostUsefulBtn initial={post.useful} />
              <a href="#responder"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 16px", border: "1.5px solid var(--ink)",
                  background: "var(--ink)", color: "#fff",
                  fontSize: 13.5, fontWeight: 600, textDecoration: "none",
                }}>
                💬 Responder
              </a>
              <span style={{ fontSize: 13, color: "var(--mute)" }}>
                {post.views} visualizaciones · {sortedReplies.length + newReplies.length} respuestas
              </span>
            </div>
          </div>

          {/* Replies section */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span className="label">// {sortedReplies.length + newReplies.length} Respuestas</span>
              <span style={{ fontSize: 12, color: "var(--mute)", marginLeft: "auto" }}>ordenadas por utilidad</span>
            </div>

            <div className="col gap-12">
              {/* New replies first */}
              {newReplies.map(r => <ReplyCard key={r.id} reply={r} isNew />)}

              {/* Seed replies sorted by useful */}
              {sortedReplies.map(r => <ReplyCard key={r.id} reply={r} />)}

              {sortedReplies.length === 0 && newReplies.length === 0 && (
                <div style={{
                  background: "#fff", border: "1px solid var(--line)", padding: "32px",
                  textAlign: "center", color: "var(--mute)", fontSize: 14,
                }}>
                  Sin respuestas todavía. ¡Sé el primero en responder!
                </div>
              )}
            </div>
          </div>

          {/* Reply form */}
          <div id="responder" style={{ background: "#fff", border: "1px solid var(--line)", padding: "24px 28px" }}>
            <span className="label" style={{ display: "block", marginBottom: 16 }}>// Tu respuesta</span>

            {post.whoCanReply === "maestros" && (
              <div style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                padding: "12px 14px", background: "rgba(20,55,95,0.05)",
                border: "1px solid rgba(20,55,95,0.15)", marginBottom: 16,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
                <p style={{ fontSize: 13, color: "var(--navy)", margin: 0, lineHeight: 1.5 }}>
                  El autor pidió que solo maestros respondan esta publicación.
                </p>
              </div>
            )}

            {replySent && (
              <div style={{
                padding: "10px 14px", background: "rgba(37,165,90,0.1)",
                border: "1px solid rgba(37,165,90,0.3)", color: "#1a8c4a",
                fontSize: 14, fontWeight: 600, marginBottom: 16,
              }}>
                ✅ ¡Respuesta publicada! Aparece arriba en la lista.
              </div>
            )}

            <form onSubmit={handleReply} className="col gap-16">
              {/* Name + role */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field">
                  <label>Tu nombre <span style={{ color: "var(--orange)" }}>*</span></label>
                  <input
                    className="ob-input"
                    placeholder="Juan Pérez"
                    value={replyName}
                    onChange={e => setReplyName(e.target.value)}
                    style={{ marginTop: 6 }}
                  />
                </div>
                <div className="field">
                  <label>Eres</label>
                  <select
                    className="ob-select"
                    value={replyRole}
                    onChange={e => setReplyRole(e.target.value as "maestro" | "cliente")}
                    style={{ marginTop: 6 }}
                  >
                    <option value="maestro">Maestro / Profesional</option>
                    <option value="cliente">Cliente / Particular</option>
                  </select>
                </div>
              </div>

              {/* Specialty (only for maestro) */}
              {replyRole === "maestro" && (
                <div className="field">
                  <label>Especialidad <span style={{ color: "var(--mute)", fontWeight: 400 }}>(opcional)</span></label>
                  <input
                    className="ob-input"
                    placeholder="Ej: Gasfiter, Ceramista, Electricista…"
                    value={replySpecialty}
                    onChange={e => setReplySpecialty(e.target.value)}
                    style={{ marginTop: 6 }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="field">
                <label>Tu respuesta <span style={{ color: "var(--orange)" }}>*</span></label>
                <textarea
                  className="ob-textarea"
                  placeholder="Escribe tu respuesta con el mayor detalle posible. Cuanta más información des, más útil serás para la comunidad..."
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  style={{ minHeight: 140, marginTop: 6 }}
                  disabled={post.whoCanReply === "maestros" && replyRole === "cliente"}
                />
                {post.whoCanReply === "maestros" && replyRole === "cliente" && (
                  <p style={{ fontSize: 12, color: "var(--mute)", margin: "4px 0 0" }}>Solo los maestros pueden responder esta publicación.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!canReply || !canReplyAtAll}
                style={{
                  height: 50, border: "none", color: "#fff", fontWeight: 700, fontSize: 15,
                  background: canReply && canReplyAtAll ? "var(--orange)" : "var(--mute-2)",
                  cursor: canReply && canReplyAtAll ? "pointer" : "not-allowed",
                  transition: "background .2s",
                }}>
                Publicar respuesta →
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

/* Small stateful util button inside the server-rendered post */
function PostUsefulBtn({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);
  const [voted, setVoted] = useState(false);
  return (
    <button
      onClick={() => { if (voted) { setCount(c => c - 1); setVoted(false); } else { setCount(c => c + 1); setVoted(true); } }}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 14px",
        border: `1.5px solid ${voted ? "var(--orange)" : "var(--line)"}`,
        background: voted ? "rgba(232,108,28,0.08)" : "var(--bg)",
        color: voted ? "var(--orange)" : "var(--mute)",
        fontSize: 13.5, fontWeight: voted ? 700 : 500, cursor: "pointer",
        transition: "all .15s",
      }}>
      👍 Útil · {count}
    </button>
  );
}
