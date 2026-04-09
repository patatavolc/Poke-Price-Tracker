"use client";

/**
 * Props:
 * - sets: Array of { id, name, series, logo_url, is_rotating }
 * - selectedSetId: string | null
 * - onSelect: (set) => void
 */
export default function SetGrid({ sets, selectedSetId, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {sets.map((set) => (
        <div
          key={set.id}
          onClick={() => onSelect(set)}
          className={`relative bg-card-bg rounded-xl p-4 cursor-pointer border-2 transition-all hover:border-brand-highlight ${
            selectedSetId === set.id
              ? "border-brand-highlight"
              : "border-ui-border"
          }`}
        >
          {set.is_rotating && (
            <span className="absolute top-2 right-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
              🔄 Rotativo
            </span>
          )}
          {set.logo_url ? (
            <img
              src={set.logo_url}
              alt={set.name}
              className="w-full h-16 object-contain mb-3"
            />
          ) : (
            <div className="w-full h-16 flex items-center justify-center mb-3">
              <span className="text-brand-highlight text-3xl">🃏</span>
            </div>
          )}
          <p className="text-white font-semibold text-sm text-center truncate">
            {set.name}
          </p>
          <p className="text-gray-400 text-xs text-center">{set.series}</p>
        </div>
      ))}
    </div>
  );
}
