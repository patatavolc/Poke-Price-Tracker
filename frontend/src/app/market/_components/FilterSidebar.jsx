// frontend/src/app/market/_components/FilterSidebar.jsx

export default function FilterSidebar({
    priceRange,
    setPriceRange,
    selectedTypes,
    handleTypeToggle,
    TYPES,
    SETS,
    RARITIES,
}) {
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
                <h3 className="font-medium text-brand-highlight mb-3">Tipo</h3>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {TYPES.map((type) => (
                        <label
                            key={type}
                            className="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors"
                        >
                            <input
                                type="checkbox"
                                className="rounded border-ui-border bg-card-bg text-brand-primary focus:ring-brand-primary focus:ring-opacity-50"
                                checked={selectedTypes.includes(type)}
                                onChange={() => handleTypeToggle(type)}
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
    );
}
