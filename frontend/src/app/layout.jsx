import { Inter, Exo_2, Exo } from "next/font/google";
import "./globals.css";

const fontMain = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fontDisplay = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo-2",
  display: "swap",
});

export const metadata = {
  title: "NOIDEX | Market & Packs",
  description:
    "Plataforma de analisis de precios TCG y simulador de apertura de sobres",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fontMain.variable} ${fontDisplay.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
