'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Bell, ExternalLink, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Badge';

interface DashboardTopBarProps {
  onMenuClick: () => void;
}

export function DashboardTopBar({ onMenuClick }: DashboardTopBarProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const store = user?.store;
  const storeUrl = store ? `/store/${store.slug}` : null;

  useEffect(() => {
    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const data = await api.unreadNotifications();
        if (!cancelled) setUnread(data.count ?? 0);
      } catch {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  const pageTitle = pathname === '/dashboard' ? t.dashboard_overview : '';

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="flex h-full items-center gap-3 px-4 lg:px-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden">
          <Link href="/dashboard" className="text-lg font-bold">
            Bio<span className="gradient-text">Stor</span>
          </Link>
        </div>

        {pageTitle && (
          <h1 className="hidden lg:block text-lg font-semibold">{pageTitle}</h1>
        )}

        <div className="flex-1" />

        {storeUrl && (
          <Link
            href={storeUrl}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t.store_preview}
          </Link>
        )}

        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-semibold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted transition-colors"
          >
            <Avatar
              size="sm"
              fallback={(user?.full_name || 'U').charAt(0).toUpperCase()}
              className="bg-primary/15 text-primary"
            />
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-popover border border-border shadow-soft z-50 p-1.5 animate-scale-in">
                <div className="px-3 py-2.5 border-b border-border mb-1.5">
                  <p className="text-sm font-medium truncate">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm hover:bg-muted"
                >
                  {t.settings_account}
                </Link>
                {storeUrl && (
                  <Link
                    href={storeUrl}
                    target="_blank"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm hover:bg-muted"
                  >
                    {t.store_preview}
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
                >
                  {t.nav_logout}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
