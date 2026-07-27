'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials } from '@/lib/types';
import { login as apiLogin, getCurrentUser } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: () => {},
});

const AUTH_TOKEN_KEY = 'smartdine_staff_token';
const AUTH_USER_KEY = 'smartdine_staff_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state on client mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = localStorage.getItem(AUTH_USER_KEY);

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Fallback default session for demo/mock mode
        getCurrentUser().then((u) => {
          setUser(u);
          localStorage.setItem(AUTH_TOKEN_KEY, 'mock_jwt_token_gamma_admin_123456789');
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
        }).catch(() => {
          setUser(null);
        });
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler
  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const authRes = await apiLogin(credentials);
      setUser(authRes.user);
      localStorage.setItem(AUTH_TOKEN_KEY, authRes.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authRes.user));
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout handler
  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    router.push('/login');
  }, [router]);

  // Route protection guard
  useEffect(() => {
    if (loading) return;

    const isPublicRoute = pathname === '/login';

    if (!user && !isPublicRoute) {
      router.push('/login');
    } else if (user && isPublicRoute) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
