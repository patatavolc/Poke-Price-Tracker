"use client";
import { useCallback, useState } from "react";
import { animate, stagger } from "animejs";
import Image from "next/image";

const RARITY_BORDER = {
  Common:       "border-gray-600",
  Uncommon:     "border-emerald-600",
  Rare:         "border-blue-500",
  "Rare Holo":  "border-blue-400",
  "Ultra Rare": "border-brand-highlight",
  "Rare Secret":"border-purple-500",
};

const RARITY_GLOW = {
  Common:       "rgba(150,150,150,0.22)",
  Uncommon:     "rgba(16,185,129,0.28)",
  Rare:         "rgba(59,130,246,0.38)",
  "Rare Holo":  "rgba(96,165,250,0.42)",
  "Ultra Rare": "rgba(255,195,0,0.45)",
  "Rare Secret":"rgba(168,85,247,0.45)",
};

function rarityBorder(rarity) {
  return RARITY_BORDER[rarity] ?? RARITY_BORDER.Common;
}

function rarityGlow(rarity) {
  return RARITY_GLOW[rarity] ?? RARITY_GLOW.Common;
}

function CardThumb({ card, onClick }) {
  const border = rarityBorder(card.rarity);
  const glow   = rarityGlow(card.rarity);

  return (
    <button
      data-card
      onClick={() => onClick(card)}
      className="group flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-highlight rounded-xl"
    >
      <div className={`relative w-full aspect-[3/4] bg-card-bg rounded-xl border-2 ${border} overflow-hidden transition-transform duration-200 group-hover:-translate-y-1`}>
        {/* Glow overlay on hover */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ boxShadow: `0 0 18px ${glow}` }}
        />
        <Image
          src={card.image_small}
          alt={card.name}
          fill
          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {card.quantity > 1 && (
          <span className="absolute top-1 right-1 bg-brand-highlight text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
            {card.quantity}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center line-clamp-2 w-full px-1 group-hover:text-gray-200 transition-colors duration-200">
        {card.name}
      </p>
    </button>
  );
}

export default function CollectionAccordion({ groups, onCardClick }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  // Callback ref: stagger cards into view when section mounts
  const animateGrid = useCallback((el) => {
    if (!el) return;
    animate(el.querySelectorAll("[data-card]"), {
      translateY: [20, 0],
      opacity:    [0, 1],
      delay:      stagger(35),
      duration:   260,
      ease:       "outBack",
    });
  }, []);

  return (
    <div className="space-y-3">
      {groups.map((group, i) => (
        <div
          key={group.setName}
          className="rounded-2xl overflow-hidden border border-ui-border/60 bg-gradient-to-b from-card-bg to-app"
        >
          {/* Set header */}
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-highlight flex-shrink-0" />
              <span className="font-bold text-white font-display text-base">
                {group.setName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-ui-border/40 text-gray-300 tabular-nums">
                {group.cards.length} carta{group.cards.length !== 1 ? "s" : ""}
              </span>
              {/* Chevron */}
              <svg
                className={`w-4 h-4 text-brand-highlight flex-shrink-0 transition-transform duration-200 ${openIndex === i ? "rotate-180" : "rotate-0"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Card grid */}
          {openIndex === i && (
            <div ref={animateGrid} className="px-5 pb-5 pt-1">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {group.cards.map((card) => (
                  <CardThumb
                    key={card.card_id}
                    card={card}
                    onClick={onCardClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
