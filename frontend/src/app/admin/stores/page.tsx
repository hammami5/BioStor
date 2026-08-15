'use client';

import { useEffect, useState } from 'react';
import { Search, Store } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { debounce, formatDate, getErrorMessage } from '@/lib/utils';
import type { AdminStore } from '@/types';

export default function AdminStoresPage() {
  const { success, error } = useToast();
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setStores(await api.adminStores({ search: search || undefined }));
    } catch (err) {
      error('Failed to load stores', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounced = debounce(load, 400);

  useEffect(() => {
    debounced();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleSuspend = async (store: AdminStore) => {
    setBusyId(store.id);
    try {
      await api.suspendStore(store.id, !store.is_suspended);
      success(store.is_suspended ? 'Store reactivated' : 'Store suspended');
      load();
    } catch (err) {
      error('Action failed', getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stores</h1>
        <p className="mt-1 text-sm text-muted-foreground">All stores on the platform.</p>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Search stores…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      <div className="card-surface overflow-hidden">
        <DataTable<AdminStore>
          loading={loading}
          data={stores}
          rowKey={(s) => s.id}
          empty={
            <div className="py-12">
              <EmptyState compact icon={<Store className="w-6 h-6" />} title="No stores found" />
            </div>
          }
          columns={[
            {
              key: 'store',
              header: 'Store',
              cell: (s) => (
                <div>
                  <p className="font-medium">{s.store_name}</p>
                  <p className="text-xs text-muted-foreground">/{s.slug}</p>
                </div>
              ),
            },
            { key: 'owner', header: 'Owner', cell: (s) => <div><p>{s.owner_name}</p><p className="text-xs text-muted-foreground">{s.owner_email}</p></div>, hideBelow: 'sm' },
            { key: 'products', header: 'Products', cell: (s) => <span>{s.product_count}</span>, hideBelow: 'md' },
            { key: 'orders', header: 'Orders', cell: (s) => <span>{s.order_count}</span>, hideBelow: 'md' },
            {
              key: 'plan',
              header: 'Plan',
              cell: (s) => <Badge variant={s.plan_code === 'free' ? 'secondary' : 'gold'} className="capitalize">{s.plan_code}</Badge>,
              hideBelow: 'lg',
            },
            {
              key: 'created',
              header: 'Created',
              cell: (s) => <span className="text-muted-foreground">{formatDate(s.created_at)}</span>,
              hideBelow: 'xl',
            },
            {
              key: 'status',
              header: 'Status',
              cell: (s) => (
                <Badge variant={s.is_suspended ? 'destructive' : s.is_active ? 'success' : 'warning'} dot>
                  {s.is_suspended ? 'Suspended' : s.is_active ? 'Active' : 'Inactive'}
                </Badge>
              ),
            },
            {
              key: 'actions',
              header: '',
              cell: (s) => (
                <Button
                  variant={s.is_suspended ? 'outline' : 'destructive'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSuspend(s);
                  }}
                  isLoading={busyId === s.id}
                >
                  {s.is_suspended ? 'Reactivate' : 'Suspend'}
                </Button>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
