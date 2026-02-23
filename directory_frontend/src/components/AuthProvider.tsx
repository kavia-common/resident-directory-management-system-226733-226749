"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import {
  AuthUser,
  clearSession,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from "@/lib/auth";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (params: { username: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type LoginResponse = {
  access_token: string;
  token_type?: string;
  user?: AuthUser;
};

async function tryLoginFallback(
  username: string,
  password: string,
): Promise<LoginResponse> {
  // Backend API spec is not present; attempt common patterns:
  // 1) POST /auth/login JSON
  try {
    return await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    // 2) POST /login JSON
    return await apiFetch<LoginResponse>("/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  }
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }: { children: React.ReactNode }) {
  /** Client-side auth context for token + role-aware UI. */
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const login = useCallback(async ({ username, password }: { username: string; password: string }) => {
    const res = await tryLoginFallback(username, password);
    setStoredToken(res.access_token);
    setToken(res.access_token);

    // Prefer server-provided user info; else infer role heuristically (default viewer)
    const u: AuthUser = res.user || { username, role: "viewer" };
    setStoredUser(u);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = Boolean(token);
    const isAdmin = user?.role === "admin";
    return { token, user, isAuthenticated, isAdmin, login, logout };
  }, [token, user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth(): AuthContextValue {
  /** Hook to read auth state/actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
