"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { LogoMark } from "./LogoMark";
import { Show, SignOutButton, useUser } from "@clerk/nextjs";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: "transform .15s", transform: open ? "rotate(180deg)" : "none" }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function AuthDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", marginLeft: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          height: 36, padding: "0 14px", display: "inline-flex", alignItems: "center", gap: 7,
          border: "1.5px solid var(--navy)", background: open ? "var(--navy)" : "#fff",
          color: open ? "#fff" : "var(--navy)",
          fontWeight: 600, fontSize: 13.5, cursor: "pointer",
          transition: "background .15s, color .15s",
        }}
      >
        <PersonIcon />
        Identifícate
        <ChevronDown open={open} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#fff", minWidth: 240,
          border: "1.5px solid var(--line)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 100,
        }}>
          <Link href="/login" onClick={() => setOpen(false)}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "13px 16px", color: "var(--ink)", textDecoration: "none",
              fontSize: 13.5, fontWeight: 600,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <PersonIcon /> Iniciar sesión
          </Link>

          <div style={{ height: 1, background: "var(--line)", margin: "0 16px" }} />

          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/registro?tab=cliente" onClick={() => setOpen(false)}
              style={{
                display: "block", padding: "11px 14px", textAlign: "center",
                background: "var(--navy)", color: "#fff",
                textDecoration: "none", fontSize: 13, fontWeight: 700,
              }}>
              🏠 Registrarse como cliente
            </Link>
            <Link href="/registro?tab=maestro" onClick={() => setOpen(false)}
              style={{
                display: "block", padding: "11px 14px", textAlign: "center",
                background: "var(--orange)", color: "#fff",
                textDecoration: "none", fontSize: 13, fontWeight: 700,
              }}>
              ⛑ Registrarse como maestro
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const NAV_LINKS = [
  { href: "/buscar",      label: "Buscar maestros", match: (p: string) => p.startsWith("/buscar") },
  { href: "/comunidad",   label: "Comunidad",        match: (p: string) => p.startsWith("/comunidad") },
  { href: "/recursos",    label: "Aprende",          match: (p: string) => p.startsWith("/recursos") },
  { href: "/empleos",     label: "Empleos",          match: (p: string) => p.startsWith("/empleos") },
  { href: "/marketplace", label: "Marketplace",      match: (p: string) => p.startsWith("/marketplace") },
];

