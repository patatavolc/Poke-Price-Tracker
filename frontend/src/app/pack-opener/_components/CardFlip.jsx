"use client";
import { useState, useRef, useEffect } from "react";
import { animate } from "animejs";

const RARITY_CONFIG = {
  Common:       { shake: null,      glow: null,       flash: false, badge: "fade"    },
  Uncommon:     { shake: null,      glow: null,       flash: false, badge: "fade"    },
  Rare:         { shake: "soft",    glow: "blue",     flash: false, badge: "slideUp" },
  "Rare Holo":  { shake: "soft",    glow: "blue",     flash: false, badge: "slideUp" },
  "Ultra Rare": { shake: "intense", glow: "gold",     flash: true,  badge: "bounce"  },
  "Rare Secret":{ shake: "intense", glow: "rainbow",  flash: true,  badge: "bounce"  },
};

const RARITY_BADGE = {
  Common:        "bg-gray-600 text-white",
  Uncommon:      "bg-gray-500 text-white",
  Rare:          "bg-blue-600 text-white",
  "Rare Holo":   "bg-blue-600 text-white",
  "Ultra Rare":  "bg-brand-highlight text-black",
  "Rare Secret": "bg-brand-highlight text-black",
};

export default function CardFlip({ card, onFlipped, onNext, onFlashScreen }) {
  const [flipped, setFlipped] = useState(false);
  const wrapperRef = useRef(null);
  const innerRef   = useRef(null);
  const flashRef   = useRef(null);
  const badgeRef   = useRef(null);

  // Entrada: la carta vuela desde abajo al montar
  useEffect(() => {
    if (wrapperRef.current) {
      animate(wrapperRef.current, {
        translateY: [80, 0],
        opacity: [0, 1],
        duration: 420,
        ease: "outBack",
      });
    }
  }, []);

  const applyRarityEffects = () => {
    const config = RARITY_CONFIG[card?.rarity] ?? RARITY_CONFIG.Common;

    // Shake
    if (config.shake === "soft" && innerRef.current) {
      animate(innerRef.current, {
        translateX: [0, -5, 5, -5, 5, 0],
        duration: 380,
        ease: "inOutSine",
      });
    }
    if (config.shake === "intense" && innerRef.current) {
      animate(innerRef.current, {
        translateX: [0, -11, 11, -11, 11, -8, 8, 0],
        duration: 480,
        ease: "inOutSine",
      });
    }

    // Glow
    if (config.glow === "blue" && wrapperRef.current) {
      animate(wrapperRef.current, {
        boxShadow: [
          "0 0  0px rgba(59,130,246,0.0)",
          "0 0 28px rgba(59,130,246,0.85)",
          "0 0  8px rgba(59,130,246,0.3)",
        ],
        duration: 650,
        ease: "outQuad",
      });
    }
    if (config.glow === "gold" && wrapperRef.current) {
      animate(wrapperRef.current, {
        boxShadow: [
          "0 0  0px rgba(255,195,0,0.0)",
          "0 0 38px rgba(255,195,0,0.95)",
          "0 0 16px rgba(255,195,0,0.5)",
        ],
        duration: 800,
        ease: "outQuad",
      });
    }
    if (config.glow === "rainbow" && wrapperRef.current) {
      wrapperRef.current.classList.add("rainbow-glow");
    }

    // Flash de pantalla
    if (config.flash) {
      onFlashScreen?.();
    }

    // Badge
    if (badgeRef.current) {
      if (config.badge === "bounce") {
        animate(badgeRef.current, {
          scale:   [0, 1.35, 1.0],
          opacity: [0, 1],
          duration: 500,
          ease: "outBack",
        });
      } else {
        animate(badgeRef.current, {
          translateY: [10, 0],
          opacity: [0, 1],
          duration: 300,
          ease: "outQuad",
        });
      }
    }
  };

  const handleClick = () => {
    if (flipped) {
      onNext?.();
      return;
    }

    // Flash blanco breve sobre la carta al voltear
    if (flashRef.current) {
      animate(flashRef.current, {
        opacity: [0, 0.75, 0],
        duration: 320,
        ease: "outQuad",
      });
    }

    setFlipped(true);
    onFlipped?.();

    // Efectos de rareza después de que el flip CSS termine (700ms)
    setTimeout(applyRarityEffects, 720);
  };

  const badgeClass = RARITY_BADGE[card?.rarity] ?? "bg-gray-600 text-white";

  return (
    <div
      ref={wrapperRef}
      onClick={handleClick}
      className="relative w-48 sm:w-64 cursor-pointer select-none rounded-xl opacity-0"
      style={{ perspective: "1000px" }}
    >
      {/* Flash blanco al voltear */}
      <div
        ref={flashRef}
        className="absolute inset-0 bg-white rounded-xl z-10 pointer-events-none opacity-0"
      />

      {/* Tarjeta con flip CSS 3D */}
      <div
        ref={innerRef}
        className="relative transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          aspectRatio: "2 / 3",
        }}
      >
        {/* Dorso */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src="/images/card-back.png"
            alt="Card back"
            className="w-full h-full object-cover"
          />
          {/* Shimmer pulsante sobre el dorso */}
          {!flipped && (
            <div className="absolute inset-0 shimmer-overlay rounded-xl" />
          )}
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

          {/* Badge de rareza */}
          {flipped && (
            <div
              ref={badgeRef}
              className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 ${badgeClass}`}
            >
              {card?.rarity}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
