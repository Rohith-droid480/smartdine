'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, LoginPayload, SignupPayload } from '@smartdine/shared/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<{ success: boolean; error?: string }>;
  signup: (payload: SignupPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'smartdine_customer_token';
const REFRESH_KEY = 'smartdine_customer_refresh_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (refreshToken) {
        api.auth.logout(refreshToken).catch(() => {});
      }
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe(savedToken);
      if (res.success && res.data) {
        setUser(res.data);
        setToken(savedToken);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginPayload) => {
    try {
      const res = await api.auth.login(credentials);
      if (res.success && res.data?.tokens?.accessToken) {
        const { accessToken, refreshToken } = res.data.tokens;
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, accessToken);
          localStorage.setItem(REFRESH_KEY, refreshToken);
        }
        setToken(accessToken);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: res.error ?? 'Login failed. Please check credentials.' };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message ?? 'Network error during login' };
    }
  };

  const signup = async (payload: SignupPayload) => {
    try {
      const res = await api.auth.signup(payload);
      if (res.success) {
        return { success: true };
      }
      return { success: false, error: res.error ?? 'Signup failed' };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message ?? 'Network error during signup' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
