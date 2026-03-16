"use client";

import { useState, useEffect } from "react";
import { animate, stagger } from "animejs";
import MarketCard from "./_components/MarketCard";
import FilterSidebar from "./_components/FilterSidebar";
import SearchBar from "./_components/SearchBar";

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

    // Animación de aparición de las cartas al cargar la vista
    useEffect(() => {
        animate(".animate-card", {
            translateY: [30, 0], // Sube ligeramente 30px
            opacity: [0, 1], // De invisible a visible
            delay: stagger(100, { start: 150 }), // Efecto cascada: 100ms entre cada carta
            ease: "outCubic",
            duration: 600,
        });
    }, []);

    // Constantes para filtros
    const TYPES = [
        "Normal",
        "Fuego",
        "Agua",
        "Planta",
        "Eléctrico",
        "Hielo",
        "Lucha",
        "Veneno",
        "Tierra",
        "Volador",
        "Psíquico",
        "Bicho",
        "Roca",
        "Fantasma",
        "Dragón",
        "Siniestro",
        "Acero",
        "Hada",
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
                    <FilterSidebar
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        selectedTypes={selectedTypes}
                        handleTypeToggle={handleTypeToggle}
                        TYPES={TYPES}
                        SETS={SETS}
                        RARITIES={RARITIES}
                    />

                    {/* --- RIGHT SECTION: CARTAS --- */}
                    <section className="flex-1">
                        {/* Buscador Superior */}
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            resultCount={MOCK_CARDS.length}
                        />

                        {/* Grid de Cartas (4 columnas) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {MOCK_CARDS.map((card) => (
                                <div
                                    key={card.id}
                                    className="animate-card opacity-0"
                                >
                                    <MarketCard card={card} />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
