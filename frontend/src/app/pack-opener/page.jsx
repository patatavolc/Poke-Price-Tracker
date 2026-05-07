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

  const doOpenPack = async () => {
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

  const handleOpenPack = () => {
    if (!selectedSet || opening) return;
    doOpenPack();
  };

  const handleOpenAnother = () => {
    setOpeningCards(null);
    doOpenPack();
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

      {/* Hero header */}
      <div className="w-full bg-gradient-to-b from-[#001030] to-card-bg border-b border-ui-border py-10 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-brand-primary font-display leading-tight">
              Abrir Sobres
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Elige un set, gasta tus monedas y descubre qué cartas te tocan
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#001B3A] border border-ui-border rounded-xl px-4 py-2">
              <span className="text-2xl leading-none">🪙</span>
              <div className="flex flex-col leading-tight">
                <span className="text-brand-highlight font-bold text-lg">{user?.coins ?? 0}</span>
                <span className="text-gray-500 text-xs">monedas</span>
              </div>
            </div>
            <DailyClaimBanner
              user={user}
              onClaimed={(coins) => setUser((u) => ({ ...u, coins }))}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Section label */}
        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-5">
          Selecciona un set
        </p>

        {/* Grid de sets */}
        <SetGrid
          sets={sets}
          selectedSetId={selectedSet?.id}
          onSelect={setSelectedSet}
        />

        {/* Panel de apertura */}
        {selectedSet && (
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="bg-[#001B3A] border border-ui-border rounded-2xl px-8 py-6 flex flex-col items-center gap-4 w-full max-w-sm shadow-lg">
              <p className="text-gray-400 text-sm">Set seleccionado</p>
              <p className="text-brand-highlight font-bold text-lg text-center">{selectedSet.name}</p>
              <button
                onClick={handleOpenPack}
                disabled={opening || (user?.coins ?? 0) < 100}
                className="w-full px-8 py-3 bg-brand-highlight text-black font-bold text-lg rounded-xl hover:bg-brand-primary transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,195,0,0.25)] hover:shadow-[0_0_25px_rgba(255,195,0,0.45)]"
              >
                {opening ? "Abriendo..." : "Abrir Sobre — 100 🪙"}
              </button>
              {(user?.coins ?? 0) < 100 && (
                <p className="text-red-400 text-xs text-center">
                  Monedas insuficientes. Reclama tu recompensa diaria.
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-6 text-center text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
