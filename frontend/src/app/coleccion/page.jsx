"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserCollection } from "@/lib/api/collection";
import CollectionAccordion from "./_components/CollectionAccordion";
import CardModal from "./_components/CardModal";
import Link from "next/link";

function groupBySet(cards) {
  const map = new Map();
  for (const card of cards) {
    if (!map.has(card.set_name)) map.set(card.set_name, []);
    map.get(card.set_name).push(card);
  }
  return Array.from(map, ([setName, cards]) => ({ setName, cards }));
}

function computeStats(groups) {
  let totalCards = 0;
  let totalCopies = 0;
  let totalValue = 0;

  for (const { cards } of groups) {
    totalCards += cards.length;
    for (const card of cards) {
      totalCopies += card.quantity;
      if (card.last_price_eur != null) {
        totalValue += Number(card.last_price_eur) * card.quantity;
      }
    }
  }

  return {
    sets:    groups.length,
    cards:   totalCards,
    copies:  totalCopies,
    value:   totalValue.toFixed(2),
  };
}

function StatBadge({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-5 py-3 rounded-xl bg-card-bg border border-ui-border/60">
      <span className="text-2xl font-bold text-brand-highlight tabular-nums font-display">{value}</span>
      <span className="text-xs text-gray-400 whitespace-nowrap">{label}</span>
    </div>
  );
}

export default function ColeccionPage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      setLoading(false);
      return;
    }
    getUserCollection()
      .then((cards) => setGroups(groupBySet(cards)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authLoading, authUser]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-card-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-highlight border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">Cargando colección...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-card-bg flex flex-col items-center justify-center gap-4">
        <p className="text-white text-xl">
          Debes iniciar sesión para ver tu colección
        </p>
        <a
          href="/login?from=%2Fcoleccion"
          className="px-6 py-2 bg-brand-highlight text-black font-bold rounded-lg hover:bg-brand-primary transition-colors cursor-pointer"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  const stats = computeStats(groups);

  return (
    <div className="min-h-screen bg-card-bg text-gray-200 scanlines">
      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-primary font-display mb-1">
            Mi Colección
          </h1>
          <p className="text-gray-400 text-sm">
            Tus cartas Pokémon TCG organizadas por expansión
          </p>
        </div>

        {error && <p className="text-red-400 mb-6">{error}</p>}

        {/* Stats bar */}
        {!error && groups.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            <StatBadge label="expansiones" value={stats.sets} />
            <StatBadge label="cartas únicas" value={stats.cards} />
            <StatBadge label="copias totales" value={stats.copies} />
            <StatBadge label="valor estimado" value={`${stats.value} €`} />
          </div>
        )}

        {/* Empty state */}
        {!error && groups.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-6xl mb-4 opacity-30 select-none">🃏</div>
            <p className="text-gray-300 text-lg font-medium">
              Aún no tienes cartas en tu colección
            </p>
            <p className="text-gray-500 text-sm">
              Abre sobres para empezar a coleccionar
            </p>
            <Link
              href="/pack-opener"
              className="inline-block mt-2 px-6 py-2.5 bg-brand-highlight text-black font-bold rounded-xl hover:bg-brand-primary transition-colors cursor-pointer"
            >
              Abrir sobres
            </Link>
          </div>
        ) : !error ? (
          <CollectionAccordion groups={groups} onCardClick={setSelectedCard} />
        ) : null}
      </div>
    </div>
  );
}
