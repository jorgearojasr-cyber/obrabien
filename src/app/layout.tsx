import type { Metadata } from "next";
import { Archivo, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const archivo = Archivo({ subsets: ["latin"], weight: ["500", "600", "700", "800", "900"], variable: "--font-archivo" });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter-tight" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.obrabien.cl"),
  title: "ObraBien - Encuentra Maestros Confiables en Chile",
  description: "Conectamos maestros de construcción verificados con clientes. Albañiles, gasfiteres, electricistas y más. Contacto directo, sin intermediarios.",
  keywords: "maestros chile, construcción, albañil, gasfiter, electricista, carpintero, pintor, ObraBien",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ObraBien - Maestros Confiables en Chile",
    description: "Encuentra al especialista que necesitas. Perfiles verificados, fotos de trabajos y contacto directo por WhatsApp.",
    url: "https://www.obrabien.cl",
    siteName: "ObraBien",
    images: [
      {
        url: "https://res.cloudinary.com/dur4ffxqw/image/upload/v1781482132/ChatGPT_Image_14_jun_2026_08_08_35_p.m._kdvkdy.png",
        width: 1200,
        height: 630,
        alt: "ObraBien - Maestros Confiables en Chile",
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ObraBien - Maestros Confiables en Chile",
    description: "Encuentra al especialista que necesitas.",
    images: ["https://res.cloudinary.com/dur4ffxqw/image/upload/v1781482132/ChatGPT_Image_14_jun_2026_08_08_35_p.m._kdvkdy.png"],
  },
  other: {
    "fb:app_id": "0",
  },
};

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function Body({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${interTight.variable} ${jetbrainsMono.variable}`}>
      <body style={{ fontFamily: "var(--font-inter-tight), system-ui, sans-serif", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!publishableKey) {
    return <Body>{children}</Body>;
  }
  // esES is missing formFieldInputPlaceholder__signUpPassword — it falls back to English "Create a password".
  const localization = { ...esES, formFieldInputPlaceholder__signUpPassword: "Crea tu contraseña" };

  return (
    <ClerkProvider publishableKey={publishableKey} localization={localization as typeof esES}>
      <Body>{children}</Body>
    </ClerkProvider>
  );
}
