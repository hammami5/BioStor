'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { OrderStatusBadge } from '@/components/ui/StatusBadge';
import { DataTable } from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/Toast';
import { debounce, formatDateTime, formatMoney, getErrorMessage } from '@/lib/utils';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/types';
import type { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const { error } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listOrders({
        search: search || undefined,
        status: status || undefined,
        page,
        page_size: 15,
      });
      setOrders(data.items);
      setTotal(data.total);
    } catch (err) {
      error('Failed to load orders', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = debounce(() => {
    setPage(1);
    load();
  }, 400);

  useEffect(() => {
    debouncedSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} order{total !== 1 ? 's' : ''} received
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px] max-w-sm">
          <Input
            placeholder="Search by customer or order #…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-40"
          options={[
            { value: '', label: 'All statuses' },
            ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] })),
          ]}
        />
      </div>

      <div className="card-surface overflow-hidden">
        <DataTable<Order>
          loading={loading}
          data={orders}
          rowKey={(o) => o.id}
          onRowClick={(o) => router.push(`/dashboard/orders/${o.id}`)}
          empty={
            <div className="py-12">
              <EmptyState
                compact
                icon={<ShoppingCart className="w-6 h-6" />}
                title="No orders found"
                description="Orders placed from your store link will appear here."
              />
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
            { key: 'customer', header: 'Customer', cell: (o) => <span className="font-medium">{o.customer_name}</span>, hideBelow: 'sm' },
            {
              key: 'items',
              header: 'Items',
              cell: (o) => <span>{o.items?.length ?? '-'}</span>,
              hideBelow: 'md',
            },
            { key: 'status', header: 'Status', cell: (o) => <OrderStatusBadge status={o.status} /> },
            {
              key: 'total',
              header: 'Total',
              cell: (o) => <span className="font-semibold">{formatMoney(o.total, o.currency)}</span>,
              className: 'text-right',
            },
          ]}
        />
      </div>

      <Pagination page={page} total={total} pageSize={15} onPageChange={setPage} />
    </div>
  );
}
