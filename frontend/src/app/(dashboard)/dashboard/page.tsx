'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  ArrowUpRight,
  Users,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/lib/i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/PageHeader';
import { LineChart } from '@/components/charts';
import { OrderStatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatMoney, formatDateTime, getErrorMessage } from '@/lib/utils';
import type { DashboardOverview, Order, TimePoint } from '@/types';

export default function DashboardPage() {
  const { error: toastError } = useToast();
  const { t } = useTranslation();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenue, setRevenue] = useState<TimePoint[]>([]);
  const [orders, setOrders] = useState<TimePoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, rev, ord, recent] = await Promise.all([
          api.dashboardOverview(),
          api.revenueOverTime('30d'),
          api.ordersOverTime('30d'),
          api.listOrders({ page: 1, page_size: 6 }),
        ]);
        setOverview(ov);
        setRevenue(rev);
        setOrders(ord);
        setRecentOrders(recent.items);
      } catch (err) {
        toastError(t.common_error, getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toastError, t]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const currency = overview ? 'USD' : 'USD';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t.dashboard_total_revenue}
          value={formatMoney(overview?.total_revenue || 0, currency)}
          icon={<DollarSign className="w-5 h-5" />}
          hint={t.analytics_today}
        />
        <StatCard
          label={t.dashboard_total_orders}
          value={String(overview?.total_orders || 0)}
          icon={<ShoppingCart className="w-5 h-5" />}
          hint={`${overview?.today_orders || 0} ${t.dashboard_today_orders}`}
        />
        <StatCard
          label={t.dashboard_total_products}
          value={String(overview?.total_products || 0)}
          icon={<Package className="w-5 h-5" />}
          hint={`${overview?.low_stock_count || 0} ${t.dashboard_low_stock}`}
        />
        <StatCard
          label={t.dashboard_total_customers}
          value={String(overview?.total_customers || 0)}
          icon={<Users className="w-5 h-5" />}
          hint={`${overview?.pending_orders || 0} ${t.dashboard_pending_orders}`}
        />
      </div>

      {overview && overview.low_stock_count > 0 && (
        <Link href="/dashboard/products" className="block">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400 hover:bg-amber-500/15 transition-colors">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">
              {overview.low_stock_count} {t.dashboard_low_stock}
            </span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>{t.analytics_revenue}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{t.analytics_30d}</p>
            </div>
          </CardHeader>
          <CardContent>
            <LineChart data={revenue} currency="USD" height={260} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{t.orders_title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{t.analytics_30d}</p>
            </div>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <LineChart
              data={orders}
              height={260}
              valueFormatter={(v) => String(Math.round(v))}
              showArea={false}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.dashboard_recent_orders}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">{t.dashboard_revenue_over_time}</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            {t.dashboard_view_all} <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="px-0 py-0">
          {recentOrders.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="mt-3 text-sm text-muted-foreground">
                {t.orders_empty_desc}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.order_number} · {formatDateTime(order.placed_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-sm font-semibold">
                      {formatMoney(order.total, order.currency)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
