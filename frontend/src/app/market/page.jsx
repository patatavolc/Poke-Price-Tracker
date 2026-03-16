"use client";

import { useState } from "react";
import Image from "next/image";

// Datos de prueba para simular cartas
const MOCK_CARDS = [
    {
        id: 1,
        name: "Charizard",
        set: "Base Set",
        type: "Fuego",
        rarity: "Rara Holo",
        price: 150.0,
        image: "https://images.pokemontcg.io/base1/4_hires.png",
    },
    {
        id: 2,
        name: "Blastoise",
        set: "Base Set",
        type: "Agua",
        rarity: "Rara Holo",
        price: 120.0,
        image: "https://images.pokemontcg.io/base1/2_hires.png",
    },
    {
        id: 3,
        name: "Venusaur",
        set: "Base Set",
        type: "Planta",
        rarity: "Rara Holo",
        price: 100.0,
        image: "https://images.pokemontcg.io/base1/15_hires.png",
    },
    {
        id: 4,
        name: "Pikachu",
        set: "Base Set",
        type: "Eléctrico",
        rarity: "Común",
        price: 20.0,
        image: "https://images.pokemontcg.io/base1/58_hires.png",
    },
    {
        id: 5,
        name: "Mewtwo",
        set: "Fossil",
        type: "Psíquico",
        rarity: "Rara Holo",
        price: 80.0,
        image: "https://images.pokemontcg.io/xy1/23_hires.png",
    },
    {
        id: 6,
        name: "Gengar",
        set: "Fossil",
        type: "Fantasma",
        rarity: "Rara Holo",
        price: 75.0,
        image: "https://images.pokemontcg.io/swsh6/157_hires.png",
    },
    {
        id: 7,
        name: "Snorlax",
        set: "Jungle",
        type: "Normal",
        rarity: "Rara",
        price: 45.0,
        image: "https://images.pokemontcg.io/swsh4/188_hires.png",
    },
    {
        id: 8,
        name: "Rayquaza VMAX",
        set: "Evolving Skies",
        type: "Dragón",
        rarity: "Rara Holo",
        price: 198.4,
        image: "https://images.pokemontcg.io/swsh7/111_hires.png",
    },
];

