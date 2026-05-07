"use client";
import Image from "next/image";

export default function SetGrid({ sets, selectedSetId, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {sets.map((set) => {
        const isSelected = selectedSetId === set.id;
        return (
          <div
            key={set.id}
            onClick={() => onSelect(set)}
            className={`relative flex flex-col items-center bg-[#001B3A] rounded-2xl p-5 cursor-pointer border-2 transition-all duration-200
              ${isSelected
                ? "border-brand-highlight shadow-[0_0_18px_rgba(255,195,0,0.35)] scale-[1.03]"
                : "border-ui-border hover:border-brand-primary hover:shadow-[0_0_12px_rgba(255,195,0,0.15)] hover:scale-[1.02]"
              }`}
          >
            {set.is_rotating && (
              <span className="absolute top-2 right-2 text-[10px] bg-blue-600/80 text-white px-2 py-0.5 rounded-full font-medium">
                Rotativo
              </span>
            )}

            {set.logo_url ? (
              <div className="relative w-full h-16 mb-4">
                <Image
                  src={set.logo_url}
                  alt={set.name}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-16 flex items-center justify-center mb-4">
                <span className="text-5xl">🃏</span>
              </div>
            )}

            <p className="text-white font-bold text-sm text-center leading-snug mb-1">
              {set.name}
            </p>
            <p className="text-gray-400 text-xs text-center mb-3">{set.series}</p>

            <span className={`mt-auto text-xs font-semibold px-3 py-1 rounded-full
              ${isSelected ? "bg-brand-highlight text-black" : "bg-ui-border text-gray-300"}`}>
              {set.cost ?? 100} 🪙 / sobre
            </span>
          </div>
        );
      })}
    </div>
  );
}
