// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/authService";
import { setAccessToken } from "../api/client";
import { useToast } from "../hooks/useToast";

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
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("accessToken");

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          setAccessToken(storedToken);

          // Validate token by attempting to refresh it
          const refreshed = await AuthService.refreshToken();
          if (!refreshed) {
            // Refresh failed, clear auth state
            toast.error("Session expired. Please log in again.");
            setUser(null);
            setToken(null);
            setAccessToken(null);
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
          }
        } catch {
          // Any error, clear auth state
          toast.error("Session error. Please log in again.");
          setUser(null);
          setToken(null);
          setAccessToken(null);
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await AuthService.login({ email, password });
      setUser(data.user);
      setToken(data.accessToken);
      setAccessToken(data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accessToken", data.accessToken);
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const data = await AuthService.register({ name, email, password });
      setUser(data.user);
      setToken(data.accessToken);
      setAccessToken(data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accessToken", data.accessToken);
    } catch (error) {
      toast.error("Signup failed. Please try again.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      setAccessToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      toast.success("You have been logged out successfully.");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken: token, login, signup, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}
