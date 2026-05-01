import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@workspace/api-client-react";

interface AuthState {
  token: string | null;
  user: User | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem("civic_auth");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return { token: null, user: null };
      }
    }
    return { token: null, user: null };
  });

  const login = (token: string, user: User) => {
    const state = { token, user };
    setAuthState(state);
    localStorage.setItem("civic_auth", JSON.stringify(state));
  };

  const logout = () => {
    setAuthState({ token: null, user: null });
    localStorage.removeItem("civic_auth");
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
