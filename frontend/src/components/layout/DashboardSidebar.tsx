'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  Store as StoreIcon,
  LogOut,
  Bell,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Badge';

interface DashboardSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ open = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const sections = [
    {
      label: t.dashboard_overview,
      items: [
        { name: t.nav_dashboard, href: '/dashboard', icon: LayoutDashboard },
        { name: t.nav_products, href: '/dashboard/products', icon: Package },
        { name: t.nav_orders, href: '/dashboard/orders', icon: ShoppingCart },
        { name: t.nav_customers, href: '/dashboard/customers', icon: Users },
      ],
    },
    {
      label: t.analytics_revenue,
      items: [
        { name: t.nav_analytics, href: '/dashboard/analytics', icon: BarChart3 },
        { name: t.nav_notifications, href: '/dashboard/notifications', icon: Bell },
      ],
    },
    {
      label: t.settings_title,
      items: [
        { name: t.nav_store, href: '/dashboard/store', icon: StoreIcon },
        { name: t.nav_subscription, href: '/dashboard/subscription', icon: Sparkles },
        { name: t.nav_settings, href: '/dashboard/settings', icon: Settings },
      ],
    },
  ];

  const content = (
    <nav className="p-4 space-y-6" aria-label="Dashboard navigation">
      {sections.map((section) => (
        <div key={section.label}>
          <div className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            {section.label}
          </div>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-4 mt-4 border-t border-border">
        <div className="px-3 py-2">
          <div className="flex items-center gap-3">
            <Avatar
              size="sm"
              fallback={(user?.full_name || 'U').charAt(0).toUpperCase()}
              className="bg-primary/15 text-primary"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">
                @{user?.username || 'store'}
              </p>
            </div>
          </div>
        </div>
        <div className="px-3 py-2">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
            {t.nav_logout}
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 w-64 h-screen bg-card border-r border-border overflow-y-auto no-scrollbar hidden lg:block">
        {content}
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-card border-r border-border overflow-y-auto no-scrollbar animate-slide-down">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <span className="text-lg font-bold">
                Bio<span className="gradient-text">Stor</span>
              </span>
              <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
