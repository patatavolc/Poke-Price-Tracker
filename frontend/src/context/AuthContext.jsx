// frontend/src/context/AuthContext.jsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { refreshTokenApi } from "@/lib/api/auth";

const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const REFRESH_THRESHOLD_SECONDS = 24 * 60 * 60;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem("auth_user");
      const token = localStorage.getItem("token");

      if (!stored || !token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = JSON.parse(stored);
        const decoded = decodeToken(token);
        const now = Math.floor(Date.now() / 1000);

        if (decoded && decoded.exp - now < REFRESH_THRESHOLD_SECONDS) {
          try {
            const data = await refreshTokenApi(token);
            localStorage.setItem("token", data.token);
            localStorage.setItem("auth_user", JSON.stringify(data.user));
            setUser(data.user);
          } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("auth_user");
            setUser(null);
          }
        } else {
          setUser(userData);
        }
      } catch {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("token");
      }

      setIsLoading(false);
    };

    initAuth();
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
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
