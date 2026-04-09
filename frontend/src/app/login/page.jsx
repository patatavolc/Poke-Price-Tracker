"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/api/auth";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = decodeURIComponent(searchParams.get("from") || "/pack-opener");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError(null);
    setLoading(true);
    try {
      const { user, token } = await loginUser({ username, password });
      login(token, user);
      router.push(from);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-app rounded-2xl p-8 shadow-xl border border-ui-border">
        <h1 className="text-2xl font-bold text-white font-display mb-6 text-center">
          Iniciar sesión
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm text-gray-400">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="px-4 py-2 rounded-lg bg-card-bg border border-ui-border text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-highlight"
              placeholder="tu_usuario"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-400">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="px-4 py-2 rounded-lg bg-card-bg border border-ui-border text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-highlight"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 bg-brand-highlight text-black font-bold rounded-lg hover:bg-brand-primary transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          ¿No tienes cuenta?{" "}
          <Link
            href={`/registro?from=${encodeURIComponent(from)}`}
            className="text-brand-highlight hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-card-bg" />}>
      <LoginForm />
    </Suspense>
  );
}
