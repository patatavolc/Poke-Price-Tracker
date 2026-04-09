# Auth: Login, Registro y Botón de Sesión en Navbar

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir autenticación client-side completa: AuthContext global, páginas de login y registro, botón de sesión en el Navbar, y mejora del estado no-autenticado en pack-opener.

**Architecture:** AuthContext almacena el usuario y token en `localStorage`, envuelve la app en `layout.jsx`. El Navbar lo consume para mostrar login/logout. Las páginas `/login` y `/registro` llaman a los endpoints existentes del backend y redirigen usando un query param `?from=<ruta>`.

**Tech Stack:** Next.js 14 (App Router), React Context API, JWT en localStorage, Tailwind CSS.

---

## Mapa de archivos

| Acción | Archivo |
|--------|---------|
| Crear | `frontend/src/lib/api/auth.js` |
| Crear | `frontend/src/context/AuthContext.jsx` |
| Modificar | `frontend/src/app/layout.jsx` |
| Modificar | `frontend/src/components/common/Navbar.jsx` |
| Crear | `frontend/src/app/login/page.jsx` |
| Crear | `frontend/src/app/registro/page.jsx` |
| Modificar | `frontend/src/app/pack-opener/page.jsx` |

---

### Task 1: Crear API de auth

**Files:**
- Create: `frontend/src/lib/api/auth.js`

- [ ] **Step 1: Crear el archivo**

```js
// frontend/src/lib/api/auth.js
const BASE = "/api";

export const loginUser = async ({ username, password }) => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");
  return data; // { user, token }
};

export const registerUser = async ({ username, password, name }) => {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al registrarse");
  return data; // { user, token }
};
```

---

### Task 2: Crear AuthContext

**Files:**
- Create: `frontend/src/context/AuthContext.jsx`

- [ ] **Step 1: Crear el contexto**

```jsx
// frontend/src/context/AuthContext.jsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

---

### Task 3: Envolver la app con AuthProvider

**Files:**
- Modify: `frontend/src/app/layout.jsx`

- [ ] **Step 1: Añadir AuthProvider**

Reemplazar el contenido de `layout.jsx` con:

```jsx
import { Inter, Exo_2 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { AuthProvider } from "@/context/AuthContext";

const fontMain = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const fontDisplay = Exo_2({
    subsets: ["latin"],
    variable: "--font-exo-2",
    display: "swap",
});

export const metadata = {
    title: "NOIDEX | Market & Packs",
    description:
        "Plataforma de analisis de precios TCG y simulador de apertura de sobres",
    icons: {
        icon: "/favicon.png",
    },
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="es"
            className={`${fontMain.variable} ${fontDisplay.variable}`}
        >
            <body className="min-h-screen flex flex-col">
                <AuthProvider>
                    <Navbar />
                    <main className="grow">{children}</main>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
}
```

---

### Task 4: Actualizar el Navbar

**Files:**
- Modify: `frontend/src/components/common/Navbar.jsx`

- [ ] **Step 1: Añadir estado de sesión al Navbar**

Reemplazar el contenido de `Navbar.jsx` con:

```jsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Input from "../ui/Input";
import Button from "../../../components/Button";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <div className="flex items-center justify-between p-4 bg-app shadow-md">
            <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center gap-0">
                    <Image
                        src="/brand/navbar-logo.png"
                        alt="Logo de NOIDEX"
                        width={150}
                        height={50}
                    />
                    <span className="text-4xl font-bold text-brand-primary">
                        Noidex
                    </span>
                </Link>
                <nav>
                    <ul className="flex space-x-4">
                        <li>
                            <Link
                                href="/market"
                                className="text-lg text-white hover:text-brand-highlight transition-colors"
                            >
                                Mercado
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/pack-opener"
                                className="text-lg text-white hover:text-brand-highlight transition-colors"
                            >
                                Packs
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/profile"
                                className="text-lg text-white hover:text-brand-highlight transition-colors"
                            >
                                Colleccion
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

            <div className="flex items-center space-x-2">
                <Input placeholder="Buscar..." />
                <Button className="primary ml-2">Buscar</Button>
                {user ? (
                    <div className="flex items-center gap-3 ml-2">
                        <span className="text-white font-semibold">
                            {user.username}
                        </span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm text-white border border-ui-border rounded-lg hover:bg-ui-border/30 transition-colors"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                ) : (
                    <Link
                        href={`/login?from=${pathname}`}
                        className="ml-2 px-4 py-2 text-sm font-semibold bg-brand-highlight text-black rounded-lg hover:bg-brand-primary transition-colors"
                    >
                        Iniciar sesión
                    </Link>
                )}
            </div>
        </div>
    );
}
```

---

### Task 5: Crear página de Login

**Files:**
- Create: `frontend/src/app/login/page.jsx`

- [ ] **Step 1: Crear la página**

```jsx
// frontend/src/app/login/page.jsx
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/api/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/pack-opener";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            <label className="text-sm text-gray-400">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="px-4 py-2 rounded-lg bg-card-bg border border-ui-border text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-highlight"
              placeholder="tu_usuario"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            href={`/registro?from=${from}`}
            className="text-brand-highlight hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

### Task 6: Crear página de Registro

**Files:**
- Create: `frontend/src/app/registro/page.jsx`

- [ ] **Step 1: Crear la página**

```jsx
// frontend/src/app/registro/page.jsx
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/api/auth";
import { useAuth } from "@/context/AuthContext";

export default function RegistroPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/pack-opener";

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user, token } = await registerUser({ username, password, name });
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
          Crear cuenta
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-4 py-2 rounded-lg bg-card-bg border border-ui-border text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-highlight"
              placeholder="Tu nombre"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="px-4 py-2 rounded-lg bg-card-bg border border-ui-border text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-highlight"
              placeholder="tu_usuario"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            href={`/login?from=${from}`}
            className="text-brand-highlight hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

### Task 7: Actualizar pack-opener — estado no autenticado

**Files:**
- Modify: `frontend/src/app/pack-opener/page.jsx`

- [ ] **Step 1: Cambiar el bloque `notAuth`**

Localizar el bloque:

```jsx
  if (notAuth) {
    return (
      <div className="min-h-screen bg-card-bg flex flex-col items-center justify-center gap-4">
        <p className="text-white text-xl">
          Debes iniciar sesión para abrir sobres
        </p>
        <a
          href="/"
          className="px-6 py-2 bg-brand-highlight text-black font-bold rounded-lg"
        >
          Ir al inicio
        </a>
      </div>
    );
  }
```

Reemplazarlo con:

```jsx
  if (notAuth) {
    return (
      <div className="min-h-screen bg-card-bg flex flex-col items-center justify-center gap-4">
        <p className="text-white text-xl">
          Debes iniciar sesión para abrir sobres
        </p>
        <a
          href="/login?from=/pack-opener"
          className="px-6 py-2 bg-brand-highlight text-black font-bold rounded-lg hover:bg-brand-primary transition-colors"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }
```
