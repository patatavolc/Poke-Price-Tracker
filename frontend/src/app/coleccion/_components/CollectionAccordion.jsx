"use client";
import { useState } from "react";
import Image from "next/image";

function CardThumb({ card, onClick }) {
  return (
    <button
      onClick={() => onClick(card)}
      className="group flex flex-col items-center gap-1 focus:outline-none"
    >
      <div className="relative w-full aspect-[3/4] bg-card-bg rounded-lg border border-ui-border overflow-hidden group-hover:border-brand-primary group-hover:shadow-[0_0_12px_rgba(255,195,0,0.2)] transition-all">
        <Image
          src={card.image_small}
          alt={card.name}
          fill
          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {card.quantity > 1 && (
          <span className="absolute top-1 right-1 bg-brand-highlight text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {card.quantity}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-300 text-center line-clamp-2 w-full px-1">
        {card.name}
      </p>
    </button>
  );
}

export default function CollectionAccordion({ groups, onCardClick }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="space-y-3">
      {groups.map((group, i) => (
        <div
          key={group.setName}
          className="border border-ui-border rounded-xl overflow-hidden"
        >
          {/* Cabecera del set */}
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between px-5 py-4 bg-app hover:bg-ui-border/20 transition-colors text-left"
          >
            <span className="font-bold text-white font-display">
              {group.setName}
            </span>
            <span className="text-sm text-gray-400">
              {group.cards.length} carta{group.cards.length !== 1 ? "s" : ""}
              <span className="ml-3 text-brand-highlight">
                {openIndex === i ? "▲" : "▼"}
              </span>
            </span>
          </button>

          {/* Grid de cartas */}
          {openIndex === i && (
            <div className="bg-card-bg px-5 py-4">
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
