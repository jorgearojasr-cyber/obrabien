"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "./LogoMark";
import { Show, SignOutButton } from "@clerk/nextjs";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  return (
    <header style={{ borderBottom: "1px solid var(--line)", background: "var(--bg)", position: "sticky", top: 0, zIndex: 50 }}>
      <div className="tape-thin" />
      <div className="wrap">
        <div className="row between center" style={{ height: 72 }}>

          {/* Logo */}
          <Link href="/" className="brand" aria-label="OBRABIEN — Inicio" style={{ textDecoration: "none" }}>
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
            <Link href="/" className={path === "/" ? "active" : ""}>Inicio</Link>
            <Link href="/buscar" className={path.startsWith("/buscar") ? "active" : ""}>Buscar maestros</Link>
            <Link href="/como-funciona" className={path === "/como-funciona" ? "active" : ""}>Cómo funciona</Link>
            <Link href="/comunidad" className={path.startsWith("/comunidad") ? "active" : ""}>Comunidad</Link>
            <Link href="/marketplace" className={path.startsWith("/marketplace") ? "active" : ""}>Marketplace</Link>

            {/* Signed-out: login + register */}
            <Show when="signed-out">
              <Link href="/login" className="cta-nav" style={{
                height: 36, padding: "0 16px", display: "inline-flex", alignItems: "center",
                border: "1.5px solid var(--navy)", background: "#fff", color: "var(--navy)",
                fontWeight: 600, fontSize: 13.5, textDecoration: "none", marginLeft: 8,
              }}>
                Iniciar sesión
              </Link>
              <Link href="/registro" className="btn btn-yellow btn-sm cta-nav" style={{ marginLeft: 6 }}>
                <span className="hide-mobile">Soy maestro</span>
                <span className="mobile-only" style={{ fontSize: 18 }}>⛑</span>
              </Link>
            </Show>

            {/* Signed-in: dashboard + sign out */}
            <Show when="signed-in">
              <Link href="/dashboard" className="cta-nav" style={{
                height: 36, padding: "0 16px", display: "inline-flex", alignItems: "center",
                border: "1.5px solid var(--navy)", background: "var(--navy)", color: "#fff",
                fontWeight: 600, fontSize: 13.5, textDecoration: "none", marginLeft: 8,
              }}>
                Mi panel
              </Link>
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
            </Show>
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
          {[
            { href: "/", label: "Inicio" },
            { href: "/buscar", label: "Buscar maestros" },
            { href: "/como-funciona", label: "Cómo funciona" },
            { href: "/comunidad", label: "Comunidad" },
            { href: "/marketplace", label: "Marketplace" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              style={{ display: "block", padding: "11px 0", fontWeight: 500, color: "var(--ink-soft)", borderBottom: "1px solid var(--line)", fontSize: 15 }}>
              {label}
            </Link>
          ))}

          {/* Signed-out */}
          <Show when="signed-out">
            <Link href="/login" onClick={() => setOpen(false)} style={{
              display: "block", marginTop: 16,
              border: "1.5px solid var(--navy)", color: "var(--navy)",
              fontWeight: 700, padding: "13px 16px", textAlign: "center",
            }}>
              Iniciar sesión
            </Link>
            <Link href="/registro" onClick={() => setOpen(false)} style={{
              display: "block", marginTop: 8,
              background: "var(--orange)", color: "#fff",
              fontWeight: 700, padding: "13px 16px", textAlign: "center",
            }}>
              Soy maestro
            </Link>
          </Show>

          {/* Signed-in */}
          <Show when="signed-in">
            <Link href="/dashboard" onClick={() => setOpen(false)} style={{
              display: "block", marginTop: 16,
              background: "var(--navy)", color: "#fff",
              fontWeight: 700, padding: "13px 16px", textAlign: "center",
            }}>
              Mi panel
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
        </div>
      )}
    </header>
  );
}
