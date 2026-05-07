"use client";
import { useState } from "react";
import { claimDaily } from "@/lib/api/packs";

export default function DailyClaimBanner({ user, onClaimed }) {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState(null);

  const canClaim = () => {
    if (!user?.last_daily_claim) return true;
    const hours =
      (Date.now() - new Date(user.last_daily_claim).getTime()) / 3_600_000;
    return hours >= 24;
  };

  const available = canClaim();

  if (!available || claimed) return null;

  const nextStreakCoins = Math.min(((user?.daily_streak || 0) + 1) * 100, 1000);

  const handleClaim = async () => {
    setLoading(true);
    setClaimError(null);
    try {
      const result = await claimDaily();
      onClaimed(result.total_coins);
      setClaimed(true);
    } catch (err) {
      setClaimError("No se pudo reclamar. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClaim}
        disabled={loading}
        className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors bg-brand-highlight text-black hover:bg-brand-primary disabled:opacity-50"
        title={`Racha actual: ${user?.daily_streak || 0} días`}
      >
        {loading ? "..." : `Reclamar +${nextStreakCoins} 🪙`}
      </button>
      {claimError && <p className="text-red-400 text-xs">{claimError}</p>}
    </div>
  );
}
