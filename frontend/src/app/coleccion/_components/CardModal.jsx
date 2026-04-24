"use client";
import Image from "next/image";
import Link from "next/link";

export default function CardModal({ card, onClose }) {
  if (!card) return null;

  const price =
    card.last_price_eur !== null && card.last_price_eur !== undefined
      ? Number(card.last_price_eur).toFixed(2)
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative bg-app border border-ui-border rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors text-xl leading-none"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Imagen */}
        <div className="relative w-48 h-64">
          <Image
            src={card.image_small}
            alt={card.name}
            fill
            className="object-contain drop-shadow-xl"
            sizes="192px"
          />
        </div>

        {/* Datos */}
        <div className="w-full text-center space-y-1">
          <h2 className="text-xl font-bold text-white font-display">
            {card.name}
          </h2>
          <p className="text-sm text-gray-400">{card.rarity}</p>
          <p className="text-sm text-gray-300">{card.set_name}</p>
        </div>

        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <p className="text-gray-400">En tu colección</p>
            <p className="text-white font-bold text-lg">{card.quantity}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Precio</p>
            <p className="text-brand-primary font-bold text-lg">
              {price !== null ? `${price} €` : "—"}
            </p>
          </div>
        </div>

        <Link
          href={`/market/${card.card_id}`}
          className="w-full text-center py-2 px-4 bg-brand-highlight text-black font-bold rounded-xl hover:bg-brand-primary transition-colors"
        >
          Ver en el mercado
        </Link>
      </div>
    </div>
  );
}
