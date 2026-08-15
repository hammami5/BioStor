'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { api } from '@/lib/api/client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatMoney, getErrorMessage } from '@/lib/utils';
import type { AdminOrder } from '@/types';

export default function AdminOrdersPage() {
  const { error } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .adminOrders()
      .then(setOrders)
      .catch((err) => error('Failed to load orders', getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [error]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Orders across all stores.</p>
      </div>

      <div className="card-surface overflow-hidden">
        <DataTable<AdminOrder>
          loading={loading}
          data={orders}
          rowKey={(o) => o.id}
          empty={
            <div className="py-12">
              <EmptyState compact icon={<ShoppingCart className="w-6 h-6" />} title="No orders yet" />
            </div>
          }
          columns={[
            {
              key: 'order',
              header: 'Order',
              cell: (o) => (
                <div>
                  <p className="font-medium">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(o.placed_at)}</p>
                </div>
              ),
            },
            { key: 'store', header: 'Store', cell: (o) => <span>{o.store_name}</span>, hideBelow: 'sm' },
            { key: 'customer', header: 'Customer', cell: (o) => <span>{o.customer_name}</span>, hideBelow: 'md' },
            {
              key: 'status',
              header: 'Status',
              cell: (o) => <Badge className="capitalize">{o.status}</Badge>,
            },
            {
              key: 'total',
              header: 'Total',
              cell: (o) => <span className="font-semibold">{formatMoney(o.total, o.currency)}</span>,
              className: 'text-right',
            },
          ]}
        />
      </div>
    </div>
  );
}
