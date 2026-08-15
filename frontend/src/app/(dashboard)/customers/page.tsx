'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { DataTable } from '@/components/ui/DataTable';
import { Avatar } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { debounce, formatDate, formatMoney, getErrorMessage } from '@/lib/utils';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const router = useRouter();
  const { error } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listCustomers({ search: search || undefined, page, page_size: 15 });
      setCustomers(data.items);
      setTotal(data.total);
    } catch (err) {
      error('Failed to load customers', getErrorMessage(err));
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
  }, [search, page]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} customer{total !== 1 ? 's' : ''} who ordered from you
        </p>
      </div>

      <div className="flex-1 min-w-[220px] max-w-sm">
        <Input
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      <div className="card-surface overflow-hidden">
        <DataTable<Customer>
          loading={loading}
          data={customers}
          rowKey={(c) => c.id}
          onRowClick={(c) => router.push(`/dashboard/customers/${c.id}`)}
          empty={
            <div className="py-12">
              <EmptyState
                compact
                icon={<Users className="w-6 h-6" />}
                title="No customers yet"
                description="Customers are created automatically the first time they order from your store."
              />
            </div>
          }
          columns={[
            {
              key: 'customer',
              header: 'Customer',
              cell: (c) => (
                <div className="flex items-center gap-3">
                  <Avatar size="sm" fallback={c.full_name.charAt(0).toUpperCase()} className="bg-primary/15 text-primary" />
                  <div>
                    <p className="font-medium">{c.full_name}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </div>
                </div>
              ),
            },
            { key: 'city', header: 'City', cell: (c) => <span>{c.city}</span>, hideBelow: 'sm' },
            { key: 'orders', header: 'Orders', cell: (c) => <span>{c.total_orders}</span>, hideBelow: 'md' },
            {
              key: 'spent',
              header: 'Spent',
              cell: (c) => <span className="font-semibold">{formatMoney(c.total_spent)}</span>,
            },
            {
              key: 'last_order',
              header: 'Last order',
              cell: (c) => <span className="text-muted-foreground">{c.last_order_at ? formatDate(c.last_order_at) : '—'}</span>,
              hideBelow: 'lg',
            },
          ]}
        />
      </div>

      <Pagination page={page} total={total} pageSize={15} onPageChange={setPage} />
    </div>
  );
}
