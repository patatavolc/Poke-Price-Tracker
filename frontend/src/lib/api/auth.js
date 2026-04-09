// frontend/src/lib/api/auth.js
const BASE = "/api";

export const loginUser = async ({ username, password }) => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    let msg;
    try { msg = (await res.json()).error; } catch {}
    throw new Error(msg || "Error al iniciar sesión");
  }
  return res.json(); // { user, token }
};

export const registerUser = async ({ username, password, name }) => {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, name }),
  });
  if (!res.ok) {
    let msg;
    try { msg = (await res.json()).error; } catch {}
    throw new Error(msg || "Error al registrarse");
  }
  return res.json(); // { user, token }
};
