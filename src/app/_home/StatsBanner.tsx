import { Users, Star, Gift } from "lucide-react";

interface Props {
  maestros: number;
  resenas: number;
  calificacion: number;
}

export default function StatsBanner({ maestros, resenas, calificacion }: Props) {
  const items = [
    { Icon: Users, value: maestros > 0 ? `${maestros}+` : "Creciendo", label: "Maestros verificados" },
    { Icon: Star,  value: calificacion > 0 ? `${calificacion} / 5` : "★ 4.8 / 5", label: "Calificación promedio" },
    { Icon: Gift,  value: "100% Gratis", label: "Para buscar y contactar" },
  ];

  return (
    <div style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div className="wrap">
        <div className="stats-banner-row">
          {items.map(({ Icon, value, label }, i) => (
            <div key={label} className="stats-banner-item" style={{
              borderRight: i < items.length - 1 ? "1px solid var(--line)" : "none",
            }}>
              <Icon size={18} color="var(--orange)" strokeWidth={2} style={{ flexShrink: 0 }} />
              <div>
                <div style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 800, fontSize: 15, color: "var(--navy)", lineHeight: 1.2,
                }}>
                  {value}
                </div>
                <div style={{ fontSize: 12, color: "var(--mute)", lineHeight: 1.3, marginTop: 1 }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
