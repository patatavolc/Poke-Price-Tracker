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
      <div className="min-h-screen bg-card-bg flex items-center justify-center text-white">
        Cargando...
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
          className="px-6 py-2 bg-brand-highlight text-black font-bold rounded-lg hover:bg-brand-primary transition-colors"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card-bg text-gray-200">
      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-brand-primary font-display mb-8">
          Mi Colección
        </h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {!error && groups.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-gray-400 text-lg">
              Aún no tienes cartas en tu colección.
            </p>
            <Link
              href="/pack-opener"
              className="inline-block px-6 py-2 bg-brand-highlight text-black font-bold rounded-lg hover:bg-brand-primary transition-colors"
            >
              ¡Abre algunos sobres!
            </Link>
          </div>
        ) : !error ? (
          <CollectionAccordion
            groups={groups}
            onCardClick={setSelectedCard}
          />
        ) : null}
      </div>
    </div>
  );
}
