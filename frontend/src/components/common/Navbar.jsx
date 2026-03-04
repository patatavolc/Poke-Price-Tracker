import Image from "next/image";
import Link from "next/link";
import React from "react";
import Input from "../ui/Input";
import Button from "../../../components/Button";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between p-4 bg-app shadow-md">
      <div className="flex items-center space-x-8">
        <Link href="/inicio" className="flex items-center gap-0">
          <Image
            src="/brand/navbar-logo.png"
            alt="Logo de NOIDEX"
            width={150}
            height={50}
          />
          <span className="text-4xl font-bold text-brand-primary">Noidex</span>
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
        {/* Boton de Iniciar Sesion o Registrarse, si ya lo estan, que salga un icono o algo */}
      </div>
    </div>
  );
}
