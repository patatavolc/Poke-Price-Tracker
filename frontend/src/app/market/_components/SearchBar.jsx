// frontend/src/app/market/_components/SearchBar.jsx

export default function SearchBar({ searchTerm, setSearchTerm, resultCount }) {
    return (
        <div className="mb-6 flex gap-4 items-center">
            <div className="relative flex-1">
                <input
                    type="text"
                    placeholder="Buscar cartas por nombre (ej. Charizard, Pikachu)..."
                    className="w-full pl-10 pr-4 py-3 bg-[#002855] border border-ui-border text-gray-200 placeholder-gray-400 rounded-lg focus:outline-none focus:border-brand-primary shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                {resultCount} resultados
            </div>
        </div>
    );
}
