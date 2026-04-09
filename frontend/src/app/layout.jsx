import { Inter, Exo_2 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { AuthProvider } from "@/context/AuthContext";

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
    icons: {
        icon: "/favicon.png",
    },
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="es"
            className={`${fontMain.variable} ${fontDisplay.variable}`}
        >
            <body className="min-h-screen flex flex-col">
                <AuthProvider>
                    <Navbar />
                    <main className="grow">{children}</main>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
}
