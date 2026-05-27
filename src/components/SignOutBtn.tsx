"use client";

import { SignOutButton } from "@clerk/nextjs";

export default function SignOutBtn() {
  return (
    <SignOutButton redirectUrl="/">
      <button
        style={{
          height: 36,
          padding: "0 16px",
          border: "1.5px solid var(--line)",
          background: "#fff",
          color: "var(--mute)",
          fontFamily: "var(--font-archivo), sans-serif",
          fontWeight: 600,
          fontSize: 13,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>↩</span> Cerrar sesión
      </button>
    </SignOutButton>
  );
}
