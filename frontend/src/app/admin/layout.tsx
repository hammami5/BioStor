'use client';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { DashboardTopBar } from '@/components/layout/DashboardTopBar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['super_admin']} redirectTo="/login">
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:pl-64">
          <DashboardTopBar onMenuClick={() => {}} />
          <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
