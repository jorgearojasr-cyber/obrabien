import Link from "next/link";
import { SAMPLE_MASTERS } from "@/lib/data";
import { notFound } from "next/navigation";
import ProfessionalCard from "@/components/ProfessionalCard";
import ReviewSection from "@/components/ReviewSection";

function CheckIcon() {
  return <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>;
}
function StarIcon({ size = 14, filled = true }: { size?: number; filled?: boolean }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}><path d="M12 17.3 5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6L18.2 21z" /></svg>;
}
function BackIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>;
}
function PhoneIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>;
}
function ClockIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}
function PinIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>;
}

const SEED_REVIEWS: { author: string; date: string; text: string; rating: number }[] = [
  { author: "María González", date: "Marzo 2025", text: "Excelente trabajo, rápido y muy limpio. Lo recomiendo sin dudarlo.", rating: 5 },
  { author: "Sebastián Torres", date: "Febrero 2025", text: "Solucionó el problema en menos de una hora. Muy profesional y puntual.", rating: 5 },
  { author: "Claudia Herrera", date: "Enero 2025", text: "Buen precio y trabajo cuidadoso. Volvería a contratarlo.", rating: 4 },
];

const AV_COLORS: [string, string][] = [["#14375F", "#fff"], ["#E86C1C", "#fff"], ["#ECEAE3", "#14375F"]];

export default async function PerfilMaestro({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = SAMPLE_MASTERS.findIndex(m => m.id === id);
  const m = idx !== -1 ? SAMPLE_MASTERS[idx] : SAMPLE_MASTERS[0];
  if (!m) notFound();

  const [bg, fg] = AV_COLORS[idx % AV_COLORS.length];

  return (
    <div style={{ background: "var(--bg)", minHeight: "70vh" }}>
      {/* Back bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "12px 0" }}>
        <div className="wrap">
          <Link href="/buscar" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mute)", textDecoration: "none", fontWeight: 500 }}>
            <BackIcon /> Volver a resultados
          </Link>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div className="maestro-grid">
          {/* LEFT — perfil */}
          <div className="col gap-24">
            {/* Header del maestro — oculto en móvil (la tarjeta ya lo muestra) */}
            <div className="maestro-profile-header" style={{ background: "#fff", border: "1px solid var(--line)", padding: 28 }}>
              <div className="row gap-20 wrap-flex" style={{ alignItems: "flex-start" }}>
                <div style={{
                  width: 96, height: 96, background: bg, color: fg, flexShrink: 0,
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 32,
                  border: "1.5px solid var(--ink)",
                }}>
                  {m.initials}
                </div>
                <div className="col gap-8" style={{ flex: 1, minWidth: 0 }}>
                  <div className="row center gap-10 wrap-flex">
                    <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, margin: 0, color: "var(--ink)" }}>
                      {m.name}
                    </h1>
                    {m.verified && (
                      <span className="verified"><CheckIcon /> Verificado</span>
                    )}
                  </div>
                  <div className="row gap-6 wrap-flex">
                    {m.specialties.map(sp => <span key={sp} className="chip chip-dark">{sp}</span>)}
                  </div>
                  <div className="row gap-16 wrap-flex" style={{ fontSize: 13.5, color: "var(--mute)", marginTop: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ color: "var(--orange)", display: "flex", gap: 1 }}>
                        {[0,1,2,3,4].map(i => <StarIcon key={i} size={14} filled={i < Math.round(m.rating)} />)}
                      </span>
                      <strong style={{ color: "var(--ink)", fontFamily: "var(--font-jetbrains), monospace" }}>{m.rating.toFixed(1)}</strong>
                      <span>· {m.jobs} trabajos</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}><PinIcon /> {m.city}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}><ClockIcon /> {m.yearsExp} años de experiencia</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 24 }}>
              <span className="label" style={{ marginBottom: 12, display: "block" }}>// Sobre {m.name.split(" ")[0]}</span>
              <p style={{ fontSize: 15.5, color: "var(--ink-soft)", lineHeight: 1.65, margin: 0 }}>{m.description}</p>

              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--mute)" }}>
                  <PhoneIcon /> {m.phone}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--mute)" }}>
                  <ClockIcon /> {m.schedule}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--mute)" }}>
                  <PinIcon /> {m.sector}
                </div>
              </div>
            </div>

            {/* Galería */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 24 }}>
              <span className="label" style={{ marginBottom: 16, display: "block" }}>// Galería de trabajos</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {m.gallery.map((label, i) => (
                  <div key={i} className="photo-ph" style={{ aspectRatio: "4/3" }}>
                    <div className="ph-label">📷 {label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formas de pago */}
            {m.paymentMethods && (
              <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 24 }}>
                <span className="label" style={{ marginBottom: 16, display: "block" }}>// Formas y modalidad de pago</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--navy)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Acepta
                    </div>
                    <div className="col gap-6">
                      {m.paymentMethods.map(pm => (
                        <div key={pm} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
                          <span style={{ width: 20, height: 20, background: "rgba(232,108,28,0.12)", color: "var(--orange)", display: "grid", placeItems: "center", borderRadius: 4, flexShrink: 0 }}>
                            <CheckIcon />
                          </span>
                          {pm}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--navy)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Modalidad
                    </div>
                    <div className="col gap-6">
                      {(m.paymentSchedule || []).map(ps => (
                        <div key={ps} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
                          <span style={{ width: 20, height: 20, background: "rgba(20,55,95,0.1)", color: "var(--navy)", display: "grid", placeItems: "center", borderRadius: 4, flexShrink: 0 }}>
                            <CheckIcon />
                          </span>
                          {ps}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reseñas */}
            <ReviewSection masterId={m.id} masterName={m.name} initialReviews={SEED_REVIEWS} />
          </div>

          {/* RIGHT — tarjeta profesional (sticky en desktop, arriba en móvil) */}
          <div className="maestro-card-wrap">
            <ProfessionalCard m={m} bg={bg} fg={fg} />
          </div>
        </div>
      </div>
    </div>
  );
}
