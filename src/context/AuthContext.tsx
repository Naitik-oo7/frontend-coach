// src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";
import { apiPost, setAccessToken } from "../api/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const data = await apiPost("/auth/login", { email, password });

    setUser(data.user);
    setToken(data.accessToken);
    setAccessToken(data.accessToken);
  };

  const logout = async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken: token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}
