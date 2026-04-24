"use client";
import { useRef } from "react";
import { animate } from "animejs";

export default function SetGrid({ sets, selectedSetId, onSelect }) {
  const cardRefs = useRef({});

  const handleMouseMove = (e, setId) => {
    const card = cardRefs.current[setId];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x - rect.width  / 2) / (rect.width  / 2)) * 15;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -15;
    animate(card, {
      rotateY,
      rotateX,
      scale: 1.04,
      boxShadow: `${rotateY * 0.4}px ${-rotateX * 0.4}px 24px rgba(0,53,102,0.7)`,
      duration: 120,
      ease: "outQuad",
    });
  };

  const handleMouseLeave = (setId) => {
    const card = cardRefs.current[setId];
    if (!card) return;
    animate(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      boxShadow: "0px 0px 0px rgba(0,0,0,0)",
      duration: 450,
      ease: "outElastic(1, .5)",
    });
  };

  const handleSelect = (set) => {
    const card = cardRefs.current[set.id];
    if (card) {
      // Pop bounce
      animate(card, {
        keyframes: [
          { scale: 0.93, duration: 80,  ease: "outQuad" },
          { scale: 1.08, duration: 220, ease: "outBack" },
          { scale: 1.0,  duration: 160, ease: "outQuad" },
        ],
      });
      // Glow dorado
      animate(card, {
        boxShadow: [
          "0 0  0px rgba(255,195,0,0.0)",
          "0 0 22px rgba(255,195,0,0.8)",
          "0 0 10px rgba(255,195,0,0.35)",
        ],
        duration: 700,
        ease: "outQuad",
      });
    }
    onSelect(set);
  };

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
      style={{ perspective: "900px" }}
    >
      {sets.map((set) => (
        <div
          key={set.id}
          ref={(el) => { cardRefs.current[set.id] = el; }}
          onClick={() => handleSelect(set)}
          onMouseMove={(e) => handleMouseMove(e, set.id)}
          onMouseLeave={() => handleMouseLeave(set.id)}
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
          className={`relative bg-gradient-to-br from-card-bg to-ui-border rounded-2xl p-4 cursor-pointer border-2 transition-colors ${
            selectedSetId === set.id
              ? "border-brand-highlight"
              : "border-ui-border hover:border-brand-highlight/50"
          }`}
        >
          {set.is_rotating && (
            <span className="absolute top-2 right-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full animate-pulse z-10">
              🔄 Rotativo
            </span>
          )}
          {set.logo_url ? (
            <img
              src={set.logo_url}
              alt={set.name}
              className="w-full h-40 object-contain mb-3 drop-shadow-lg"
            />
          ) : (
            <div className="w-full h-40 flex items-center justify-center mb-3">
              <span className="text-brand-highlight text-5xl drop-shadow-lg">🃏</span>
            </div>
          )}
          <p className="text-white font-bold text-sm text-center truncate font-display">
            {set.name}
          </p>
          <p className="text-gray-400 text-xs text-center mt-1">{set.series}</p>
        </div>
      ))}
    </div>
  );
}
