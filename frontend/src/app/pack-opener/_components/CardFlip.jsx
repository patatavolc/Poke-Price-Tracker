"use client";
import { useState } from "react";

const RARITY_BADGE = {
  Common: "bg-gray-600 text-white",
  Uncommon: "bg-gray-500 text-white",
  Rare: "bg-blue-600 text-white",
  "Rare Holo": "bg-blue-600 text-white",
  "Ultra Rare": "bg-brand-highlight text-black",
  "Rare Secret": "bg-brand-highlight text-black animate-pulse",
};

/**
 * Props:
 * - card: { id, name, image_small, image_large, rarity }
 * - onFlipped: () => void — called when flip completes
 */
export default function CardFlip({ card, onFlipped }) {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    if (flipped) return;
    setFlipped(true);
    onFlipped?.();
  };

  const badgeClass =
    RARITY_BADGE[card?.rarity] || "bg-gray-600 text-white";

  return (
    <div
      className="relative w-48 sm:w-64 cursor-pointer select-none"
      style={{ perspective: "1000px" }}
      onClick={handleClick}
    >
      <div
        className="relative transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          aspectRatio: "2 / 3",
        }}
      >
        {/* Dorso */}
        <div
          className="absolute inset-0 rounded-xl bg-card-bg border-2 border-ui-border flex items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-6xl text-brand-highlight">?</span>
        </div>

        {/* Frente */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {card?.image_large ? (
            <img
              src={card.image_large}
              alt={card?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-card-bg flex items-center justify-center text-gray-400 text-sm p-3 text-center">
              {card?.name}
            </div>
          )}
          {flipped && (
            <div
              className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${badgeClass}`}
            >
              {card?.rarity}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
