"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Input from "../ui/Input";
import Button from "../../../components/Button";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const { user, isLoading, logout } = useAuth();
    const pathname = usePathname();

    return (
        <div className="flex items-center justify-between p-4 bg-app shadow-md">
            <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center gap-0">
                    <Image
                        src="/brand/navbar-logo.png"
                        alt="Logo de NOIDEX"
                        width={150}
                        height={50}
                    />
                    <span className="text-4xl font-bold text-brand-primary">
                        Noidex
                    </span>
                </Link>
                <nav>
                    <ul className="flex space-x-4">
                        <li>
                            <Link
                                href="/market"
                                className="text-lg text-white hover:text-brand-highlight transition-colors"
                            >
                                Mercado
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/pack-opener"
                                className="text-lg text-white hover:text-brand-highlight transition-colors"
                            >
                                Packs
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/profile"
                                className="text-lg text-white hover:text-brand-highlight transition-colors"
                            >
                                Colleccion
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

            <div className="flex items-center space-x-2">
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
        </div>
    );
}
