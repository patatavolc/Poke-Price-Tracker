import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-app border-t border-ui-border">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {/* Sección 1: Marca */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Image
                                src="/brand/logo.png"
                                alt="Noidex Logo"
                                width={80}
                                height={80}
                                className="rounded-lg"
                            />
                            <h3 className="text-4xl font-bold text-brand-highlight">
                                NOIDEX
                            </h3>
                        </div>
                        <p className="text-gray-400 text-base leading-relaxed">
                            Tu plataforma definitiva para rastrear precios de
                            cartas Pokémon TCG en tiempo real. Analiza
                            tendencias, gestiona tu colección y toma decisiones
                            informadas en el mercado.
                        </p>
                    </div>

                    {/* Sección 2: Plataforma */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">
                            Plataforma
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/"
                                    className="text-gray-400 hover:text-brand-highlight transition-colors duration-200"
                                >
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/market"
                                    className="text-gray-400 hover:text-brand-highlight transition-colors duration-200"
                                >
                                    Market
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/cards"
                                    className="text-gray-400 hover:text-brand-highlight transition-colors duration-200"
                                >
                                    Cartas
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pack-opener"
                                    className="text-gray-400 hover:text-brand-highlight transition-colors duration-200"
                                >
                                    Abrir Sobres
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/profile"
                                    className="text-gray-400 hover:text-brand-highlight transition-colors duration-200"
                                >
                                    Mi Perfil
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Sección 3: Legal */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-gray-400 hover:text-brand-highlight transition-colors duration-200"
                                >
                                    Sobre Nosotros
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="text-gray-400 hover:text-brand-highlight transition-colors duration-200"
                                >
                                    Términos de Servicio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-gray-400 hover:text-brand-highlight transition-colors duration-200"
                                >
                                    Política de Privacidad
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-gray-400 hover:text-brand-highlight transition-colors duration-200"
                                >
                                    Contacto
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Línea divisoria y copyright */}
                <div className="mt-12 pt-8 border-t border-ui-border">
                    <p className="text-center text-gray-500 text-sm">
                        © {new Date().getFullYear()} NOIDEX. Todos los derechos
                        reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
