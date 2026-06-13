"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Lightbox, { type LightboxPhoto } from "@/components/Lightbox";

type Foto = { url: string; descripcion: string | null };

export default function GalleryCarousel({ fotos }: { fotos: Foto[] }) {
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function update() {
      setItemsPerSlide(window.innerWidth < 640 ? 1 : 3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const totalPages = Math.ceil(fotos.length / itemsPerSlide);

  useEffect(() => {
    setCurrent(0);
  }, [itemsPerSlide]);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % totalPages);
  }, [totalPages]);

  const prev = () => {
    setCurrent(c => (c - 1 + totalPages) % totalPages);
  };

  useEffect(() => {
    if (paused || totalPages <= 1) return;
    timerRef.current = setInterval(next, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, totalPages, next]);

  if (fotos.length === 0) return null;

  const pages: Foto[][] = [];
  for (let i = 0; i < fotos.length; i += itemsPerSlide) {
    pages.push(fotos.slice(i, i + itemsPerSlide));
  }

  const lightboxPhotos: LightboxPhoto[] = fotos.map(f => ({ url: f.url, label: f.descripcion }));

  return (
    <>
      <div
        style={{ position: "relative", paddingLeft: totalPages > 1 ? 18 : 0, paddingRight: totalPages > 1 ? 18 : 0 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              width: `${totalPages * 100}%`,
              transform: `translateX(-${(current / totalPages) * 100}%)`,
              transition: "transform 0.5s ease-in-out",
            }}
          >
            {pages.map((page, pageIdx) => (
              <div
                key={pageIdx}
                style={{
                  width: `${100 / totalPages}%`,
                  display: "grid",
                  gridTemplateColumns: `repeat(${itemsPerSlide}, 1fr)`,
                  gap: 12,
                }}
              >
                {page.map((f, i) => {
                  const globalIdx = pageIdx * itemsPerSlide + i;
                  return (
                    <div
                      key={i}
                      onClick={() => setLightboxIdx(globalIdx)}
                      style={{
                        aspectRatio: "4/3",
                        overflow: "hidden",
                        borderRadius: 6,
                        border: "1px solid var(--line)",
                        position: "relative",
                        cursor: "zoom-in",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.url}
                        alt={f.descripcion ?? `Foto ${globalIdx + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      {f.descripcion && (
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0,
                          background: "rgba(0,0,0,0.55)", color: "#fff",
                          fontSize: 11, padding: "4px 8px",
                          fontFamily: "var(--font-jetbrains), monospace",
                        }}>
                          {f.descripcion}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <button
            type="button"
            onClick={prev}
            aria-label="Anterior"
            style={{
              position: "absolute", left: -4, top: "50%", transform: "translateY(-50%)",
              width: 34, height: 34, borderRadius: "50%",
              border: "2px solid var(--orange)", background: "#fff",
              color: "var(--orange)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 700, zIndex: 1, lineHeight: 1,
            }}
          >
            ‹
          </button>
        )}

        {totalPages > 1 && (
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente"
            style={{
              position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)",
              width: 34, height: 34, borderRadius: "50%",
              border: "2px solid var(--orange)", background: "#fff",
              color: "var(--orange)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 700, zIndex: 1, lineHeight: 1,
            }}
          >
            ›
          </button>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Página ${i + 1}`}
                style={{
                  height: 8,
                  width: i === current ? 20 : 8,
                  borderRadius: 4,
                  border: "none",
                  background: i === current ? "var(--orange)" : "#D1D5DB",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.25s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Lightbox
        fotos={lightboxPhotos}
        active={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onSetActive={setLightboxIdx}
      />
    </>
  );
}
