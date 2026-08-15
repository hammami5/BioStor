'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PublicProduct } from '@/types';

export interface CartItem {
  product: PublicProduct;
  quantity: number;
  variants: Record<string, string>;
  unit_price: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: PublicProduct, quantity: number, variants: Record<string, string>) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

export function itemKey(productId: number, variants: Record<string, string>): string {
  const v = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, val]) => `${k}:${val}`)
    .join('|');
  return `${productId}${v ? `#${v}` : ''}`;
}

export function itemUnitPrice(product: PublicProduct, variants: Record<string, string>): number {
  let price = product.discount_price ?? product.price;
  for (const group of product.variant_groups) {
    const selected = variants[group.name];
    if (!selected) continue;
    const option = group.options.find((o) => o.value === selected);
    if (option) price += option.additional_price;
  }
  return price;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity, variants) => {
        const key = itemKey(product.id, variants);
        set((state) => {
          const existing = state.items.find((i) => itemKey(i.product.id, i.variants) === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.product.id, i.variants) === key
                  ? { ...i, quantity: Math.min(i.quantity + quantity, 99) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { product, quantity, variants, unit_price: itemUnitPrice(product, variants) },
            ],
          };
        });
      },
      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((i) => itemKey(i.product.id, i.variants) !== key),
        })),
      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.product.id, i.variants) === key
              ? { ...i, quantity: Math.max(1, Math.min(quantity, 99)) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'biostor-cart' }
  )
);

export function useCartTotals() {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, subtotal, count };
}
