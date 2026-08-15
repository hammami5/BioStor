'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/PageHeader';
import { LineChart } from '@/components/charts';
import { DonutChart } from '@/components/charts';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatMoney, getErrorMessage } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/types';
import type { AnalyticsOverview, TimePoint } from '@/types';

const RANGES = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

export default function AnalyticsPage() {
  const { error } = useToast();
  const [range, setRange] = useState('30d');
  const [summary, setSummary] = useState<AnalyticsOverview | null>(null);
  const [revenue, setRevenue] = useState<TimePoint[]>([]);
  const [orders, setOrders] = useState<TimePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sum, rev, ord] = await Promise.all([
          api.analyticsSummary(range),
          api.revenueOverTime(range),
          api.ordersOverTime(range),
        ]);
        setSummary(sum);
        setRevenue(rev);
        setOrders(ord);
      } catch (err) {
        error('Failed to load analytics', getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range, error]);

  const handleRangeChange = (r: string) => {
    const match = RANGES.find((x) => x.value === r);
    if (match) setRange(r);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Understand your sales and what&apos;s driving growth.
          </p>
        </div>
        <Tabs
          value={range}
          onValueChange={handleRangeChange}
          items={RANGES.map((r) => ({ value: r.value, label: r.label }))}
        />
      </div>

      {loading ? (
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
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Revenue" value={formatMoney(summary?.total_revenue || 0)} icon={<DollarSign className="w-5 h-5" />} />
            <StatCard label="Orders" value={String(summary?.total_orders || 0)} icon={<ShoppingCart className="w-5 h-5" />} />
            <StatCard label="Avg. order value" value={formatMoney(summary?.average_order_value || 0)} icon={<TrendingUp className="w-5 h-5" />} />
            <StatCard label="Customers" value={String(summary?.customers || 0)} icon={<Users className="w-5 h-5" />} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Revenue over time</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">Last {range}</p>
                </div>
              </CardHeader>
              <CardContent>
                <LineChart data={revenue} currency="USD" height={280} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order status</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={(summary?.status_breakdown || []).map((s) => ({
                    label: ORDER_STATUS_LABELS[s.status as keyof typeof ORDER_STATUS_LABELS] || s.status,
                    value: s.count,
                  }))}
                  centerValue={String(summary?.total_orders || 0)}
                  centerLabel="orders"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders over time</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={orders}
                  height={240}
                  showArea={false}
                  valueFormatter={(v) => String(Math.round(v))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best sellers</CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.best_selling_products?.length ? (
                  <div className="space-y-4">
                    {summary.best_selling_products.slice(0, 5).map((p, i) => (
                      <div key={p.product_id ?? p.name} className="flex items-center gap-4">
                        <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.quantity} sold</p>
                        </div>
                        <span className="text-sm font-semibold">{formatMoney(p.revenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">No sales in this period.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
