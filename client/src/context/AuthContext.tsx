import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import api from "../services/api";
import type { ApiResponse, AuthContextType, User } from "../types";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("spendwise_token"));
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<ApiResponse<User>>("/auth/me");
        setUser(response.data.data);
      } catch {
        localStorage.removeItem("spendwise_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  const login = async (newToken: string, userData?: User) => {
    localStorage.setItem("spendwise_token", newToken);
    setToken(newToken);

    if (userData) {
      setUser(userData);
      return;
    }

    const response = await api.get<ApiResponse<User>>("/auth/me");
    setUser(response.data.data);
  };

  const logout = () => {
    localStorage.removeItem("spendwise_token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, token, login, logout, isAuthenticated, isLoading }),
    [user, token, isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
