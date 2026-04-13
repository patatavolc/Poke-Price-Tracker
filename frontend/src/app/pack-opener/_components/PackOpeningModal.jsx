"use client";
import { useState } from "react";
import CardFlip from "./CardFlip";

/**
 * Props:
 * - cards: Array of { id, name, image_small, image_large, rarity }
 * - onOpenAnother: () => void
 * - onExit: () => void
 */
export default function PackOpeningModal({ cards, onOpenAnother, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const isLast = currentIndex === cards.length - 1;

  const handleFlipped = () => setRevealed(true);

  const handleNext = () => {
    if (isLast) return;
    setCurrentIndex((i) => i + 1);
    setRevealed(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center gap-6 px-4">
      <p className="text-gray-400 text-sm tracking-wide">
        Toca para revelar &middot; {currentIndex + 1}/{cards.length}
      </p>

      <CardFlip
        key={currentIndex}
        card={cards[currentIndex]}
        onFlipped={handleFlipped}
        onNext={handleNext}
      />

      {revealed && isLast && (
        <div className="flex gap-4 mt-2">
          <button
            onClick={onOpenAnother}
            className="px-6 py-2 bg-brand-highlight text-black font-bold rounded-lg hover:bg-brand-primary transition-colors"
          >
            Abrir otro sobre
          </button>
          <button
            onClick={onExit}
            className="px-6 py-2 bg-ui-border text-white font-bold rounded-lg hover:bg-card-bg transition-colors"
          >
            Salir
          </button>
        </div>
      )}
    </div>
  );
}
