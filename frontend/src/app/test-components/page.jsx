"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import LogoLoop from "../inicio/_components/LogoLoop";
import FlipCard from "../inicio/_components/FlipCard";

export default function TestPage() {
  // Cartas destacadas para la animación de flip
  const featuredCards = [
    "https://images.pokemontcg.io/xy7/54_hires.png", // Charizard EX
    "https://images.pokemontcg.io/swsh4/25_hires.png", // Pikachu VMAX
    "https://images.pokemontcg.io/base1/4_hires.png", // Charizard Base
    "https://images.pokemontcg.io/swsh45/72_hires.png", // Umbreon VMAX
    "https://images.pokemontcg.io/xy1/23_hires.png", // Mewtwo EX
  ];

  // Datos de ejemplo - luego los reemplazarás con datos del backend
  const cardsData = [
    {
      name: "Charizard VMAX",
      price: 245.5,
      priceChange: 12.5,
    },
    {
      name: "Pikachu VMAX",
      price: 89.99,
      priceChange: -5.3,
    },
    {
      name: "Mewtwo EX",
      price: 156.75,
      priceChange: 8.2,
    },
    {
      name: "Lugia V",
      price: 72.3,
      priceChange: 3.7,
    },
    {
      name: "Rayquaza VMAX",
      price: 198.4,
      priceChange: -2.1,
    },
    {
      name: "Umbreon VMAX",
      price: 312.0,
      priceChange: 15.8,
    },
    {
      name: "Gengar VMAX",
      price: 134.5,
      priceChange: -7.4,
    },
    {
      name: "Gyarados V",
      price: 67.2,
      priceChange: 4.5,
    },
  ];

  return (
    <div className="min-h-screen bg-card-bg">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Gradiente radial con brillo detrás de la carta */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 70% 50%, #ffd60a 0%, rgba(255, 211, 10, 0.4) 20%, rgba(255, 211, 10, 0.1) 40%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* Contenido del Hero */}
        <div className="relative z-10 container mx-auto px-4 grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 items-center">
          {/* Contenido del Hero */}
          <div className="text-center lg:text-left space-y-8 lg:pr-8">
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
                Descubre el Valor de tus Cartas Pokémon
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto lg:mx-0">
                Rastrea precios en tiempo real, analiza tendencias y toma las
                mejores decisiones para tu colección
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="primary" href="/market">
                Explorar Market
              </Button>
              <Button variant="secondary" href="/pack-opener">
                Abrir Sobres
              </Button>
            </div>
          </div>

          {/* Carta Animada */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-96 h-[530px]">
              <FlipCard cards={featuredCards} interval={4000} />
            </div>
          </div>
        </div>
      </section>

      {/* Sección del carrusel de cartas en tendencia */}
      <section className="container mx-auto px-4 py-12 bg-card-bg">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-white mb-2 px-4">
            Cartas en Tendencia
          </h2>
          <p className="text-gray-300 px-4 mb-6">
            Las cartas más populares del momento
          </p>
          <LogoLoop
            cards={cardsData}
            speed={50}
            direction="left"
            pauseOnHover={true}
            fadeOut={true}
            gap={16}
            className="py-6"
          />
        </div>
      </section>
    </div>
  );
}
