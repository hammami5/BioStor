'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MapPin, User as UserIcon, StickyNote } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { OrderStatusBadge } from '@/components/ui/StatusBadge';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/lib/i18n';
import { cn, formatDateTime, formatMoney, getErrorMessage } from '@/lib/utils';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/types';
import type { Order } from '@/types';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error } = useToast();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.getOrder(parseInt(params.id));
      setOrder(data);
      setNote(data.internal_note || '');
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
      router.replace('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  }, [params.id, router, error, t]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (status: string) => {
    setUpdatingStatus(true);
    try {
      const updated = await api.updateOrderStatus(order!.id, status as Order['status']);
      setOrder(updated);
      success(t.orders_update_status, `${ORDER_STATUS_LABELS[updated.status]}.`);
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveNote = async () => {
    setSavingNote(true);
    try {
      const updated = await api.updateOrderNote(order!.id, note || null);
      setOrder(updated);
      success(t.common_save);
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
    } finally {
      setSavingNote(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const statusIndex = ORDER_STATUSES.indexOf(order.status);
  const currentStep = order.status === 'cancelled' ? -1 : statusIndex;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> {t.common_back}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{order.order_number}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.orders_date} {formatDateTime(order.placed_at)}
          </p>
        </div>
        <div className="w-44">
          <Select
            label={t.orders_update_status}
            value={order.status}
            onChange={(e) => changeStatus(e.target.value)}
            disabled={updatingStatus}
            options={ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] }))}
          />
        </div>
      </div>

      {order.status === 'cancelled' ? (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {t.orders_cancelled}
        </div>
      ) : (
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            {ORDER_STATUSES.slice(0, 5).map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full transition-colors',
                      i <= currentStep ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      i <= currentStep ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {ORDER_STATUS_LABELS[s]}
                  </span>
                </div>
                {i < 4 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2',
                      i < currentStep ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.orders_items}</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="divide-y divide-border/40">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex-shrink-0 overflow-hidden">
                      {item.product_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.product_name}</p>
                      {item.variant_text && (
                        <p className="text-xs text-muted-foreground">{item.variant_text}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {item.quantity} × {formatMoney(item.unit_price, order.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatMoney(item.total, order.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-muted/30 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.storefront_subtotal}</span>
                  <span>{formatMoney(order.subtotal, order.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.storefront_delivery}</span>
                  <span>{formatMoney(order.delivery_fee, order.currency)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-1.5 border-t border-border/60">
                  <span>{t.storefront_total}</span>
                  <span>{formatMoney(order.total, order.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.orders_internal_notes}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.orders_note_placeholder}
                rows={3}
              />
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveNote}
                  isLoading={savingNote}
                >
                  {t.common_save}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.orders_customer}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${order.customer_phone}`} className="text-sm hover:text-primary">
                  {order.customer_phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  {order.customer_address}
                  <br />
                  {order.customer_city}
                </span>
              </div>
            </CardContent>
          </Card>

          {order.note && (
            <Card>
              <CardHeader>
                <CardTitle>{t.orders_notes}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2.5">
                  <StickyNote className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{order.note}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