export default function Navbar() {
  const [open, setOpen]               = useState(false);
  const [unreadCount, setUnread]      = useState(0);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [supabasePhoto, setSupabasePhoto] = useState<string | null>(null);
  const [maestroId, setMaestroId] = useState<string | null>(null);
  const path = usePathname();
  const { isLoaded, user } = useUser();
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "jorge.arojasr@gmail.com").toLowerCase();
  const userEmail  = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  const panelHref  = isLoaded && userEmail && userEmail === adminEmail ? "/admin" : "/dashboard";

  useEffect(() => {
    if (!user) { setUnread(0); setProfileName(null); setSupabasePhoto(null); setMaestroId(null); return; }
    fetch("/api/notificaciones?count=true")
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setUnread(d.count ?? 0))
      .catch(() => {});
    fetch("/api/my-profile")
      .then(r => r.ok ? r.json() : {})
      .then((d: { nombre?: string; fotoUrl?: string; maestroId?: string }) => {
        const parts = (d.nombre || "").trim().split(/\s+/);
        const first = parts[0] || user.firstName || "";
        const lastInitial = parts[1]?.[0]?.toUpperCase();
        const label = first ? (lastInitial ? `${first} ${lastInitial}.` : first) : null;
        setProfileName(label);
        setSupabasePhoto(d.fotoUrl ?? null);
        setMaestroId(d.maestroId ?? null);
      })
      .catch(() => setProfileName(user.firstName ?? null));
  }, [user]);

  // Use Supabase photo; initials fallback (no Clerk/Google photo)
  const avatarInitial = ((profileName || user?.firstName || "?")[0] ?? "?").toUpperCase();

  function Avatar({ size }: { size: number }) {
    if (supabasePhoto) {
      return (
        <img src={supabasePhoto} width={size} height={size}
          style={{ display: "block", objectFit: "cover", width: size, height: size, borderRadius: "50%" }} alt="" />
      );
    }
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "rgba(0,0,0,0.18)", display: "grid", placeItems: "center",
        color: "#fff", fontSize: size * 0.4, fontWeight: 700,
      }}>
        {avatarInitial}
      </div>
    );
  }

  return (
    <header style={{ borderBottom: "1px solid var(--line)", background: "var(--bg)", position: "sticky", top: 0, zIndex: 50 }}>
      <div className="tape-thin" />
      <div className="wrap">
        <div className="row between center" style={{ height: 72 }}>

          {/* Logo */}
          <Link href="/" className="brand" aria-label="ObraBien — Inicio"
            style={{ textDecoration: "none", transition: "opacity .15s" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <span style={{ width: 40, height: 40, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <LogoMark size={40} />
            </span>
            <span className="wordmark">
              <span className="word">
                <span style={{ color: "var(--navy)" }}>OBRA</span>
                <span style={{ color: "var(--orange)" }}>BIEN</span>
              </span>
              <span className="tag hide-mobile">Encuentra maestros confiables</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="site">
            {NAV_LINKS.map(({ href, label, match }) => (
              <Link key={href} href={href} className={match(path) ? "active" : ""}>{label}</Link>
            ))}

            {hasClerk ? (
              <>
                <Show when="signed-out">
                  <AuthDropdown />
                </Show>

                <Show when="signed-in">
                  {/* User — standalone photo + orange name pill */}
                  <div className="hide-mobile" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "1.5px solid var(--line)" }}>
                      <Avatar size={32} />
                    </div>
                    {profileName && (
                      <Link
                        href={user?.publicMetadata?.role === "maestro" && maestroId
                          ? `/maestro/${maestroId}`
                          : "/dashboard/cliente/completar-perfil"}
                        style={{
                          height: 36, display: "inline-flex", alignItems: "center",
                          background: "var(--orange)", color: "#fff",
                          padding: "0 14px", fontWeight: 700, fontSize: 13.5,
                          whiteSpace: "nowrap", textDecoration: "none",
                        }}
                      >
                        {profileName}
                      </Link>
                    )}
                  </div>

                  <Link href={panelHref} className="cta-nav" style={{
                    height: 36, padding: "0 16px", display: "inline-flex", alignItems: "center",
                    border: "1.5px solid var(--navy)", background: "var(--navy)", color: "#fff",
                    fontWeight: 600, fontSize: 13.5, textDecoration: "none", marginLeft: 6,
                    position: "relative",
                  }}>
                    Mi panel
                    {unreadCount > 0 && (
                      <span style={{
                        position: "absolute", top: -5, right: -5,
                        minWidth: 16, height: 16, padding: "0 3px",
                        background: "#EF4444", color: "#fff", borderRadius: 8,
                        fontSize: 9, fontWeight: 700, display: "grid", placeItems: "center",
                        fontFamily: "var(--font-jetbrains), monospace",
                      }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <span className="nav-salir">
                    <SignOutButton redirectUrl="/">
                      <button className="cta-nav" style={{
                        height: 36, padding: "0 14px", marginLeft: 6,
                        border: "1.5px solid var(--line)", background: "transparent",
                        color: "var(--mute)", fontWeight: 600, fontSize: 13, cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 5,
                      }}>
                        <span style={{ fontSize: 12 }}>↩</span> Salir
                      </button>
                    </SignOutButton>
                  </span>
                </Show>
              </>
            ) : (
              <AuthDropdown />
            )}
          </nav>

          {/* Hamburger (mobile) */}
          <button
            className="mobile-only"
            onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}
            aria-label="Menú"
          >
            <span style={{ display: "block", width: 22, height: 2, background: "var(--ink)", transition: "all .2s", transform: open ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <span style={{ display: "block", width: 22, height: 2, background: "var(--ink)", transition: "all .2s", opacity: open ? 0 : 1 }} />
            <span style={{ display: "block", width: 22, height: 2, background: "var(--ink)", transition: "all .2s", transform: open ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: "var(--bg)", borderTop: "1px solid var(--line)", padding: "12px 24px 24px" }} className="mobile-only">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              style={{ display: "block", padding: "11px 0", fontWeight: 500, color: "var(--ink-soft)", borderBottom: "1px solid var(--line)", fontSize: 15 }}>
              {label}
            </Link>
          ))}

          {hasClerk ? (
            <>
              <Show when="signed-out">
                <Link href="/login" onClick={() => setOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: 8, marginTop: 16,
                  border: "1.5px solid var(--line)", color: "var(--ink)",
                  fontWeight: 600, padding: "13px 16px",
                }}>
                  <PersonIcon /> Iniciar sesión
                </Link>
                <Link href="/registro" onClick={() => setOpen(false)} style={{
                  display: "block", marginTop: 8,
                  background: "var(--navy)", color: "#fff",
                  fontWeight: 700, padding: "13px 16px", textAlign: "center",
                }}>
                  🏠 Registrarse como cliente
                </Link>
                <Link href="/registro?tab=maestro" onClick={() => setOpen(false)} style={{
                  display: "block", marginTop: 8,
                  background: "var(--orange)", color: "#fff",
                  fontWeight: 700, padding: "13px 16px", textAlign: "center",
                }}>
                  ⛑ Registrarse como maestro
                </Link>
              </Show>

              <Show when="signed-in">
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0 12px", borderBottom: "1px solid var(--line)", marginBottom: 4 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--orange)", flexShrink: 0 }}>
                    <Avatar size={36} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--mute)", fontWeight: 500, lineHeight: 1 }}>Conectado como</div>
                    <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 700, marginTop: 2 }}>{profileName ?? "Usuario"}</div>
                  </div>
                </div>
                <Link href={panelHref} onClick={() => setOpen(false)} style={{
                  display: "block", marginTop: 12,
                  background: "var(--navy)", color: "#fff",
                  fontWeight: 700, padding: "13px 16px", textAlign: "center",
                  position: "relative",
                }}>
                  Mi panel
                  {unreadCount > 0 && (
                    <span style={{
                      position: "absolute", top: 8, right: 12,
                      minWidth: 18, height: 18, padding: "0 4px",
                      background: "#EF4444", color: "#fff", borderRadius: 9,
                      fontSize: 10, fontWeight: 700, display: "inline-grid", placeItems: "center",
                      fontFamily: "var(--font-jetbrains), monospace", verticalAlign: "middle",
                    }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <SignOutButton redirectUrl="/">
                  <button style={{
                    display: "block", width: "100%", marginTop: 8,
                    border: "1.5px solid var(--line)", background: "transparent",
                    color: "var(--mute)", fontWeight: 600, padding: "13px 16px",
                    textAlign: "center", cursor: "pointer", fontSize: 14,
                  }}>
                    ↩ Cerrar sesión
                  </button>
                </SignOutButton>
              </Show>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} style={{
                display: "flex", alignItems: "center", gap: 8, marginTop: 16,
                border: "1.5px solid var(--line)", color: "var(--ink)",
                fontWeight: 600, padding: "13px 16px",
              }}>
                <PersonIcon /> Iniciar sesión
              </Link>
              <Link href="/registro" onClick={() => setOpen(false)} style={{
                display: "block", marginTop: 8,
                background: "var(--navy)", color: "#fff",
                fontWeight: 700, padding: "13px 16px", textAlign: "center",
              }}>
                🏠 Registrarse como cliente
              </Link>
              <Link href="/registro?tab=maestro" onClick={() => setOpen(false)} style={{
                display: "block", marginTop: 8,
                background: "var(--orange)", color: "#fff",
                fontWeight: 700, padding: "13px 16px", textAlign: "center",
              }}>
                ⛑ Registrarse como maestro
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
