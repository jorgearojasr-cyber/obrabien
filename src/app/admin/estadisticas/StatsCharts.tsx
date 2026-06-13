"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type Period = "today" | "week" | "month" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Hoy",
  week:  "Semana",
  month: "Mes",
  year:  "Año",
};
const PERIODS: Period[] = ["today", "week", "month", "year"];

const MONTHS   = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const WEEKDAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function groupDates(dates: string[], period: Period): { label: string; count: number }[] {
  const now      = new Date();
  const nowYear  = now.getFullYear();
  const nowMonth = now.getMonth();

  if (period === "today") {
    const buckets = Array.from({ length: 24 }, (_, h) => ({
      label: `${String(h).padStart(2, "0")}h`,
      count: 0,
    }));
    const todayStr = now.toDateString();
    dates.forEach(d => {
      const date = new Date(d);
      if (date.toDateString() === todayStr) buckets[date.getHours()].count++;
    });
    return buckets;
  }

  if (period === "week") {
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return { label: `${WEEKDAYS[d.getDay()]} ${d.getDate()}`, count: 0, dateStr: d.toDateString() };
    });
    dates.forEach(d => {
      const date   = new Date(d);
      const bucket = buckets.find(b => b.dateStr === date.toDateString());
      if (bucket) bucket.count++;
    });
    return buckets.map(({ label, count }) => ({ label, count }));
  }

  if (period === "month") {
    const daysInMonth = new Date(nowYear, nowMonth + 1, 0).getDate();
    const buckets = Array.from({ length: daysInMonth }, (_, i) => ({ label: String(i + 1), count: 0 }));
    dates.forEach(d => {
      const date = new Date(d);
      if (date.getFullYear() === nowYear && date.getMonth() === nowMonth) {
        buckets[date.getDate() - 1].count++;
      }
    });
    return buckets;
  }

  // year
  const buckets = MONTHS.map(label => ({ label, count: 0 }));
  dates.forEach(d => {
    const date = new Date(d);
    if (date.getFullYear() === nowYear) buckets[date.getMonth()].count++;
  });
  return buckets;
}

interface Props {
  summary: {
    totalMaestros:       number;
    totalClientes:       number;
    totalResenas:        number;
    maestrosVerificados: number;
  };
  maestrosDates: string[];
  clientesDates: string[];
  resenasDates:  string[];
  verifStats: {
    sinEnviar: number;
    pendiente: number;
    aprobado:  number;
    rechazado: number;
  };
}

