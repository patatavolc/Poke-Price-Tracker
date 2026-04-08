"use client";
import { useState, useEffect } from "react";
import MarketCard from "./_components/MarketCard";
import FilterSidebar from "./_components/FilterSidebar";
import SearchBar from "./_components/SearchBar";
import FloatingSprites from "./_components/FloatingSprites";
import { useDebounce } from "../../hooks/useDebounce";
import { useMarketCards } from "../../hooks/useMarketCards";
import { getSets } from "../../lib/api/sets";

const TYPES = [
    "Normal", "Fuego", "Agua", "Planta", "Eléctrico", "Hielo", "Lucha",
    "Veneno", "Tierra", "Volador", "Psíquico", "Bicho", "Roca", "Fantasma",
    "Dragón", "Siniestro", "Acero", "Hada",
];
const RARITIES = [
    "Común", "Infrecuente", "Rara", "Rara Holo", "Ultra Rara", "Secreta",
];
const PAGE_SIZE = 20;

export default function MarketPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedSet, setSelectedSet] = useState("");
    const [selectedRarity, setSelectedRarity] = useState("");
    const [page, setPage] = useState(1);
    const [SETS, setSETS] = useState([]);

    const debouncedSearch = useDebounce(searchTerm, 400);

    const { cards, totalCount, loading, error } = useMarketCards({
        debouncedSearch,
        selectedTypes,
        priceRange,
        selectedSet,
        selectedRarity,
        page,
    });

    // Poblar selector de sets una sola vez al montar
    useEffect(() => {
        getSets()
            .then((sets) => setSETS(sets.map((s) => ({ id: s.id, name: s.name }))))
            .catch(() => {});
    }, []);

    // Resetear a página 1 cuando cambian los filtros o búsqueda
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, selectedTypes, priceRange, selectedSet, selectedRarity]);

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };
    const handleNextPage = () => {
        if (page < Math.ceil(totalCount / PAGE_SIZE)) setPage(page + 1);
    };
    const handleTypeToggle = (type) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    return (
        <div className="min-h-screen bg-card-bg text-gray-200 relative overflow-hidden">
            <FloatingSprites />
            <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
                <h1 className="text-3xl font-bold mb-8 text-brand-primary font-display">
                    Mercado de Cartas
                </h1>
                <div className="flex flex-col lg:flex-row gap-8">
                    <FilterSidebar
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        selectedTypes={selectedTypes}
                        handleTypeToggle={handleTypeToggle}
                        TYPES={TYPES}
                        SETS={SETS}
                        RARITIES={RARITIES}
                        selectedSet={selectedSet}
                        setSelectedSet={setSelectedSet}
                        selectedRarity={selectedRarity}
                        setSelectedRarity={setSelectedRarity}
                    />
                    <section className="flex-1">
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            resultCount={cards.length}
                        />
                        {error && (
                            <div className="text-red-500 mb-4">{error}</div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.isArray(cards) &&
                                cards.map((card) => (
                                    <div key={card.id} style={{ opacity: 1 }}>
                                        <MarketCard card={card} />
                                    </div>
                                ))}
                        </div>
                        {loading && (
                            <div className="mt-4 text-center">Cargando...</div>
                        )}
                        <div className="mt-8 flex justify-center gap-4">
                            <button
                                className="px-4 py-2 bg-brand-primary text-white rounded shadow disabled:opacity-50"
                                onClick={handlePrevPage}
                                disabled={page === 1}
                            >
                                Anterior
                            </button>
                            <span className="px-4 py-2 text-gray-300">
                                Página {page} de{" "}
                                {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
                            </span>
                            <button
                                className="px-4 py-2 bg-brand-primary text-white rounded shadow disabled:opacity-50"
                                onClick={handleNextPage}
                                disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
                            >
                                Siguiente
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
