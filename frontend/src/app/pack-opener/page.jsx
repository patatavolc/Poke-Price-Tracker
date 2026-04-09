"use client";
import { useState, useEffect } from "react";
import SetGrid from "./_components/SetGrid";
import PackOpeningModal from "./_components/PackOpeningModal";
import DailyClaimBanner from "./_components/DailyClaimBanner";
import { fetchAvailableSets, openPack, getMe } from "@/lib/api/packs";
import { useAuth } from "@/context/AuthContext";

export default function PackOpenerPage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState(null);
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openingCards, setOpeningCards] = useState(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      setLoading(false);
      return;
    }
    Promise.all([getMe(), fetchAvailableSets()])
      .then(([userData, setsData]) => {
        setUser(userData);
        setSets(setsData);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [authLoading, authUser]);

  const handleOpenPack = async () => {
    if (!selectedSet || opening) return;
    setOpening(true);
    setError(null);
    try {
      const result = await openPack(selectedSet.id);
      setUser((u) => ({ ...u, coins: result.remaining_coins }));
      setOpeningCards(result.cards);
    } catch (err) {
      setError(err.message);
    } finally {
      setOpening(false);
    }
  };

  const handleOpenAnother = async () => {
    setOpeningCards(null);
    setOpening(true);
    setError(null);
    try {
      const result = await openPack(selectedSet.id);
      setUser((u) => ({ ...u, coins: result.remaining_coins }));
      setOpeningCards(result.cards);
    } catch (err) {
      setError(err.message);
    } finally {
      setOpening(false);
    }
  };

  const handleExit = () => {
    setOpeningCards(null);
    setSelectedSet(null);
  };

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
          Debes iniciar sesión para abrir sobres
        </p>
        <a
          href="/login?from=%2Fpack-opener"
          className="px-6 py-2 bg-brand-highlight text-black font-bold rounded-lg hover:bg-brand-primary transition-colors"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card-bg text-gray-200">
      {openingCards && (
        <PackOpeningModal
          cards={openingCards}
          onOpenAnother={handleOpenAnother}
          onExit={handleExit}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-brand-primary font-display">
            Abrir Sobres
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-brand-highlight font-semibold">
              🪙 {user?.coins ?? 0} monedas
            </span>
            <DailyClaimBanner
              user={user}
              onClaimed={(coins) => setUser((u) => ({ ...u, coins }))}
            />
          </div>
        </div>

        {/* Grid de sets */}
        <SetGrid
          sets={sets}
          selectedSetId={selectedSet?.id}
          onSelect={setSelectedSet}
        />

        {/* Panel de apertura */}
        {selectedSet && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-gray-300">
              Set seleccionado:{" "}
              <span className="text-brand-highlight font-semibold">
                {selectedSet.name}
              </span>
            </p>
            <button
              onClick={handleOpenPack}
              disabled={opening || (user?.coins ?? 0) < 100}
              className="px-8 py-3 bg-brand-highlight text-black font-bold text-lg rounded-xl hover:bg-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {opening ? "Abriendo..." : "Abrir Sobre — 100 🪙"}
            </button>
            {(user?.coins ?? 0) < 100 && (
              <p className="text-red-400 text-sm">
                Monedas insuficientes. Reclama tu recompensa diaria.
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="mt-6 text-center text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
