"use client";
import { useEffect, useRef } from "react";
import { animate } from "animejs";
import Image from "next/image";
import Link from "next/link";

const RARITY_BORDER = {
  Common:        "border-gray-600",
  Uncommon:      "border-emerald-600",
  Rare:          "border-blue-500",
  "Rare Holo":   "border-blue-400",
  "Ultra Rare":  "border-brand-highlight",
  "Rare Secret": "border-purple-500",
};

const RARITY_GLOW = {
  Common:        "",
  Uncommon:      "0 0 28px rgba(16,185,129,0.2)",
  Rare:          "0 0 28px rgba(59,130,246,0.22)",
  "Rare Holo":   "0 0 28px rgba(96,165,250,0.25)",
  "Ultra Rare":  "0 0 36px rgba(255,195,0,0.25)",
  "Rare Secret": "0 0 36px rgba(168,85,247,0.28)",
};

const RARITY_BADGE = {
  Common:        "bg-gray-700 text-gray-200",
  Uncommon:      "bg-emerald-800 text-emerald-200",
  Rare:          "bg-blue-800 text-blue-200",
  "Rare Holo":   "bg-blue-700 text-blue-100",
  "Ultra Rare":  "bg-brand-highlight text-black",
  "Rare Secret": "bg-purple-800 text-purple-200",
};

export default function CardModal({ card, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) {
      animate(modalRef.current, {
        scale:   [0.88, 1],
        opacity: [0, 1],
        duration: 240,
        ease: "outBack",
      });
    }
  }, []);

  if (!card) return null;

  const price =
    card.last_price_eur !== null && card.last_price_eur !== undefined
      ? Number(card.last_price_eur).toFixed(2)
      : null;

  const borderClass = RARITY_BORDER[card.rarity] ?? RARITY_BORDER.Common;
  const glowStyle   = RARITY_GLOW[card.rarity]   ?? "";
  const badgeClass  = RARITY_BADGE[card.rarity]  ?? RARITY_BADGE.Common;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`relative bg-app border-2 ${borderClass} rounded-2xl p-6 max-w-sm w-full mx-4 flex flex-col items-center gap-4 opacity-0`}
        style={{ boxShadow: glowStyle || undefined }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-ui-border/40 hover:bg-ui-border transition-colors cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Card image */}
        <div className="relative w-52 aspect-[3/4]">
          <Image
            src={card.image_small}
            alt={card.name}
            fill
            className="object-contain drop-shadow-2xl"
            sizes="208px"
          />
        </div>

        {/* Name + rarity + set */}
        <div className="w-full text-center space-y-2">
          <h2 className="text-xl font-bold text-white font-display leading-tight">
            {card.name}
          </h2>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
              {card.rarity}
            </span>
            <span className="text-xs text-gray-400">{card.set_name}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 items-center w-full justify-center">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-0.5">En tu colección</p>
            <p className="text-white font-bold text-2xl tabular-nums">{card.quantity}</p>
          </div>
          <div className="w-px h-10 bg-ui-border" />
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-0.5">Precio</p>
            <p className="text-brand-primary font-bold text-2xl tabular-nums">
              {price !== null ? `${price} €` : "—"}
            </p>
          </div>
        </div>

        <Link
          href={`/market/${card.card_id}`}
          className="w-full text-center py-2.5 px-4 bg-brand-highlight text-black font-bold rounded-xl hover:bg-brand-primary transition-colors cursor-pointer"
        >
          Ver en el mercado
        </Link>
      </div>
    </div>
  );
}
