"use client";
import { useState } from "react";
import { claimDaily } from "@/lib/api/packs";

/**
 * Props:
 * - user: { daily_streak, last_daily_claim, coins }
 * - onClaimed: (newTotalCoins) => void
 */
export default function DailyClaimBanner({ user, onClaimed }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const canClaim = () => {
    if (!user?.last_daily_claim) return true;
    const hours =
      (Date.now() - new Date(user.last_daily_claim).getTime()) / 3_600_000;
    return hours >= 24;
  };

  const nextStreakCoins = Math.min(((user?.daily_streak || 0) + 1) * 100, 1000);
  const available = canClaim();

  const handleClaim = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await claimDaily();
      setMessage(`+${result.coins_earned} 🪙 · Racha: ${result.new_streak} días`);
      onClaimed(result.total_coins);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClaim}
        disabled={!available || loading}
        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
          available
            ? "bg-brand-highlight text-black hover:bg-brand-primary"
            : "bg-ui-border text-gray-500 cursor-not-allowed"
        }`}
        title={
          available
            ? `Racha actual: ${user?.daily_streak || 0} días`
            : "Vuelve mañana"
        }
      >
        {loading
          ? "..."
          : available
          ? `Reclamar +${nextStreakCoins} 🪙`
          : "Vuelve mañana"}
      </button>
      {message && <span className="text-sm text-gray-300">{message}</span>}
    </div>
  );
}
