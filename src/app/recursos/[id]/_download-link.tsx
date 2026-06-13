"use client";

export default function TrackDownloadLink({
  href,
  resourceId,
  children,
  style,
}: {
  href: string;
  resourceId: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  function handleClick() {
    fetch("/api/recursos/track-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resourceId }),
    }).catch(() => {});
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style} onClick={handleClick}>
      {children}
    </a>
  );
}
