"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import LogoLoop from "./inicio/_components/LogoLoop";
import FlipCard from "./inicio/_components/FlipCard";
import GradientText from "./inicio/_components/GradientText";
import TextReveal from "./inicio/_components/TextReveal";
import { useEffect, useState } from "react";
import FeaturedCard from "./inicio/_components/FeaturedCard";

export default function Home() {
    const [flipCards, setFlipCards] = useState([]); // Para FlipCard
    const [trendingCards, setTrendingCards] = useState([]); // Para carrusel
    const [featuredCards, setFeaturedCards] = useState([]); // Para destacadas
    const currency = "eur";

    // FlipCard: 5 cartas aleatorias de rareza alta
    useEffect(() => {
        fetch(
            `/api/cards/filter?rarity=Rare Holo&minPrice=50&currency=${currency}&limit=20`,
        )
            .then((res) => res.json())
            .then((data) => {
                let cards = Array.isArray(data) ? data : data?.data || [];
                // Seleccionar 5 aleatorias
                cards = cards.sort(() => 0.5 - Math.random()).slice(0, 5);
                setFlipCards(cards);
            })
            .catch(() => setFlipCards([]));
    }, []);

    // Carrusel: cartas en tendencia de subida
    useEffect(() => {
        fetch(`/api/cards/trending/price-increase?period=24h`)
            .then((res) => res.json())
            .then((data) => {
                setTrendingCards(Array.isArray(data) ? data : data?.data || []);
            })
            .catch(() => setTrendingCards([]));
    }, []);

    // Destacadas: cartas más caras
    useEffect(() => {
        fetch(`/api/cards/expensive?limit=8&currency=${currency}`)
            .then((res) => res.json())
            .then((data) => {
                setFeaturedCards(Array.isArray(data) ? data : data?.data || []);
            })
            .catch(() => setFeaturedCards([]));
    }, []);

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
                            <GradientText
                                colors={[
                                    "#ffffff",
                                    "#fff8dc",
                                    "#ffd60a",
                                    "#fff8dc",
                                ]}
                                animationSpeed={6}
                                direction="horizontal"
                                yoyo={false}
                                className="text-6xl lg:text-7xl font-bold leading-tight"
                            >
                                Descubre el Valor de tus Cartas Pokémon
                            </GradientText>
                            <p className="text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto lg:mx-0">
                                Rastrea precios en tiempo real, analiza
                                tendencias y toma las mejores decisiones para tu
                                colección
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
                            {/* FlipCard: 5 cartas aleatorias de rareza alta */}
                            <FlipCard
                                cards={flipCards.map((card) => ({
                                    image: card.image_small,
                                    name: card.name,
                                }))}
                                interval={4000}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección de scroll infinito de cartas */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4 mb-12">
                    <GradientText
                        colors={["#ffd60a", "#ffc300", "#ffba08", "#ffd60a"]}
                        animationSpeed={4}
                        direction="horizontal"
                        className="text-4xl lg:text-5xl font-bold text-center"
                    >
                        Cartas en Tendencia
                    </GradientText>
                </div>
                <LogoLoop
                    cards={trendingCards}
                    speed={60}
                    direction="left"
                    gap={64}
                    fadeOut={true}
                    fadeOutColor="#001d3d"
                    pauseOnHover={true}
                    ariaLabel="Cartas Pokémon en tendencia"
                    renderItem={(card) => (
                        <div className="flex items-center gap-6 transition-all duration-300 hover:scale-110 cursor-pointer">
                            <span className="text-3xl font-bold text-white">
                                {card.name}
                            </span>
                            <span className="text-2xl font-semibold text-brand-highlight">
                                €
                                {typeof card.last_price_eur === "number"
                                    ? card.last_price_eur.toFixed(2)
                                    : Number(card.last_price_eur).toFixed(2)}
                            </span>
                            {card.change_percentage_eur !== undefined && (
                                <span className="text-2xl font-bold text-green-400">
                                    +
                                    {typeof card.change_percentage_eur ===
                                    "number"
                                        ? card.change_percentage_eur.toFixed(2)
                                        : Number(
                                              card.change_percentage_eur,
                                          ).toFixed(2)}
                                    %
                                </span>
                            )}
                        </div>
                    )}
                />
            </section>
            {/* Sección de explicación con animaciones */}
            <TextReveal />

            {/* Seccion de cartas destacadas */}
            <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-b from-app to-card-bg">
                <div className="container mx-auto max-w-7xl">
                    <div className="mb-16">
                        <GradientText
                            colors={[
                                "#ffd60a",
                                "#ffffff",
                                "#003566",
                                "#ffd60a",
                            ]}
                            animationSpeed={4}
                            direction="horizontal"
                            className="text-4xl lg:text-5xl font-bold text-center"
                        >
                            Cartas Destacadas
                        </GradientText>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-6">
                        {featuredCards.map((card, index) => (
                            <FeaturedCard
                                key={index}
                                cardData={{
                                    ...card,
                                    image: card.image_small,
                                    price:
                                        typeof card.last_price_eur === "number"
                                            ? card.last_price_eur
                                            : Number(card.last_price_eur),
                                }}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
