"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    TrendingUp,
    TrendingDown,
    ExternalLink,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Mock data (we can find the card by id later or just use a dummy one)
const MOCK_CARDS = [
    {
        id: 1,
        name: "Charizard",
        set: "Base Set",
        type: "Fuego",
        rarity: "Rara Holo",
        price: 150.0,
        image: "https://images.pokemontcg.io/base1/4_hires.png",
        history: [
            { date: "10 Mar", price: 140 },
            { date: "11 Mar", price: 145 },
            { date: "12 Mar", price: 155 },
            { date: "13 Mar", price: 148 },
            { date: "14 Mar", price: 152 },
            { date: "15 Mar", price: 149 },
            { date: "16 Mar", price: 150 },
        ],
        sellers: [
            { name: "PokeMarket EU", inStock: true, price: 148.5, link: "#" },
            { name: "CardTrader", inStock: true, price: 150.0, link: "#" },
            { name: "TCGPlayer", inStock: false, price: 155.0, link: "#" },
        ],
    },
    {
        id: 2,
        name: "Blastoise",
        set: "Base Set",
        type: "Agua",
        rarity: "Rara Holo",
        price: 120.0,
        image: "https://images.pokemontcg.io/base1/2_hires.png",
        history: [
            { date: "10 Mar", price: 110 },
            { date: "11 Mar", price: 115 },
            { date: "12 Mar", price: 118 },
            { date: "13 Mar", price: 115 },
            { date: "14 Mar", price: 119 },
            { date: "15 Mar", price: 122 },
            { date: "16 Mar", price: 120 },
        ],
        sellers: [
            { name: "PokeMarket EU", inStock: true, price: 118.5, link: "#" },
            { name: "CardTrader", inStock: true, price: 120.0, link: "#" },
        ],
    },
    // Adding general mock data for others just in case
];

// Helper for general card data
const getMockCard = (id) => {
    const card = MOCK_CARDS.find((c) => c.id === parseInt(id));
    if (card) return card;

    // Default fallback
    return {
        id,
        name: "Cartas genérica Pokémon",
        set: "Desconocido",
        type: "Normal",
        rarity: "Rara",
        price: 99.99,
        image: "https://images.pokemontcg.io/base1/58_hires.png",
        history: [
            { date: "10 Mar", price: 90 },
            { date: "11 Mar", price: 95 },
            { date: "12 Mar", price: 92 },
            { date: "13 Mar", price: 98 },
            { date: "14 Mar", price: 96 },
            { date: "15 Mar", price: 100 },
            { date: "16 Mar", price: 99.99 },
        ],
        sellers: [
            { name: "PokeMarket EU", inStock: true, price: 98.5, link: "#" },
            { name: "CardTrader", inStock: false, price: 100.0, link: "#" },
        ],
    };
};

