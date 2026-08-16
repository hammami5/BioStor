'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Store, ShoppingCart, Sparkles, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Badge';
import { useTranslation } from '@/lib/i18n';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const adminNavigation = [
    { name: t.dashboard_overview, href: '/admin', icon: LayoutDashboard },
    { name: t.admin_stores, href: '/admin/stores', icon: Store },
    { name: t.admin_users, href: '/admin/users', icon: Users },
    { name: t.admin_orders, href: '/admin/orders', icon: ShoppingCart },
    { name: t.admin_plans, href: '/admin/plans', icon: Sparkles },
    { name: t.admin_subscriptions, href: '/admin/subscriptions', icon: Sparkles },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 w-64 h-screen bg-card border-r border-border overflow-y-auto no-scrollbar hidden lg:block">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-sm font-bold leading-none">
              Bio<span className="gradient-text">Stor</span>
            </span>
            <span className="block text-[10px] text-red-400/80 mt-0.5 uppercase tracking-widest">
              {t.nav_admin}
            </span>
          </div>
        </Link>
      </div>
      <nav className="p-4 space-y-0.5" aria-label="Admin navigation">
        {adminNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 inset-x-0 p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <Avatar
            size="sm"
            fallback={(user?.full_name || 'A').charAt(0).toUpperCase()}
            className="bg-red-500/15 text-red-400"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name || t.admin_super_admin}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
          {t.settings_sign_out}
        </button>
      </div>
    </aside>
  );
}
