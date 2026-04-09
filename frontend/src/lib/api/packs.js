const BASE = "/api";

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchAvailableSets = async () => {
  const res = await fetch(`${BASE}/packs/available-sets`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener sets");
  return res.json();
};

export const openPack = async (setId) => {
  const res = await fetch(`${BASE}/packs/open`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ set_id: setId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al abrir sobre");
  return data;
};

/**
 * Usa el endpoint /api/auth/me existente, que devuelve
 * id, username, name, role, coins, daily_streak, last_daily_claim
 */
export const getMe = async () => {
  const res = await fetch(`${BASE}/auth/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error("No autenticado");
  return res.json();
};

export const claimDaily = async () => {
  const res = await fetch(`${BASE}/users/daily-claim`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al reclamar");
  return data;
};
