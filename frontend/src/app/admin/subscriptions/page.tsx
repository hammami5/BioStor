'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/api/client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { formatDate, getErrorMessage } from '@/lib/utils';
import type { AdminSubscription } from '@/types';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary' | 'primary'> = {
  active: 'success',
  trialing: 'primary',
  past_due: 'warning',
  cancelled: 'destructive',
  expired: 'secondary',
};

export default function AdminSubscriptionsPage() {
  const { error } = useToast();
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .adminSubscriptions()
      .then(setSubscriptions)
      .catch((err) => error('Failed to load subscriptions', getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [error]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> Subscriptions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Subscription status across all stores.
        </p>
      </div>

      <div className="card-surface overflow-hidden">
        <DataTable<AdminSubscription>
          loading={loading}
          data={subscriptions}
          rowKey={(s) => s.id}
          empty={
            <div className="py-12">
              <EmptyState compact icon={<Sparkles className="w-6 h-6" />} title="No subscriptions yet" />
            </div>
          }
          columns={[
            { key: 'store', header: 'Store', cell: (s) => <span className="font-medium">{s.store_name}</span> },
            {
              key: 'plan',
              header: 'Plan',
              cell: (s) => <Badge variant={s.plan_code === 'free' ? 'secondary' : 'gold'} className="capitalize">{s.plan_code}</Badge>,
            },
            {
              key: 'status',
              header: 'Status',
              cell: (s) => (
                <Badge variant={STATUS_VARIANT[s.status] || 'secondary'} dot className="capitalize">
                  {s.status.replace('_', ' ')}
                </Badge>
              ),
            },
            { key: 'provider', header: 'Provider', cell: (s) => <span className="text-muted-foreground">{s.provider || '—'}</span>, hideBelow: 'sm' },
            { key: 'created', header: 'Since', cell: (s) => <span className="text-muted-foreground">{formatDate(s.created_at)}</span>, hideBelow: 'md' },
          ]}
        />
      </div>
    </div>
  );
}
