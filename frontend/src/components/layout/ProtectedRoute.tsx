'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Spinner } from '@/components/ui/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('super_admin' | 'store_owner')[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, isSuperAdmin, isStoreOwner } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(redirectTo);
        return;
      }
      if (allowedRoles && allowedRoles.length > 0) {
        const hasAccess = allowedRoles.some(
          (role) => (role === 'super_admin' && isSuperAdmin) || (role === 'store_owner' && isStoreOwner)
        );
        if (!hasAccess) {
          router.replace(isSuperAdmin ? '/admin' : '/dashboard');
        }
      }
    }
  }, [user, loading, allowedRoles, isSuperAdmin, isStoreOwner, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some(
      (role) => (role === 'super_admin' && isSuperAdmin) || (role === 'store_owner' && isStoreOwner)
    );
    if (!hasAccess) return null;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({
  children,
  redirectTo = '/dashboard',
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { user, loading, isSuperAdmin } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace(isSuperAdmin ? '/admin' : redirectTo);
    }
  }, [user, loading, isSuperAdmin, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) return null;

  return <>{children}</>;
}
