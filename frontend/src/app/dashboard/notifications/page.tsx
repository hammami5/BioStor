'use client';

import { useEffect, useState } from 'react';
import { Bell, ShoppingCart, Truck, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/lib/i18n';
import { cn, formatRelative, getErrorMessage } from '@/lib/utils';
import type { Notification } from '@/types';

const TYPE_ICON = {
  new_order: ShoppingCart,
  order_status: Truck,
  low_stock: AlertTriangle,
  system: Info,
};

export default function NotificationsPage() {
  const { success, error } = useToast();
  const { t } = useTranslation();
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listNotifications()
      .then((data) => {
        setItems(data.items);
        setUnread(data.unread_count);
      })
      .catch((err) => error(t.common_error, getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [error, t]);

  const markRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setItems((items) => items.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      // ignore
    }
  };

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead();
      setItems((items) => items.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
      success(t.notifications_mark_all_read);
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.notifications_title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread > 0 ? `${unread} ${t.notifications_title.toLowerCase()}` : t.notifications_empty}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAll}>
            <CheckCheck className="w-4 h-4" /> {t.notifications_mark_all_read}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title={t.notifications_empty}
          description={t.notifications_new_order}
        />
      ) : (
        <div className="card-surface divide-y divide-border/40">
          {items.map((n) => {
            const Icon = TYPE_ICON[n.type] || Info;
            return (
              <button
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={cn(
                  'w-full flex items-start gap-4 px-5 py-4 text-left transition-colors',
                  !n.is_read && 'bg-primary/[0.04] hover:bg-primary/[0.08]',
                  n.is_read && 'hover:bg-muted/30'
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                    n.is_read ? 'bg-muted text-muted-foreground' : 'bg-primary/15 text-primary'
                  )}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">{formatRelative(n.created_at)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
