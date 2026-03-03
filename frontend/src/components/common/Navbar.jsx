import Image from "next/image";
import Link from "next/link";
import React from "react";
import Input from "../ui/Input";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between p-4 bg-app shadow-md">
      <div className="flex items-center space-x-8">
        <Link href="/inicio">
          <Image
            src="/brand/navbar-logo.png"
            alt="Logo de NOIDEX"
            width={150}
            height={50}
          />
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link
                href="/market"
                className="text-white hover:text-brand-highlight"
              >
                Mercado
              </Link>
            </li>
            <li>
              <Link
                href="/pack-opener"
                className="text-white hover:text-brand-highlight"
              >
                Packs
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                className="text-white hover:text-brand-highlight"
              >
                Colleccion
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div>
        <Input placeholder="Buscar..." />
        {/* Boton de Iniciar Sesion o Registrarse, si ya lo estan, que salga un icono o algo */}
      </div>
    </div>
  );
}
