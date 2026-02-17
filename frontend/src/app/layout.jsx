import { Inter, Exo_2 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo-2",
});

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${exo2.variable}`}>
      <body>{children}</body>
    </html>
  );
}
