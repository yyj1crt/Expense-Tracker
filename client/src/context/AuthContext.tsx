import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import api from "../services/api";
import type { ApiResponse, AuthContextType, User } from "../types";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<ApiResponse<User>>("/api/auth/me");
        setUser(response.data.data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const response = await api.post<ApiResponse<{ token: string; user: User }>>("/api/auth/login", {
        email,
        password,
      });

      const result = response.data.data;
      if (!result?.token) {
        return "Invalid login response from server.";
      }

      localStorage.setItem("token", result.token);
      setToken(result.token);
      setUser(result.user);

      return null;
    } catch (error: any) {
      if (error.response?.data?.message) {
        return error.response.data.message;
      }

      if (error.response?.status === 401 || error.response?.status === 400) {
        return "Invalid email or password.";
      }

      return error.message || "Login failed. Please try again.";
    }
  };

  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      const response = await api.post<ApiResponse<{ token?: string; user?: User }>>("/api/auth/register", {
        name,
        email,
        password,
      });

      // If server returns token and user, save and set auth state so user is logged in immediately.
      const result = response.data?.data as { token?: string; user?: User } | undefined;
      if (result?.token) {
        localStorage.setItem("token", result.token);
        setToken(result.token);
      }
      if (result?.user) {
        setUser(result.user);
      }

      if (response.status === 201 || response.status === 200) {
        return null;
      }

      return "Registration failed. Please try again.";
    } catch (error: any) {
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
      if (error.response?.status === 409) {
        return "Email already registered.";
      }
      return error.message || "Registration failed. Please try again.";
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, token, login, register, logout, isAuthenticated, isLoading }),
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
