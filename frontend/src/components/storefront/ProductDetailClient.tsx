'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Check, ChevronLeft } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatMoney } from '@/lib/utils';
import type { PublicProduct, StoreSettings } from '@/types';
import { accentButton } from './utils';

interface ProductDetailClientProps {
  product: PublicProduct;
  storeSlug: string;
  storeName: string;
  settings?: StoreSettings;
  isLight?: boolean;
}

export function ProductDetailClient({
  product,
  storeSlug,
  storeName,
  settings,
  isLight,
}: ProductDetailClientProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const currency = settings?.currency || 'USD';

  const selectionError = useMemo(() => {
    for (const group of product.variant_groups) {
      if (!selected[group.name]) {
        return `Please select ${group.name.toLowerCase()}`;
      }
    }
    return null;
  }, [selected, product.variant_groups]);

  const price = useMemo(() => {
    let p = product.discount_price ?? product.price;
    for (const group of product.variant_groups) {
      const opt = group.options.find((o) => o.value === selected[group.name]);
      if (opt) p += opt.additional_price;
    }
    return p;
  }, [selected, product]);

  const handleAdd = () => {
    addItem(product, quantity, selected);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const bg = isLight ? 'bg-zinc-50' : 'bg-zinc-950';
  const textColor = isLight ? 'text-zinc-900' : 'text-white';
  const mutedColor = isLight ? 'text-zinc-500' : 'text-zinc-400';
  const chipBg = isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700';

  return (
    <div className={bg} style={{ minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-5">
        <button
          onClick={() => router.back()}
          className={`inline-flex items-center gap-1.5 text-sm ${mutedColor}`}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="mt-4 rounded-2xl overflow-hidden aspect-square bg-zinc-800/40 relative">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">No image</div>
          )}
          {product.discount_price && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: settings?.accent_color || '#d4af37' }}>
              Save {Math.round((1 - product.discount_price / product.price) * 100)}%
            </span>
          )}
        </div>

        <div className="mt-5">
          <h1 className="text-2xl font-bold" style={{ color: textColor }}>
            {product.name}
          </h1>
          <p className={`text-xs mt-1 ${mutedColor}`}>{storeName}</p>

          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-2xl font-bold" style={{ color: textColor }}>
              {formatMoney(price, currency)}
            </span>
            {product.discount_price && (
              <span className={`text-base line-through ${mutedColor}`}>
                {formatMoney(product.price, currency)}
              </span>
            )}
          </div>

          {product.description && (
            <p className={`mt-4 text-sm leading-relaxed ${mutedColor}`}>{product.description}</p>
          )}

          {!product.in_stock ? (
            <div className="mt-6 px-4 py-3.5 rounded-xl text-sm font-medium text-center bg-red-500/10 text-red-400">
              This product is currently out of stock.
            </div>
          ) : (
            <>
              {product.variant_groups.map((group) => (
                <div key={group.name} className="mt-5">
                  <p className="text-sm font-medium" style={{ color: textColor }}>
                    {group.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.options.map((option) => {
                      const active = selected[group.name] === option.value;
                      return (
                        <button
                          key={option.value}
                          disabled={!option.in_stock}
                          onClick={() => setSelected((s) => ({ ...s, [group.name]: option.value }))}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40 disabled:pointer-events-none ${chipBg}`}
                          style={{
                            ...(active ? accentButton(settings) : {}),
                            borderColor: active ? 'transparent' : undefined,
                            color: active ? (accentButton(settings) as { color: string }).color : undefined,
                          }}
                        >
                          {option.value}
                          {option.additional_price > 0 && (
                            <span className={`ml-1 text-xs ${mutedColor}`}>
                              +{formatMoney(option.additional_price, currency)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {selectionError && (
                <p className="mt-3 text-xs text-amber-400">{selectionError}</p>
              )}

              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm font-medium" style={{ color: textColor }}>
                  Quantity
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl bg-zinc-800 text-white flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-lg font-bold" style={{ color: textColor }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 rounded-xl bg-zinc-800 text-white flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!!selectionError}
                className="mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-base disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-transform"
                style={accentButton(settings)}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" /> Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Add to cart
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
