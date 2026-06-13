import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "#14375F",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "72px 80px",
          }}
        >
          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "56px" }}>
            <div
              style={{
                width: "56px", height: "56px",
                background: "#E86C1C",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", fontWeight: 900, color: "#fff",
              }}
            >
              OB
            </div>
            <span style={{ fontSize: "30px", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
              ObraBien
            </span>
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "5px 16px",
                borderRadius: "999px",
                fontSize: "13px", color: "rgba(255,255,255,0.65)", fontWeight: 600,
                marginLeft: "10px",
                display: "flex", alignItems: "center",
              }}
            >
              Plataforma chilena
            </div>
          </div>

          {/* Heading */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
            <div style={{ fontSize: "84px", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>
              Encuentra
            </div>
            <div style={{ fontSize: "84px", fontWeight: 900, color: "#E86C1C", lineHeight: 1, letterSpacing: "-0.03em" }}>
              Maestros
            </div>
            <div style={{ fontSize: "84px", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>
              Confiables.
            </div>
          </div>

          {/* Tagline */}
          <div style={{ marginTop: "28px", fontSize: "22px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            Albañiles · Gasfiter · Electricistas · Carpinteros y más
          </div>

          {/* URL */}
          <div style={{ marginTop: "20px", fontSize: "15px", color: "rgba(255,255,255,0.28)" }}>
            www.obrabien.cl
          </div>
        </div>

        {/* Right orange accent panel */}
        <div
          style={{
            width: "220px",
            background: "#E86C1C",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "28px",
          }}
        >
          {([
            { icon: "✓", label: "Verificados" },
            { icon: "★", label: "Con reseñas" },
            { icon: "%", label: "100% Gratis" },
          ] as { icon: string; label: string }[]).map(({ icon, label }) => (
            <div
              key={label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
            >
              <div
                style={{
                  width: "52px", height: "52px",
                  background: "rgba(255,255,255,0.22)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "26px", fontWeight: 900, color: "#fff",
                }}
              >
                {icon}
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
