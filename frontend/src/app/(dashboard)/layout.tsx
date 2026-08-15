'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardTopBar } from '@/components/layout/DashboardTopBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['store_owner']} redirectTo="/login">
      <div className="min-h-screen bg-background">
        <DashboardSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="lg:pl-64">
          <DashboardTopBar onMenuClick={() => setMenuOpen(true)} />
          <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