export default function MarketPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [selectedTypes, setSelectedTypes] = useState([]);

    // Constantes para filtros
    const TYPES = [
        "Fuego",
        "Agua",
        "Planta",
        "Eléctrico",
        "Psíquico",
        "Lucha",
        "Oscuro",
        "Metálico",
        "Hada",
        "Dragón",
        "Normal",
    ];
    const SETS = [
        "Base Set",
        "Jungle",
        "Fossil",
        "Team Rocket",
        "Neo Genesis",
        "Evolving Skies",
    ];
    const RARITIES = [
        "Común",
        "Infrecuente",
        "Rara",
        "Rara Holo",
        "Ultra Rara",
        "Secreta",
    ];

    const handleTypeToggle = (type) => {
        setSelectedTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type],
        );
    };

    return (
        <div className="min-h-screen bg-card-bg text-gray-200">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <h1 className="text-3xl font-bold mb-8 text-brand-primary font-display">
                    Mercado de Cartas
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* --- LEFT ASIDE: FILTROS --- */}
                    <aside className="w-full lg:w-1/4 xl:w-1/5 space-y-6 bg-[#002855] p-6 rounded-xl border border-ui-border h-fit shadow-lg shadow-black/20">
                        <h2 className="text-xl font-semibold border-b border-ui-border pb-2 text-white">
                            Filtros
                        </h2>

                        {/* Filtro: Precio */}
                        <div>
                            <h3 className="font-medium text-brand-highlight mb-3">
                                Rango de Precio (€)
                            </h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full px-3 py-2 bg-card-bg border border-ui-border text-gray-200 placeholder-gray-400 rounded-md text-sm focus:outline-none focus:border-brand-primary"
                                    value={priceRange.min}
                                    onChange={(e) =>
                                        setPriceRange({
                                            ...priceRange,
                                            min: e.target.value,
                                        })
                                    }
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full px-3 py-2 bg-card-bg border border-ui-border text-gray-200 placeholder-gray-400 rounded-md text-sm focus:outline-none focus:border-brand-primary"
                                    value={priceRange.max}
                                    onChange={(e) =>
                                        setPriceRange({
                                            ...priceRange,
                                            max: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        {/* Filtro: Tipo */}
                        <div>
                            <h3 className="font-medium text-brand-highlight mb-3">
                                Tipo
                            </h3>
                            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {TYPES.map((type) => (
                                    <label
                                        key={type}
                                        className="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            className="rounded border-ui-border bg-card-bg text-brand-primary focus:ring-brand-primary focus:ring-opacity-50"
                                            checked={selectedTypes.includes(
                                                type,
                                            )}
                                            onChange={() =>
                                                handleTypeToggle(type)
                                            }
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Filtro: Set de Expansión */}
                        <div>
                            <h3 className="font-medium text-brand-highlight mb-3">
                                Set de Expansión
                            </h3>
                            <select className="w-full px-3 py-2 bg-card-bg border border-ui-border text-gray-200 rounded-md text-sm focus:outline-none focus:border-brand-primary appearance-none">
                                <option value="">Todos los sets</option>
                                {SETS.map((set) => (
                                    <option key={set} value={set}>
                                        {set}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro: Rareza */}
                        <div>
                            <h3 className="font-medium text-brand-highlight mb-3">
                                Rareza
                            </h3>
                            <select className="w-full px-3 py-2 bg-card-bg border border-ui-border text-gray-200 rounded-md text-sm focus:outline-none focus:border-brand-primary appearance-none">
                                <option value="">Todas las rarezas</option>
                                {RARITIES.map((rarity) => (
                                    <option key={rarity} value={rarity}>
                                        {rarity}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button className="w-full bg-brand-primary hover:bg-brand-highlight text-[#000814] font-bold py-2.5 rounded-md transition-colors shadow-[0_0_15px_rgba(255,195,0,0.3)] hover:shadow-[0_0_20px_rgba(255,195,0,0.5)]">
                            Aplicar Filtros
                        </button>
                    </aside>

                    {/* --- RIGHT SECTION: CARTAS --- */}
                    <section className="flex-1">
                        {/* Buscador Superior */}
                        <div className="mb-6 flex gap-4 items-center">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Buscar cartas por nombre (ej. Charizard, Pikachu)..."
                                    className="w-full pl-10 pr-4 py-3 bg-[#002855] border border-ui-border text-gray-200 placeholder-gray-400 rounded-lg focus:outline-none focus:border-brand-primary shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                                <svg
                                    className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <div className="text-sm border border-ui-border bg-[#002855] px-4 py-3 rounded-lg text-brand-primary font-medium">
                                {MOCK_CARDS.length} resultados
                            </div>
                        </div>

                        {/* Grid de Cartas (4 columnas) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {MOCK_CARDS.map((card) => (
                                <div
                                    key={card.id}
                                    className="bg-[#002855] rounded-xl border border-ui-border overflow-hidden hover:border-brand-primary hover:shadow-[0_0_15px_rgba(255,195,0,0.2)] transition-all group flex flex-col shadow-md shadow-black/20"
                                >
                                    <div className="relative aspect-[3/4] bg-card-bg p-4 flex items-center justify-center">
                                        <img
                                            src={card.image}
                                            alt={card.name}
                                            className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    <div className="p-4 flex flex-col flex-1 border-t border-ui-border">
                                        <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-brand-primary transition-colors">
                                            {card.name}
                                        </h3>
                                        <div className="text-sm text-gray-300 mb-3">
                                            {card.set} • {card.rarity}
                                        </div>

                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="inline-block px-2 py-1 bg-card-bg border border-ui-border text-xs rounded-md text-gray-200 font-medium">
                                                {card.type}
                                            </span>
                                            <span className="font-bold text-lg text-brand-primary">
                                                {card.price.toFixed(2)} €
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
