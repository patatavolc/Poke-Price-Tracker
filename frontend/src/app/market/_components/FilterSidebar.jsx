// frontend/src/app/market/_components/FilterSidebar.jsx
import { useState } from "react";
import Image from "next/image";

// Mapa de los tipos en español con el nombre del icono SVG en inglés
const TYPE_ICONS = {
    Incoloro: "normal",
    Fuego: "fire",
    Agua: "water",
    Planta: "grass",
    Eléctrico: "electric",
    Psíquico: "psychic",
    Lucha: "fighting",
    Oscuridad: "dark",
    Metal: "steel",
    Hada: "fairy",
    Dragón: "dragon",
};

export default function FilterSidebar({
    priceRange,
    setPriceRange,
    selectedTypes,
    handleTypeToggle,
    TYPES,
    SETS,
    RARITIES,
    selectedSet,
    setSelectedSet,
    selectedRarity,
    setSelectedRarity,
}) {
    const [isTypesExpanded, setIsTypesExpanded] = useState(false);

    return (
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
                <button
                    onClick={() => setIsTypesExpanded(!isTypesExpanded)}
                    className="flex items-center justify-between w-full mb-3 group"
                >
                    <h3 className="font-medium text-brand-highlight group-hover:text-brand-primary transition-colors">
                        Tipo
                    </h3>
                    <svg
                        className={`w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-transform duration-200 ${
                            isTypesExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                {/* Contenedor de tipos que se anima al aparecer/desaparecer (usamos grid grid-rows-[1fr|0fr] en CSS o simplemente max-heigth/hide) - en este caso CSS simple */}
                <div
                    className={`grid transition-all duration-300 ease-in-out ${
                        isTypesExpanded
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                    <div className="overflow-hidden">
                        <div className="flex flex-wrap gap-3 pb-2 pt-1">
                            {TYPES.map((type) => {
                                const iconName = TYPE_ICONS[type] || "normal";
                                const isSelected = selectedTypes.includes(type);

                                return (
                                    <button
                                        key={type}
                                        onClick={() => handleTypeToggle(type)}
                                        className={`relative group w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all p-1.5 ${
                                            isSelected
                                                ? "border-brand-primary bg-brand-primary/20 shadow-[0_0_12px_rgba(255,195,0,0.4)] scale-110"
                                                : "border-transparent bg-card-bg hover:bg-ui-border hover:scale-105"
                                        }`}
                                        aria-label={`Filtrar por tipo ${type}`}
                                    >
                                        <Image
                                            src={`/icons/types/${iconName}.svg`}
                                            alt={type}
                                            fill
                                            className={`object-contain transition-opacity duration-200 p-1 ${
                                                isSelected
                                                    ? "opacity-100"
                                                    : "opacity-60 group-hover:opacity-100"
                                            }`}
                                        />

                                        {/* Tooltip Personalizado */}
                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#000814] text-gray-200 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-ui-border shadow-lg">
                                            {type}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtro: Set de Expansión */}
            <div>
                <h3 className="font-medium text-brand-highlight mb-3">
                    Set de Expansión
                </h3>
                <select
                    value={selectedSet}
                    onChange={(e) => setSelectedSet(e.target.value)}
                    className="w-full px-3 py-2 bg-card-bg border border-ui-border text-gray-200 rounded-md text-sm focus:outline-none focus:border-brand-primary appearance-none"
                >
                    <option value="">Todos los sets</option>
                    {SETS.map((set) => (
                        <option key={set.id} value={set.id}>
                            {set.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Filtro: Rareza */}
            <div>
                <h3 className="font-medium text-brand-highlight mb-3">
                    Rareza
                </h3>
                <select
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value)}
                    className="w-full px-3 py-2 bg-card-bg border border-ui-border text-gray-200 rounded-md text-sm focus:outline-none focus:border-brand-primary appearance-none"
                >
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
    );
}
