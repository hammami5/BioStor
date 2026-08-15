'use client';

import { Badge } from './Badge';
import { ORDER_STATUS_LABELS, type OrderStatus, type ProductStatus } from '@/types';

const ORDER_STATUS_VARIANT: Record<OrderStatus, 'success' | 'warning' | 'destructive' | 'primary' | 'secondary'> = {
  new: 'primary',
  confirmed: 'warning',
  preparing: 'warning',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={ORDER_STATUS_VARIANT[status]} dot>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return status === 'active' ? (
    <Badge variant="success" dot>
      Active
    </Badge>
  ) : (
    <Badge variant="secondary" dot>
      Inactive
    </Badge>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Out of stock</Badge>;
  if (stock <= 5) return <Badge variant="warning">Low · {stock} left</Badge>;
  return <Badge variant="success">{stock} in stock</Badge>;
}
