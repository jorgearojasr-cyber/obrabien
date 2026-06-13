import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad — ObraBien",
  description: "Política de Privacidad y tratamiento de datos personales de ObraBien.",
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

export default function PrivacidadPage() {
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
            Política de Privacidad
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--mute)" }}>
            Última actualización: Mayo 2026
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <Section n="1" title="Datos que recopilamos">
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              <li>Nombre completo y RUT (para maestros verificados)</li>
              <li>Correo electrónico y número de teléfono</li>
              <li>Fotografías de perfil y trabajos realizados</li>
              <li>Documentos de identidad (solo para verificación, no se muestran públicamente)</li>
              <li>Datos de uso de la plataforma</li>
            </ul>
          </Section>

          <Section n="2" title="Uso de los datos">
            <p>Los datos recopilados se usan exclusivamente para:</p>
            <ul style={{ margin: "4px 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              <li>Mostrar el perfil del Maestro a potenciales clientes</li>
              <li>Verificar la identidad de los Maestros</li>
              <li>Enviar notificaciones relacionadas con la plataforma</li>
              <li>Mejorar la experiencia del usuario</li>
            </ul>
          </Section>

          <Section n="3" title="Almacenamiento y seguridad">
            <p>Los datos se almacenan en servidores seguros (Supabase). Las fotografías se almacenan en Cloudinary. La autenticación es gestionada por Clerk. <strong>Ningún dato financiero es almacenado por ObraBien.</strong></p>
          </Section>

          <Section n="4" title="Compartición de datos">
            <p>ObraBien <strong>no vende ni comparte</strong> datos personales con terceros, excepto los datos de perfil público del Maestro que son visibles para todos los usuarios de la plataforma.</p>
          </Section>

          <Section n="5" title="Documentos de identidad">
            <p>Las fotografías de cédula de identidad y selfies enviadas para verificación son revisadas únicamente por el administrador de ObraBien y <strong>no son compartidas con terceros ni mostradas públicamente</strong>. Pueden ser eliminadas a solicitud del usuario.</p>
          </Section>

          <Section n="6" title="Derechos del usuario">
            <p>El usuario puede solicitar en cualquier momento:</p>
            <ul style={{ margin: "4px 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              <li>Acceso a sus datos personales</li>
              <li>Corrección de datos incorrectos</li>
              <li>Eliminación de su cuenta y datos</li>
            </ul>
            <p>Para ejercer estos derechos: <a href="mailto:obrabiencl@gmail.com" style={{ color: "var(--navy)", fontWeight: 600 }}>obrabiencl@gmail.com</a></p>
          </Section>

          <Section n="7" title="Cookies">
            <p>ObraBien usa cookies técnicas necesarias para el funcionamiento de la plataforma (sesión de usuario). <strong>No se usan cookies de seguimiento publicitario.</strong></p>
          </Section>

        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Link href="/terminos" style={{ fontSize: 13.5, color: "var(--navy)", fontWeight: 600 }}>Términos y Condiciones →</Link>
          <Link href="/" style={{ fontSize: 13.5, color: "var(--mute)" }}>Volver al inicio</Link>
        </div>

      </div>
    </div>
  );
}
