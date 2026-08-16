'use client';

import { ThemeProvider } from '@/lib/utils/theme-provider';
import { AuthProvider } from '@/lib/auth/context';
import { ToastProvider } from '@/components/ui/Toast';
import { I18nProvider } from '@/lib/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
