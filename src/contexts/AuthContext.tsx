'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { AuthUser } from '@/types';

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) {
        setCurrentUser(null);
        return;
      }

      const result = await parseJson<{ success: boolean; data?: AuthUser }>(response);
      if (result.success && result.data) {
        setCurrentUser(result.data);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    };
    void load();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await parseJson<{ success: boolean; data?: AuthUser; error?: string }>(response);
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.error || 'Login failed');
    }
    setCurrentUser(result.data);
  };

  const signup = async (data: any) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await parseJson<{ success: boolean; data?: AuthUser; error?: string }>(response);
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.error || 'Signup failed');
    }
    setCurrentUser(result.data);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      currentUser,
      loading,
      isAdmin: currentUser?.role === 'admin',
      isAuthenticated: Boolean(currentUser),
      login,
      signup,
      logout,
      refreshUser,
    }),
    [currentUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

