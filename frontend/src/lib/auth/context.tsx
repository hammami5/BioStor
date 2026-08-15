'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, UserRole } from '@/types/auth';
import { api } from '@/lib/api/client';
import { getAuthTokens, setAuthTokens, clearAuthTokens, getStoredUser, setStoredUser, isAuthenticated, redirectBasedOnRole } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    full_name: string;
    email: string;
    password: string;
    store_name: string;
    username: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isStoreOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        setUser(null);
        return;
      }
      const userData = await api.getMe();
      setUser(userData);
      setStoredUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      clearAuthTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        await refreshUser();
      }
      setLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const tokens = await api.login({ email, password });
    setAuthTokens(tokens.access_token, tokens.refresh_token);
    await refreshUser();
  };

  const register = async (data: {
    full_name: string;
    email: string;
    password: string;
    store_name: string;
    username: string;
  }) => {
    const tokens = await api.register(data);
    setAuthTokens(tokens.access_token, tokens.refresh_token);
    await refreshUser();
  };

  const logout = async () => {
    const { refreshToken } = getAuthTokens();
    if (refreshToken) {
      try {
        await api.logout(refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    clearAuthTokens();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
    isStoreOwner: user?.role === 'store_owner',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(redirectTo = '/login') {
  const { user, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShouldRedirect(true);
    }
  }, [user, loading]);

  if (shouldRedirect) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return { user: null, loading: true };
  }

  return { user, loading };
}

export function useRequireRole(allowedRoles: UserRole[], redirectTo = '/') {
  const { user, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || !allowedRoles.includes(user.role)) {
        setShouldRedirect(true);
      }
    }
  }, [user, loading, allowedRoles]);

  if (shouldRedirect) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return { user: null, loading: true };
  }

  return { user, loading };
}