export default function StatsCharts({
  summary, maestrosDates, clientesDates, resenasDates, verifStats,
}: Props) {
  const [period,  setPeriod]  = useState<Period>("month");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const summaryCards = [
    { label: "Maestros registrados", value: summary.totalMaestros,       color: "#14375F" },
    { label: "Clientes registrados",  value: summary.totalClientes,       color: "#E86C1C" },
    { label: "Reseñas publicadas",    value: summary.totalResenas,        color: "#0d9488" },
    { label: "Maestros verificados",  value: summary.maestrosVerificados, color: "#16a34a" },
  ];

  const charts = [
    { title: "Nuevos maestros",    data: groupDates(maestrosDates, period), color: "#14375F" },
    { title: "Nuevos clientes",    data: groupDates(clientesDates, period), color: "#E86C1C" },
    { title: "Reseñas publicadas", data: groupDates(resenasDates,  period), color: "#0d9488" },
  ];

  const xInterval = period === "today" ? 3 : period === "month" ? 4 : 0;

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14, marginBottom: 36 }}>
        {summaryCards.map(({ label, value, color }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 18px" }}>
            <div style={{
              fontFamily: "var(--font-archivo), sans-serif",
              fontSize: 42, fontWeight: 900, color, lineHeight: 1, marginBottom: 8,
            }}>
              {value}
            </div>
            <div style={{
              fontSize: 11, color: "var(--mute)",
              fontFamily: "var(--font-jetbrains), monospace",
              textTransform: "uppercase", letterSpacing: "0.07em",
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Period filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
          color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace",
          alignSelf: "center", marginRight: 4,
        }}>
          Ver por:
        </span>
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              all: "unset", cursor: "pointer",
              padding: "6px 14px", fontSize: 11.5, fontWeight: 700,
              fontFamily: "var(--font-jetbrains), monospace",
              background: period === p ? "#14375F" : "transparent",
              color:      period === p ? "#fff"    : "var(--mute)",
              border:     `1.5px solid ${period === p ? "#14375F" : "var(--line)"}`,
              transition: "all 0.12s",
            }}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {charts.map(({ title, data, color }) => {
          const total = data.reduce((s, d) => s + d.count, 0);
          return (
            <div key={title} style={{ background: "#fff", border: "1px solid var(--line)", padding: "20px 20px 14px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>
                  {title}
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11.5, fontWeight: 700, color }}>
                  {total} en este período
                </span>
              </div>
              {mounted ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DCD9CF" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10.5, fill: "#6B7C8F", fontFamily: "monospace" }}
                      axisLine={false}
                      tickLine={false}
                      interval={xInterval}
                    />
                    <YAxis
                      tick={{ fontSize: 10.5, fill: "#6B7C8F", fontFamily: "monospace" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        fontFamily: "monospace", fontSize: 12,
                        border: "1px solid #DCD9CF", background: "#F6F4EF", borderRadius: 0,
                      }}
                      labelStyle={{ color: "#14375F", fontWeight: 700 }}
                      formatter={(val) => [`${val}`, "registros"]}
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    />
                    <Bar dataKey="count" fill={color} radius={[2, 2, 0, 0]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 200, background: "#ECEAE3" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Verification status breakdown */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 16, color: "var(--ink)", margin: "0 0 14px" }}>
          Maestros por estado de verificación
        </h2>
        <div style={{ border: "1px solid var(--line)", background: "#fff" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 110px", gap: "0 12px", padding: "8px 16px", background: "var(--bg-2)", borderBottom: "1px solid var(--line)" }}>
            {["Estado", "Cantidad", "%", ""].map(h => (
              <span key={h} style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mute)", fontFamily: "var(--font-jetbrains), monospace" }}>
                {h}
              </span>
            ))}
          </div>
          {(() => {
            const rows = [
              { label: "Sin enviar",  count: verifStats.sinEnviar, color: "#94a3b8", filterParam: "sin_verificar" },
              { label: "Pendiente",   count: verifStats.pendiente, color: "#F59E0B", filterParam: "pendiente" },
              { label: "Verificados", count: verifStats.aprobado,  color: "#22c55e", filterParam: "aprobado" },
              { label: "Rechazados",  count: verifStats.rechazado, color: "#EF4444", filterParam: "rechazado" },
            ];
            const total = rows.reduce((s, r) => s + r.count, 0);
            return (
              <>
                {rows.map(({ label, count, color, filterParam }, i) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={label} style={{
                      display: "grid", gridTemplateColumns: "1fr 80px 70px 110px",
                      gap: "0 12px", padding: "13px 16px", alignItems: "center",
                      borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : undefined,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 10, height: 10, background: color, flexShrink: 0, display: "inline-block" }} />
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{label}</div>
                          <div style={{ height: 3, width: 120, background: "#ECEAE3" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width 0.3s" }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>
                        {count}
                      </div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12.5, color: "var(--mute)" }}>
                        {pct}%
                      </div>
                      <div>
                        <Link href={`/admin/maestros?estado=${filterParam}`} style={{
                          fontSize: 11.5, fontWeight: 700, color: "var(--navy)",
                          textDecoration: "none", fontFamily: "var(--font-jetbrains), monospace",
                        }}>
                          Ver listado →
                        </Link>
                      </div>
                    </div>
                  );
                })}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 80px 70px 110px",
                  gap: "0 12px", padding: "10px 16px",
                  background: "var(--bg-2)", borderTop: "1.5px solid var(--line)",
                }}>
                  <div style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>Total</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{total}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12.5, color: "var(--mute)" }}>100%</div>
                  <div />
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
