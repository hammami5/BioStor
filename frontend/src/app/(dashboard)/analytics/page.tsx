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
import { useTranslation } from '@/lib/i18n';
import { formatMoney, getErrorMessage } from '@/lib/utils';
import { ORDER_STATUS_I18N_KEYS } from '@/types';
import type { AnalyticsOverview, TimePoint } from '@/types';

const RANGES = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

export default function AnalyticsPage() {
  const { error } = useToast();
  const { t } = useTranslation();
  const [range, setRange] = useState('30d');
  const [summary, setSummary] = useState<AnalyticsOverview | null>(null);
  const [revenue, setRevenue] = useState<TimePoint[]>([]);
  const [orders, setOrders] = useState<TimePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const ranges = [
    { value: '7d', label: t.analytics_7d },
    { value: '30d', label: t.analytics_30d },
    { value: '90d', label: t.analytics_90d },
  ];

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
        error(t.common_error, getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range, error, t]);

  const handleRangeChange = (r: string) => {
    const match = ranges.find((x) => x.value === r);
    if (match) setRange(r);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.analytics_title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.analytics_conversion}
          </p>
        </div>
        <Tabs
          value={range}
          onValueChange={handleRangeChange}
          items={ranges.map((r) => ({ value: r.value, label: r.label }))}
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
            <StatCard label={t.analytics_revenue} value={formatMoney(summary?.total_revenue || 0)} icon={<DollarSign className="w-5 h-5" />} />
            <StatCard label={t.analytics_orders} value={String(summary?.total_orders || 0)} icon={<ShoppingCart className="w-5 h-5" />} />
            <StatCard label={t.analytics_avg_order} value={formatMoney(summary?.average_order_value || 0)} icon={<TrendingUp className="w-5 h-5" />} />
            <StatCard label={t.analytics_conversion} value={String(summary?.customers || 0)} icon={<Users className="w-5 h-5" />} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>{t.dashboard_revenue_over_time}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">{range}</p>
                </div>
              </CardHeader>
              <CardContent>
                <LineChart data={revenue} currency="USD" height={280} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.analytics_status_breakdown}</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={(summary?.status_breakdown || []).map((s) => ({
                    label: t[ORDER_STATUS_I18N_KEYS[s.status as keyof typeof ORDER_STATUS_I18N_KEYS] as keyof typeof t] || s.status,
                    value: s.count,
                  }))}
                  centerValue={String(summary?.total_orders || 0)}
                  centerLabel={t.analytics_orders.toLowerCase()}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.dashboard_orders_over_time}</CardTitle>
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
                <CardTitle>{t.analytics_best_sellers}</CardTitle>
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
                          <p className="text-xs text-muted-foreground">{p.quantity} {t.analytics_orders.toLowerCase()}</p>
                        </div>
                        <span className="text-sm font-semibold">{formatMoney(p.revenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">{t.common_no_results}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
