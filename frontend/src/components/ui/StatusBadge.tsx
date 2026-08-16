'use client';

import { Badge } from './Badge';
import { ORDER_STATUS_I18N_KEYS, type OrderStatus, type ProductStatus } from '@/types';
import { useTranslation } from '@/lib/i18n';

const ORDER_STATUS_VARIANT: Record<OrderStatus, 'success' | 'warning' | 'destructive' | 'primary' | 'secondary'> = {
  new: 'primary',
  confirmed: 'warning',
  preparing: 'warning',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  return (
    <Badge variant={ORDER_STATUS_VARIANT[status]} dot>
      {t[ORDER_STATUS_I18N_KEYS[status] as keyof typeof t]}
    </Badge>
  );
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const { t } = useTranslation();
  return status === 'active' ? (
    <Badge variant="success" dot>
      {t.status_active}
    </Badge>
  ) : (
    <Badge variant="secondary" dot>
      {t.status_inactive}
    </Badge>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  const { t } = useTranslation();
  if (stock === 0) return <Badge variant="destructive">{t.status_out_of_stock}</Badge>;
  if (stock <= 5) return <Badge variant="warning">{t.status_low_stock} · {stock}</Badge>;
  return <Badge variant="success">{stock} {t.status_in_stock}</Badge>;
}