export default function CardDetailPage() {
    const params = useParams();
    const router = useRouter();

    const card = useMemo(() => {
        return params.id ? getMockCard(params.id) : null;
    }, [params.id]);

    if (!card) {
        return (
            <div className="min-h-screen bg-card-bg flex items-center justify-center text-white">
                <p>Cargando carta...</p>
            </div>
        );
    }

    // Mock trend tags
    const trend24h = +1.5;
    const trend7d = -2.3;

    return (
        <div className="min-h-screen bg-card-bg text-gray-200 py-8 relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-screen-2xl relative z-10">
                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-brand-primary hover:text-white transition-colors mb-6 group"
                >
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    <span>Volver al Mercado</span>
                </button>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Aside: Card Image */}
                    <aside className="w-full lg:w-[30%] flex flex-col items-center">
                        <div className="sticky top-24 w-full">
                            <div className="bg-[#002855] rounded-xl border border-ui-border p-2 shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(255,195,0,0.3)] transition-shadow duration-500 relative aspect-[3/4]">
                                <Image
                                    src={card.image}
                                    alt={card.name}
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                    sizes="(max-width: 1024px) 100vw, 30vw"
                                    priority
                                />
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                <span className="px-3 py-1 bg-card-bg border border-ui-border rounded-full text-sm font-medium">
                                    {card.set}
                                </span>
                                <span className="px-3 py-1 bg-card-bg border border-ui-border rounded-full text-sm font-medium text-brand-primary">
                                    {card.rarity}
                                </span>
                                <span className="px-3 py-1 bg-card-bg border border-ui-border rounded-full text-sm font-medium">
                                    {card.type}
                                </span>
                            </div>
                        </div>
                    </aside>

                    {/* Right Main Content */}
                    <main className="w-full lg:w-[70%] flex flex-col gap-10">
                        {/* Header: Title and Price */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-2">
                            <h1 className="text-5xl md:text-7xl font-bold text-white font-display leading-tight flex-1">
                                {card.name}
                            </h1>
                            <div className="flex flex-col md:items-end pt-2">
                                <div className="text-5xl md:text-6xl font-bold text-brand-primary flex items-center">
                                    {card.price.toFixed(2)}{" "}
                                    <span className="text-4xl md:text-5xl ml-1">
                                        €
                                    </span>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <div
                                        className={`flex items-center px-3 py-1.5 rounded-md text-sm font-bold ${trend24h >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                                    >
                                        {trend24h >= 0 ? (
                                            <TrendingUp className="w-4 h-4 mr-1.5" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 mr-1.5" />
                                        )}
                                        24h: {trend24h >= 0 ? "+" : ""}
                                        {trend24h}%
                                    </div>
                                    <div
                                        className={`flex items-center px-3 py-1.5 rounded-md text-sm font-bold ${trend7d >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                                    >
                                        {trend7d >= 0 ? (
                                            <TrendingUp className="w-4 h-4 mr-1.5" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 mr-1.5" />
                                        )}
                                        7d: {trend7d >= 0 ? "+" : ""}
                                        {trend7d}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart: Price History */}
                        <div className="bg-ui-panel border border-ui-border p-6 rounded-xl shadow-md w-full">
                            <h2 className="text-2xl font-bold text-white mb-6 border-b border-ui-border pb-4">
                                Historial de Precios (Últimos 7 días)
                            </h2>
                            <div className="h-[450px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={card.history}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            bottom: 5,
                                            left: 10,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#2D3748"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#A0AEC0"
                                            tick={{ fill: "#A0AEC0" }}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            stroke="#A0AEC0"
                                            tick={{ fill: "#A0AEC0" }}
                                            domain={["auto", "auto"]}
                                            tickFormatter={(value) =>
                                                `€${value}`
                                            }
                                            tickMargin={10}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#001B3A",
                                                border: "1px solid #2D3748",
                                                borderRadius: "8px",
                                            }}
                                            itemStyle={{
                                                color: "#FFC300",
                                                fontWeight: "bold",
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#FFC300"
                                            strokeWidth={3}
                                            dot={{ fill: "#FFC300", r: 5 }}
                                            activeDot={{
                                                r: 8,
                                                fill: "#FFFFFF",
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Sellers List */}
                        <div className="bg-ui-panel border border-ui-border rounded-xl shadow-md overflow-hidden w-full">
                            <div className="p-6 md:p-8 border-b border-ui-border bg-[#001B3A]">
                                <h2 className="text-2xl font-bold text-white">
                                    Vendedores Disponibles
                                </h2>
                            </div>
                            <div className="flex flex-col">
                                {card.sellers.map((seller, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col md:flex-row md:items-center justify-between p-6 md:px-8 border-b border-ui-border last:border-b-0 hover:bg-[#002855] transition-colors"
                                    >
                                        <div className="flex flex-col mb-4 md:mb-0">
                                            <span className="font-bold text-xl text-white">
                                                {seller.name}
                                            </span>
                                            <div className="flex items-center mt-2">
                                                <div
                                                    className={`w-3 h-3 rounded-full mr-2 ${seller.inStock ? "bg-green-500" : "bg-red-500"}`}
                                                ></div>
                                                <span
                                                    className={`text-base font-medium ${seller.inStock ? "text-green-400" : "text-red-400"}`}
                                                >
                                                    {seller.inStock
                                                        ? "En Stock"
                                                        : "Agotado"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-8">
                                            <span className="text-3xl font-bold text-white">
                                                {seller.price.toFixed(2)} €
                                            </span>
                                            <a
                                                href={seller.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center justify-center px-6 py-3 rounded-lg font-bold text-lg transition-all ${
                                                    seller.inStock
                                                        ? "bg-brand-primary text-blue-950 hover:bg-[#E6B000]"
                                                        : "bg-gray-600 text-gray-400 cursor-not-allowed pointer-events-none"
                                                }`}
                                            >
                                                Comprar{" "}
                                                <ExternalLink className="w-5 h-5 ml-2" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
