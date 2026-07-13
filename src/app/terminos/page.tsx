import Link from "next/link";

export const metadata = {
  title: "Términos y Condiciones — ObraBien",
  description: "Términos y Condiciones de Uso de la plataforma ObraBien.",
};

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "28px 28px 24px" }}>
      <h2 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--navy)", margin: "0 0 14px", lineHeight: 1.2 }}>
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--orange)", marginRight: 10 }}>{n}.</span>
        {title}
      </h2>
      <div style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

export default function TerminosPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="tape-thin" />
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 760 }}>

        <Link href="/" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--mute)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 32 }}>
          ← Volver al inicio
        </Link>

        <div style={{ marginBottom: 40 }}>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mute)", display: "block", marginBottom: 8 }}>
            // Legal · ObraBien
          </span>
          <h1 style={{ fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, fontSize: "clamp(26px,4vw,36px)", color: "var(--navy)", margin: "0 0 12px", lineHeight: 1.1 }}>
            Términos y Condiciones de Uso
          </h1>
          <p style={{ margin: "0 0 14px", fontSize: 14, color: "var(--mute)" }}>
            Última actualización: Mayo 2026
          </p>
          <p style={{ margin: 0, fontSize: 13.5, fontStyle: "italic", color: "var(--mute)", background: "var(--bg-2)", border: "1px solid var(--line)", padding: "10px 14px" }}>
            Este es un documento preliminar y puede ser actualizado.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <Section n="1" title="Descripción del servicio">
            <p>ObraBien es una plataforma digital que conecta a personas que necesitan servicios de construcción, reparación y mantención del hogar (<strong>Clientes</strong>) con profesionales independientes del rubro (<strong>Maestros</strong>). ObraBien actúa únicamente como intermediario y no es parte de ningún contrato de servicios entre Cliente y Maestro.</p>
          </Section>

          <Section n="2" title="Responsabilidad limitada">
            <p>ObraBien <strong>no garantiza</strong> la calidad, seguridad, legalidad ni idoneidad de los servicios ofrecidos por los Maestros registrados. La plataforma no se hace responsable por:</p>
            <ul style={{ margin: "4px 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              <li>Daños materiales o personales derivados de los trabajos realizados</li>
              <li>Incumplimientos de contrato entre Cliente y Maestro</li>
              <li>Disputas sobre pagos o calidad del trabajo</li>
              <li>Información falsa proporcionada por los usuarios</li>
            </ul>
          </Section>

          <Section n="3" title="Verificación de identidad">
            <p>El badge <strong>"Verificado"</strong> indica únicamente que ObraBien ha revisado una fotografía del documento de identidad del Maestro. Esto <strong>no constituye</strong> una garantía de competencia profesional, habilitación técnica ni antecedentes laborales.</p>
          </Section>

          <Section n="4" title="Obligaciones del usuario">
            <p>Al usar ObraBien, el usuario se compromete a:</p>
            <ul style={{ margin: "4px 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              <li>Proporcionar información veraz y actualizada</li>
              <li>No usar la plataforma para actividades fraudulentas o ilegales</li>
              <li>Acordar precios, condiciones y plazos directamente con la contraparte</li>
              <li>Verificar las credenciales y referencias del Maestro antes de contratar</li>
            </ul>
          </Section>

          <Section n="5" title="Pagos y transacciones">
            <p>ObraBien <strong>no interviene</strong> en las transacciones económicas entre Clientes y Maestros. Todos los pagos se acuerdan y realizan directamente entre las partes. ObraBien no cobra comisiones sobre los trabajos realizados.</p>
          </Section>

          <Section n="6" title="Publicaciones en Marketplace">
            <p>Las publicaciones de productos y servicios en el Marketplace son responsabilidad exclusiva de quien las publica. ObraBien no verifica el estado, precio ni disponibilidad de los artículos publicados.</p>
          </Section>

          <Section n="7" title="Empleos">
            <p>Las ofertas de trabajo y postulaciones publicadas en la sección Empleos son responsabilidad exclusiva de quienes las publican. ObraBien no verifica la veracidad de las ofertas ni interviene en los procesos de contratación.</p>
          </Section>

          <Section n="8" title="Reseñas y denuncias">
            <p>Las reseñas publicadas en la plataforma reflejan la opinión de quien las escribe y no la de ObraBien. Al publicar una reseña, el usuario se compromete a que sea veraz y basada en una experiencia real con el Maestro.</p>
            <ul style={{ margin: "4px 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              <li>ObraBien puede eliminar reseñas ofensivas, falsas o que infrinjan la ley, sin previo aviso</li>
              <li>Cualquier usuario puede denunciar un perfil, publicación o reseña a través de los mecanismos de la plataforma</li>
              <li>Las denuncias son revisadas por el equipo de ObraBien, que puede suspender o eliminar cuentas que incumplan estos términos</li>
              <li>El uso malicioso del sistema de denuncias (denuncias falsas o reiteradas sin fundamento) también constituye un incumplimiento</li>
            </ul>
          </Section>

          <Section n="9" title="Modificaciones">
            <p>ObraBien se reserva el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados mediante la plataforma.</p>
          </Section>

          <Section n="10" title="Contacto">
            <p>Para consultas: <a href="mailto:obrabiencl@gmail.com" style={{ color: "var(--navy)", fontWeight: 600 }}>obrabiencl@gmail.com</a></p>
          </Section>

        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Link href="/privacidad" style={{ fontSize: 13.5, color: "var(--navy)", fontWeight: 600 }}>Política de Privacidad →</Link>
          <Link href="/" style={{ fontSize: 13.5, color: "var(--mute)" }}>Volver al inicio</Link>
        </div>

      </div>
    </div>
  );
}
