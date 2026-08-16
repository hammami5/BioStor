'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatMoney, getErrorMessage } from '@/lib/utils';
import type { AdminOrder } from '@/types';

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  const { error } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .adminOrders()
      .then(setOrders)
      .catch((err) => error(t.admin_failed_load_orders, getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [error, t.admin_failed_load_orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.admin_orders}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin_orders_desc}</p>
      </div>

      <div className="card-surface overflow-hidden">
        <DataTable<AdminOrder>
          loading={loading}
          data={orders}
          rowKey={(o) => o.id}
          empty={
            <div className="py-12">
              <EmptyState compact icon={<ShoppingCart className="w-6 h-6" />} title={t.admin_no_orders} />
            </div>
          }
          columns={[
            {
              key: 'order',
              header: t.admin_header_order,
              cell: (o) => (
                <div>
                  <p className="font-medium">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(o.placed_at)}</p>
                </div>
              ),
            },
            { key: 'store', header: t.admin_header_store, cell: (o) => <span>{o.store_name}</span>, hideBelow: 'sm' },
            { key: 'customer', header: t.admin_header_customer, cell: (o) => <span>{o.customer_name}</span>, hideBelow: 'md' },
            {
              key: 'status',
              header: t.admin_header_status,
              cell: (o) => <Badge className="capitalize">{o.status}</Badge>,
            },
            {
              key: 'total',
              header: t.admin_header_total,
              cell: (o) => <span className="font-semibold">{formatMoney(o.total, o.currency)}</span>,
              className: 'text-right',
            },
          ]}
        />
      </div>
    </div>
  );
}
