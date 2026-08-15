'use client';

import { PublicOnlyRoute } from '@/components/layout/ProtectedRoute';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicOnlyRoute>{children}</PublicOnlyRoute>;
}