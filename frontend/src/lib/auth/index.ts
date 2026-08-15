import { User, UserRole } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'biostore_access_token';
const REFRESH_TOKEN_KEY = 'biostore_refresh_token';
const USER_KEY = 'biostore_user';

export function getAuthTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  const { accessToken } = getAuthTokens();
  return !!accessToken;
}

export function getUserRole(): UserRole | null {
  const user = getStoredUser();
  return user?.role || null;
}

export function redirectBasedOnRole(): string {
  const role = getUserRole();
  if (role === 'super_admin') return '/admin';
  if (role === 'store_owner') return '/dashboard';
  return '/login';
}