'use client';

import { ThemeProvider } from '@/lib/utils/theme-provider';
import { AuthProvider } from '@/lib/auth/context';
import { ToastProvider } from '@/components/ui/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
