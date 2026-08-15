'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Store, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api/client';
import { StatCard } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatMoney, getErrorMessage } from '@/lib/utils';
import type { AdminStats } from '@/types';

export default function AdminDashboardPage() {
  const { error } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .adminStats()
      .then(setStats)
      .catch((err) => error('Failed to load stats', getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [error]);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Users', value: String(stats.total_users), icon: <Users className="w-5 h-5" />, href: '/admin/users' },
    { label: 'Active stores', value: String(stats.active_stores), icon: <Store className="w-5 h-5" />, href: '/admin/stores' },
    { label: 'Orders', value: String(stats.total_orders), icon: <ShoppingCart className="w-5 h-5" />, href: '/admin/orders' },
    { label: 'Platform revenue', value: formatMoney(stats.platform_revenue), icon: <DollarSign className="w-5 h-5" />, href: '/admin/subscriptions' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {stats.new_users_30d} new users in the last 30 days · {stats.recent_orders} recent orders
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="hover:border-primary/30 transition-colors">
              <StatCard label={card.label} value={card.value} icon={card.icon} />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Subscriptions</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {stats.active_subscriptions} active
              </p>
            </div>
            <Link href="/admin/subscriptions" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.subscription_breakdown || {}).map(([key, count]) => (
                <div key={key} className="px-3 py-4 rounded-xl bg-muted/40 text-center">
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Review stores', href: '/admin/stores', desc: 'Check store activity and suspend violators.' },
              { label: 'Manage plans', href: '/admin/plans', desc: 'Adjust pricing, limits and features.' },
              { label: 'Browse orders', href: '/admin/orders', desc: 'Monitor orders across all stores.' },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-border hover:bg-muted/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
