"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "./LogoMark";

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
            <Link
              href="/login"
              style={{
                height: 36, padding: "0 16px", display: "inline-flex", alignItems: "center",
                border: "1.5px solid var(--navy)", background: "#fff", color: "var(--navy)",
                fontWeight: 600, fontSize: 13.5, textDecoration: "none", marginLeft: 8,
              }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="btn btn-yellow btn-sm cta-nav"
              style={{ borderRadius: 8, marginLeft: 8 }}
            >
              <span className="hide-mobile">Soy maestro</span>
              <span className="mobile-only" style={{ fontSize: 18 }}>⛑</span>
            </Link>
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
        <div style={{ background: "var(--bg)", borderTop: "1px solid var(--line)", padding: "12px 24px 20px" }} className="mobile-only">
          {[
            { href: "/", label: "Inicio" },
            { href: "/buscar", label: "Buscar maestros" },
            { href: "/como-funciona", label: "Cómo funciona" },
            { href: "/comunidad",  label: "Comunidad" },
            { href: "/marketplace", label: "Marketplace" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              style={{ display: "block", padding: "10px 0", fontWeight: 500, color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}>
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            style={{ display: "block", marginTop: 12, border: "1.5px solid var(--navy)", color: "var(--navy)", fontWeight: 700, padding: "12px 16px", textAlign: "center", borderRadius: 8 }}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            onClick={() => setOpen(false)}
            style={{ display: "block", marginTop: 8, background: "var(--orange)", color: "#fff", fontWeight: 700, padding: "12px 16px", textAlign: "center", borderRadius: 8 }}
          >
            Soy maestro
          </Link>
        </div>
      )}
    </header>
  );
}
