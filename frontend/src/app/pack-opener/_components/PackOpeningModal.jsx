"use client";
import { useState, useRef } from "react";
import { animate, stagger } from "animejs";
import CardFlip from "./CardFlip";

export default function PackOpeningModal({ cards, onOpenAnother, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);

  const counterRef    = useRef(null);
  const screenFlashEl = useRef(null);

  const isLast = currentIndex === cards.length - 1;

  const handleFlipped = () => setRevealed(true);

  const handleNext = () => {
    if (isLast) return;
    setCurrentIndex((i) => i + 1);
    setRevealed(false);

    // Tick animation en el contador
    if (counterRef.current) {
      animate(counterRef.current, {
        scale: [1.35, 1.0],
        duration: 320,
        ease: "outBack",
      });
    }
  };

  const handleFlashScreen = () => {
    setScreenFlash(true);
    // Pequeño retraso para que el elemento monte antes de animar
    setTimeout(() => {
      if (screenFlashEl.current) {
        animate(screenFlashEl.current, {
          opacity: [0, 0.35, 0],
          duration: 420,
          ease: "outQuad",
          onComplete: () => setScreenFlash(false),
        });
      }
    }, 10);
  };

  // Callback ref: anima los botones finales con stagger cuando montan
  const animateButtons = (el) => {
    if (!el) return;
    animate(el.querySelectorAll("button"), {
      opacity: [0, 1],
      translateY: [18, 0],
      delay: stagger(90),
      duration: 320,
      ease: "outQuad",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center gap-6 px-4">

      {/* Flash de pantalla (Ultra Rare / Rare Secret) */}
      {screenFlash && (
        <div
          ref={screenFlashEl}
          className="fixed inset-0 bg-brand-highlight pointer-events-none opacity-0 z-40"
        />
      )}

      {/* Contador de cartas */}
      <p ref={counterRef} className="text-gray-400 text-sm tracking-wide">
        Toca para revelar &middot; {currentIndex + 1}/{cards.length}
      </p>

      {/* Carta actual */}
      <CardFlip
        key={currentIndex}
        card={cards[currentIndex]}
        onFlipped={handleFlipped}
        onNext={handleNext}
        onFlashScreen={handleFlashScreen}
      />

      {/* Botones finales — aparecen al revelar la última carta */}
      {revealed && isLast && (
        <div ref={animateButtons} className="flex gap-4 mt-2">
          <button
            onClick={onOpenAnother}
            className="px-6 py-2 bg-brand-highlight text-black font-bold rounded-lg hover:bg-brand-primary transition-colors opacity-0"
          >
            Abrir otro sobre
          </button>
          <button
            onClick={onExit}
            className="px-6 py-2 bg-ui-border text-white font-bold rounded-lg hover:bg-card-bg transition-colors opacity-0"
          >
            Salir
          </button>
        </div>
      )}
    </div>
  );
}
