"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Input from "../ui/Input";
import Button from "../../../components/Button";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const { user, isLoading, logout } = useAuth();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="bg-app shadow-md">
            {/* Main bar */}
            <div className="flex items-center justify-between p-4">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-0 flex-shrink-0">
                    <Image
                        src="/brand/navbar-logo.png"
                        alt="Logo de NOIDEX"
                        width={120}
                        height={40}
                    />
                    <span className="text-2xl sm:text-4xl font-bold text-brand-primary">
                        Noidex
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center space-x-4">
                    <ul className="flex space-x-4">
                        <li>
                            <Link href="/market" className="text-lg text-white hover:text-brand-highlight transition-colors">
                                Mercado
                            </Link>
                        </li>
                        <li>
                            <Link href="/pack-opener" className="text-lg text-white hover:text-brand-highlight transition-colors">
                                Packs
                            </Link>
                        </li>
                        <li>
                            <Link href="/coleccion" className="text-lg text-white hover:text-brand-highlight transition-colors">
                                Colección
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Desktop right side */}
                <div className="hidden md:flex items-center space-x-2">
                    <Input placeholder="Buscar..." />
                    <Button className="primary ml-2">Buscar</Button>
                    {!isLoading && (
                        user ? (
                            <div className="flex items-center gap-3 ml-2">
                                <span className="text-white font-semibold">
                                    {user.username}
                                </span>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 text-sm text-white border border-ui-border rounded-lg hover:bg-ui-border/30 transition-colors"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        ) : (
                            <Link
                                href={`/login?from=${encodeURIComponent(pathname)}`}
                                className="ml-2 px-4 py-2 text-sm font-semibold bg-brand-highlight text-black rounded-lg hover:bg-brand-primary transition-colors"
                            >
                                Iniciar sesión
                            </Link>
                        )
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-lg hover:bg-ui-border/30 transition-colors"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="Abrir menú"
                >
                    <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                    <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                    <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                </button>
            </div>

            {/* Mobile dropdown menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-ui-border bg-app px-4 pb-4 flex flex-col gap-4">
                    <nav>
                        <ul className="flex flex-col gap-2 pt-3">
                            <li>
                                <Link
                                    href="/market"
                                    onClick={() => setMenuOpen(false)}
                                    className="block py-2 text-lg text-white hover:text-brand-highlight transition-colors"
                                >
                                    Mercado
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pack-opener"
                                    onClick={() => setMenuOpen(false)}
                                    className="block py-2 text-lg text-white hover:text-brand-highlight transition-colors"
                                >
                                    Packs
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/coleccion"
                                    onClick={() => setMenuOpen(false)}
                                    className="block py-2 text-lg text-white hover:text-brand-highlight transition-colors"
                                >
                                    Colección
                                </Link>
                            </li>
                        </ul>
                    </nav>
                    <div className="flex gap-2">
                        <Input placeholder="Buscar..." />
                        <Button className="primary">Buscar</Button>
                    </div>
                    {!isLoading && (
                        user ? (
                            <div className="flex items-center justify-between">
                                <span className="text-white font-semibold">{user.username}</span>
                                <button
                                    onClick={() => { logout(); setMenuOpen(false); }}
                                    className="px-4 py-2 text-sm text-white border border-ui-border rounded-lg hover:bg-ui-border/30 transition-colors"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        ) : (
                            <Link
                                href={`/login?from=${encodeURIComponent(pathname)}`}
                                onClick={() => setMenuOpen(false)}
                                className="w-full text-center px-4 py-2 text-sm font-semibold bg-brand-highlight text-black rounded-lg hover:bg-brand-primary transition-colors"
                            >
                                Iniciar sesión
                            </Link>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
