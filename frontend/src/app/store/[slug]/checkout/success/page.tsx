'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, Clock, Home } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { formatMoney } from '@/lib/utils';
import type { OrderConfirmation } from '@/types';

export default function CheckoutSuccessPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const { t } = useTranslation();
  const confirmation = useMemo<OrderConfirmation | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem('storefront-checkout-confirmation');
      if (!raw) return null;
      return JSON.parse(raw) as OrderConfirmation;
    } catch {
      return null;
    }
  }, []);

  if (!confirmation) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-zinc-400 text-sm">{t.common_no_results}</p>
        <Link
          href={`/store/${slug}`}
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-800 text-white text-sm font-medium"
        >
          <Home className="w-4 h-4" /> {t.storefront_back_to_store}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">
            {t.storefront_order_confirmed}{confirmation.customer_name ? `, ${confirmation.customer_name}` : ''}!
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {t.storefront_order_message}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400">
              <Package className="w-4 h-4" />
              <span className="text-sm">{confirmation.store_name}</span>
            </div>
            <span className="text-sm font-bold text-white">{confirmation.order_number}</span>
          </div>

          <div className="px-5 py-4 space-y-3">
            {confirmation.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                  {item.product_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.product_name}</p>
                  {item.variant_text && (
                    <p className="text-xs text-zinc-500 truncate">{item.variant_text}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">×{item.quantity}</p>
                  <p className="text-xs text-zinc-500">{formatMoney(item.total, confirmation.currency)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t border-zinc-800 space-y-1.5">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>{t.storefront_subtotal}</span>
              <span>{formatMoney(confirmation.subtotal, confirmation.currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>{t.storefront_delivery}</span>
              <span>
                {confirmation.delivery_fee > 0
                  ? formatMoney(confirmation.delivery_fee, confirmation.currency)
                  : t.common_free}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-medium text-white">{t.storefront_total}</span>
              <span className="text-lg font-bold text-white">
                {formatMoney(confirmation.total, confirmation.currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2.5 px-1">
          <Clock className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-zinc-500">
            {t.storefront_order_message}
          </p>
        </div>

        <Link
          href={`/store/${slug}`}
          className="mt-8 block text-center py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm font-bold"
        >
          {t.storefront_continue_shopping}
        </Link>
      </div>
    </div>
  );
}
