'use client';

import Link from 'next/link';
import type { PublicProduct, StoreSettings } from '@/types';
import { formatMoney, resolveImageUrl } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface ProductCardProps {
  product: PublicProduct;
  storeSlug: string;
  settings?: StoreSettings;
  isLight?: boolean;
}

export function ProductCard({ product, storeSlug, settings, isLight }: ProductCardProps) {
  const { t } = useTranslation();
  const cardBg = isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800';
  const textColor = isLight ? 'text-zinc-900' : 'text-white';
  const mutedColor = isLight ? 'text-zinc-500' : 'text-zinc-400';
  const currency = settings?.currency || 'USD';

  return (
    <Link
      href={`/store/${storeSlug}/products/${product.slug}`}
      className={`block rounded-2xl border overflow-hidden transition-transform active:scale-[0.98] ${cardBg}`}
    >
      <div className="aspect-square bg-zinc-800/40 overflow-hidden relative">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
            {t.product_no_image}
          </div>
        )}
        {product.discount_price && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold text-white"
            style={{ background: settings?.accent_color || '#d4af37' }}>
            -{Math.round((1 - product.discount_price / product.price) * 100)}%
          </span>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-sm font-medium truncate" style={{ color: textColor }}>
          {product.name}
        </p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-base font-bold" style={{ color: textColor }}>
            {formatMoney(product.discount_price ?? product.price, currency)}
          </span>
          {product.discount_price && (
            <span className="text-xs line-through" style={{ color: mutedColor }}>
              {formatMoney(product.price, currency)}
            </span>
          )}
        </div>
        <div className="mt-2">
          <span className="block text-center py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: settings?.accent_color || '#d4af37' }}>
            {product.in_stock ? t.storefront_view : t.storefront_sold_out}
          </span>
        </div>
      </div>
    </Link>
  );
}
