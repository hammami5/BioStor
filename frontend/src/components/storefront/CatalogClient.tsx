'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Store, ShoppingBag, Instagram, Search } from 'lucide-react';
import type { PublicProduct, Store as StoreModel, Category } from '@/types';
import { accentText, isLightColor } from './utils';
import { ProductCard } from './ProductCard';
import { CartButton } from './CartDrawer';

interface CatalogClientProps {
  store: StoreModel;
  products: PublicProduct[];
  categories: Category[];
}

export function CatalogClient({ store, products, categories }: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const [query, setQuery] = useState('');
  const settings = store.settings;

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory) {
      list = list.filter((p) => p.category_id?.toString() === activeCategory);
    }
    if (query.trim()) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    return list;
  }, [products, activeCategory, query]);

  useEffect(() => {
    setQuery('');
  }, [activeCategory]);

  const isLight = settings?.theme === 'light';
  const textColor = isLight ? 'text-zinc-900' : 'text-white';
  const mutedColor = isLight ? 'text-zinc-500' : 'text-zinc-400';

  return (
    <div className={isLight ? 'bg-zinc-50' : 'bg-zinc-950'} style={{ minHeight: '100vh' }}>
      <header className="border-b border-black/10" style={isLight ? { background: 'rgba(255,255,255,0.7)' } : { background: 'rgba(10,10,10,0.8)' }}>
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ background: settings?.accent_color || '#d4af37' }}>
              {store.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.logo} alt={store.store_name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-6 h-6" style={{ color: isLightColor(settings?.accent_color || '#d4af37') ? '#000' : '#fff' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate" style={{ color: textColor }}>
                {store.store_name}
              </h1>
              {store.instagram_username ? (
                <a
                  href={`https://instagram.com/${store.instagram_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs hover:underline"
                  style={accentText(settings)}
                >
                  <Instagram className="w-3 h-3" /> @{store.instagram_username}
                </a>
              ) : null}
            </div>
          </div>
          {store.description && (
            <p className={`mt-3 text-sm leading-relaxed ${mutedColor}`}>{store.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-28">
        <div className="relative mt-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none transition-shadow ${isLight ? 'bg-white border border-zinc-200 text-zinc-900' : 'bg-zinc-900 border border-zinc-800 text-white'}`}
            style={{ boxShadow: 'none' }}
          />
        </div>

        {categories.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => router.replace(`/store/${store.slug}`, { scroll: false })}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!activeCategory ? 'text-white' : ''}`}
              style={
                !activeCategory
                  ? { background: settings?.accent_color || '#d4af37' }
                  : isLight
                    ? { color: 'rgba(0,0,0,0.6)' }
                    : { color: 'rgba(255,255,255,0.6)' }
              }
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.replace(`/store/${store.slug}?category=${cat.id}`, { scroll: false })}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id.toString() ? 'text-white' : ''}`}
                style={
                  activeCategory === cat.id.toString()
                    ? { background: settings?.accent_color || '#d4af37' }
                    : isLight
                      ? { color: 'rgba(0,0,0,0.6)' }
                      : { color: 'rgba(255,255,255,0.6)' }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto text-zinc-600" />
            <p className={`mt-3 text-sm ${mutedColor}`}>No products found.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                storeSlug={store.slug}
                settings={settings}
                isLight={isLight}
              />
            ))}
          </div>
        )}
      </main>

      <CartButton settings={settings} storeSlug={store.slug} isLight={isLight} />
    </div>
  );
}
