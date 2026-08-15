'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MapPin, ShoppingCart } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Badge';
import { OrderStatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatMoney, getErrorMessage } from '@/lib/utils';
import type { CustomerDetail } from '@/types';

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { error } = useToast();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCustomer(parseInt(params.id))
      .then(setCustomer)
      .catch((err) => {
        error('Customer not found', getErrorMessage(err));
        router.replace('/dashboard/customers');
      })
      .finally(() => setLoading(false));
  }, [params.id, router, error]);

  if (loading || !customer) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-60" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to customers
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{customer.full_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customer since {formatDateTime(customer.created_at)}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar size="lg" fallback={customer.full_name.charAt(0).toUpperCase()} className="bg-primary/15 text-primary" />
                <div>
                  <p className="font-medium">{customer.full_name}</p>
                  <a href={`tel:${customer.phone}`} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {customer.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  {customer.address}
                  <br />
                  {customer.city}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{customer.total_orders}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatMoney(customer.total_spent)}</p>
                <p className="text-xs text-muted-foreground">Total spent</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order history</CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {customer.orders.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <ShoppingCart className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {customer.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(order.placed_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-sm font-semibold">{formatMoney(order.total, order.currency)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
