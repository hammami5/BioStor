'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore, itemKey, useCartTotals } from '@/store/cart';
import { formatMoney, resolveImageUrl } from '@/lib/utils';
import type { StoreSettings } from '@/types';
import { accentButton } from './utils';

interface CartButtonProps {
  settings?: StoreSettings;
  storeSlug: string;
  isLight?: boolean;
}

export function CartButton({ settings, storeSlug, isLight }: CartButtonProps) {
  const [open, setOpen] = useState(false);
  const { count, subtotal } = useCartTotals();
  const currency = settings?.currency || 'USD';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3.5 rounded-full shadow-xl text-white text-sm font-bold z-40 active:scale-95 transition-transform"
        style={accentButton(settings)}
      >
        <ShoppingBag className="w-5 h-5" />
        {count > 0 ? (
          <>
            <span>View cart · {count}</span>
            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(0,0,0,0.2)' }}>
              {formatMoney(subtotal, currency)}
            </span>
          </>
        ) : (
          <span>Cart</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-zinc-900 animate-drawer-in flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Your cart
              </h2>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <CartItems onClose={() => setOpen(false)} settings={settings} isLight={isLight} storeSlug={storeSlug} />

            {count > 0 && (
              <div className="px-5 py-4 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>Delivery fee</span>
                  <span>
                    {settings && settings.delivery_fee > 0
                      ? formatMoney(settings.delivery_fee, currency)
                      : 'Free'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-white">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold">
                    {formatMoney(subtotal + (settings?.delivery_fee || 0), currency)}
                  </span>
                </div>
                <Link
                  href={`/store/${storeSlug}/checkout`}
                  onClick={() => setOpen(false)}
                  className="block text-center py-3.5 rounded-xl text-white font-bold text-sm active:scale-[0.98] transition-transform"
                  style={accentButton(settings)}
                >
                  Checkout
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

function CartItems({
  onClose,
  settings,
  isLight,
  storeSlug,
}: {
  onClose: () => void;
  settings?: StoreSettings;
  isLight?: boolean;
  storeSlug: string;
}) {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const currency = settings?.currency || 'USD';

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
          <ShoppingBag className="w-7 h-7 text-zinc-500" />
        </div>
        <p className="text-zinc-400 text-sm">Your cart is empty.</p>
        <Link
          href={`/store/${storeSlug}`}
          onClick={onClose}
          className="text-sm font-medium underline"
          style={{ color: settings?.accent_color || '#d4af37' }}
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
      {items.map((item) => {
        const key = itemKey(item.product.id, item.variants);
        const variantText = Object.entries(item.variants)
          .map(([g, v]) => `${g}: ${v}`)
          .join(', ');
        return (
          <div key={key} className="flex gap-3">
            <div className="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
              {item.product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveImageUrl(item.product.images[0])} alt={item.product.name} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                <button
                  onClick={() => removeItem(key)}
                  className="p-1 text-zinc-500 hover:text-red-400"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {variantText && <p className="text-xs text-zinc-500 mt-0.5">{variantText}</p>}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(key, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm text-white">{item.quantity}</span>
                  <button
                    onClick={() => setQuantity(key, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-sm font-bold text-white">
                  {formatMoney(item.unit_price * item.quantity, currency)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
