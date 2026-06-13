"use client";

import { useState } from "react";
import Lightbox from "./Lightbox";

type Foto = { url: string; descripcion: string | null };

export default function GalleryLightbox({ fotos }: { fotos: Foto[] }) {
  const [active, setActive] = useState<number | null>(null);

  const photos = fotos.map(f => ({ url: f.url, label: f.descripcion }));

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        {fotos.map((f, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{ all: "unset", display: "block", aspectRatio: "4/3", overflow: "hidden", border: "1px solid var(--line)", position: "relative", cursor: "zoom-in" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.url}
              alt={f.descripcion ?? `Foto ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
            {f.descripcion && (
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, padding: "4px 8px", fontFamily: "var(--font-jetbrains), monospace" }}>
                {f.descripcion}
              </div>
            )}
          </button>
        ))}
      </div>

      <Lightbox fotos={photos} active={active} onClose={() => setActive(null)} onSetActive={setActive} />
    </>
  );
}
