"use client";

import { useState } from "react";
import Lightbox from "@/components/Lightbox";

interface Props {
  photoUrl: string;
  name: string;
  initials: string;
  bg: string;
  fg: string;
  size?: number;
}

export default function ProfilePhotoLightbox({ photoUrl, name, initials, bg, fg, size = 160 }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => photoUrl && setOpen(true)}
        style={{
          width: size, height: size,
          background: bg, color: fg, flexShrink: 0,
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: Math.round(size * 0.325),
          borderRadius: "50%", border: "3px solid var(--line)", overflow: "hidden",
          cursor: photoUrl ? "zoom-in" : "default",
        }}
      >
        {photoUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={photoUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : initials}
      </div>

      {open && photoUrl && (
        <Lightbox
          fotos={[{ url: photoUrl, label: name }]}
          active={0}
          onClose={() => setOpen(false)}
          onSetActive={() => {}}
        />
      )}
    </>
  );
}
