'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Users,
  CreditCard,
  Globe,
  Palette,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Design', href: '/dashboard/design', icon: Palette },
  { name: 'Domain', href: '/dashboard/domain', icon: Globe },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-16 z-40 w-64 h-[calc(100vh-4rem)] bg-card border-r border-border overflow-y-auto hidden lg:block">
      <nav className="p-4 space-y-1" aria-label="Main navigation">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Main
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * navigation.indexOf(item) }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-muted-foreground hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </Link>
            </motion.div>
          );
        })}

        <div className="pt-4 mt-4 border-t border-border">
          <div className="px-3 py-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-900 dark:text-white truncate">
                  {user?.full_name || 'Store Owner'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
          <div className="px-3 py-2">
            <button
              onClick={() => logout()}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium',
                'text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/20',
                'hover:text-red-600 dark:hover:text-red-400 transition-all duration-200'
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}