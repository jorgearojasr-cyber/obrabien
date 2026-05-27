import type { Metadata } from "next";
import { Archivo, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const archivo = Archivo({ subsets: ["latin"], weight: ["500", "600", "700", "800", "900"], variable: "--font-archivo" });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter-tight" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "OBRABIEN — Encuentra maestros confiables para tu proyecto",
  description: "OBRABIEN conecta clientes con buenos maestros de la construcción en Chile. Busca albañiles, gasfiter, electricistas, carpinteros y más por especialidad y ciudad.",
  keywords: "maestros chile, construcción, albañil, gasfiter, electricista, carpintero, pintor, obrabien",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="es" className={`${archivo.variable} ${interTight.variable} ${jetbrainsMono.variable}`}>
        <body style={{ fontFamily: "var(--font-inter-tight), system-ui, sans-serif", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
