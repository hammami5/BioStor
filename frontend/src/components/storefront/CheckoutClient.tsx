'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ArrowRight, Check } from 'lucide-react';
import { useCartStore, useCartTotals, itemKey } from '@/store/cart';
import { formatMoney, cn, resolveImageUrl } from '@/lib/utils';
import { publicApi } from '@/lib/api';
import type { StoreSettings, VariantSelection } from '@/types';
import { accentButton } from './utils';
import { useTranslation } from '@/lib/i18n';

interface CheckoutClientProps {
  storeSlug: string;
  storeName: string;
  settings?: StoreSettings;
  isLight?: boolean;
}

const TUNISIAN_CITIES_KEYS = [
  'city_tunis',
  'city_sfax',
  'city_sousse',
  'city_kairouan',
  'city_bizerte',
  'city_gabes',
  'city_ariana',
  'city_gafsa',
  'city_monastir',
  'city_ben_arous',
  'city_kasserine',
  'city_mednine',
  'city_nabeul',
  'city_tataouine',
  'city_bejita',
  'city_mahdia',
  'city_kebili',
  'city_tozeur',
  'city_sidi_bouzid',
  'city_manouba',
  'city_takrouna',
  'city_hammamet',
  'city_djerba',
  'city_zarzis',
  'city_other',
] as const;

export function CheckoutClient({ storeSlug, storeName, settings, isLight }: CheckoutClientProps) {
  const router = useRouter();
  const { items, subtotal } = useCartTotals();
  const clear = useCartStore((s) => s.clear);
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currency = settings?.currency || 'USD';
  const deliveryFee = settings?.delivery_fee || 0;
  const total = subtotal + deliveryFee;

  const formatCurrency = (amount: number) => {
    if (currency === 'TND') {
      return `${amount.toFixed(3)} د.ت`;
    }
    return formatMoney(amount, currency);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError(t.checkout_fill_required);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const confirmation = await publicApi.placeOrder({
        full_name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        note: notes.trim() || null,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          variant_selections: Object.entries(item.variants).map(
            ([group, value]): VariantSelection => ({ group, value })
          ),
        })),
      });
      sessionStorage.setItem('storefront-checkout-confirmation', JSON.stringify(confirmation));
      clear();
      router.replace(`/store/${storeSlug}/checkout/success`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.checkout_order_error);
    } finally {
      setSubmitting(false);
    }
  };

  const bg = isLight ? 'bg-zinc-50' : 'bg-zinc-950';
  const textColor = isLight ? 'text-zinc-900' : 'text-white';
  const mutedColor = isLight ? 'text-zinc-500' : 'text-zinc-400';
  const inputClass = cn(
    'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-shadow focus:ring-2',
    isLight
      ? 'bg-white border-zinc-300 text-zinc-900 focus:border-zinc-400 focus:ring-zinc-200'
      : 'bg-zinc-900 border-zinc-700 text-white focus:border-zinc-500 focus:ring-zinc-700'
  );
  const selectClass = cn(
    'px-4 py-3 rounded-xl border text-sm outline-none transition-shadow focus:ring-2',
    isLight
      ? 'bg-white border-zinc-300 text-zinc-900 focus:border-zinc-400 focus:ring-zinc-200'
      : 'bg-zinc-900 border-zinc-700 text-white focus:border-zinc-500 focus:ring-zinc-700'
  );
  const sectionStyle = isLight
    ? { background: '#fff', borderColor: 'rgba(0,0,0,0.1)' }
    : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' };

  return (
    <div className={bg} style={{ minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-5">
        <button
          onClick={() => router.back()}
          className={`inline-flex items-center gap-1.5 text-sm ${mutedColor}`}
        >
          <ChevronLeft className="w-4 h-4" /> {t.common_back}
        </button>

        <h1 className="mt-4 text-2xl font-bold" style={{ color: textColor }}>
          {t.storefront_checkout}
        </h1>
        <p className={`text-sm mt-1 ${mutedColor}`}>{storeName}</p>

        {items.length === 0 ? (
          <div className="py-16 text-center">
            <Check className="w-10 h-10 mx-auto text-zinc-600" />
            <p className={`mt-3 text-sm ${mutedColor}`}>{t.storefront_cart_empty_message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <section className="rounded-2xl border overflow-hidden" style={sectionStyle}>
              <div className="px-5 py-4 space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${mutedColor}`}>{t.storefront_full_name} *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder={t.storefront_full_name} autoComplete="name" />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${mutedColor}`}>{t.storefront_phone} *</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+216..." autoComplete="tel" />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${mutedColor}`}>{t.storefront_address} *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`${inputClass} resize-none`}
                    rows={2}
                    placeholder={t.storefront_address}
                    autoComplete="street-address"
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${mutedColor}`}>{t.storefront_city} *</label>
                  <div className="flex gap-2">
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`${inputClass} flex-1`}
                      placeholder={t.storefront_city}
                      autoComplete="address-level2"
                    />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`${selectClass} w-auto min-w-[140px]`}
                    >
                      <option value="">{t.storefront_city}</option>
                      {TUNISIAN_CITIES_KEYS.map((key) => (
                        <option key={key} value={t[key as keyof typeof t]}>
                          {t[key as keyof typeof t]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${mutedColor}`}>{t.storefront_note}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`${inputClass} resize-none`}
                    rows={3}
                    placeholder={t.storefront_note_placeholder}
                  />
                </div>
              </div>
            </section>

            <section className={`rounded-2xl border px-5 py-4 space-y-3`} style={sectionStyle}>
              {items.map((item) => {
                const key = itemKey(item.product.id, item.variants);
                const variantText = Object.entries(item.variants)
                  .map(([g, v]) => `${g}: ${v}`)
                  .join(', ');
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                      {item.product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={resolveImageUrl(item.product.images[0])} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: textColor }}>
                        {item.product.name}
                      </p>
                      {variantText && <p className="text-xs" style={{ color: mutedColor }}>{variantText}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: textColor }}>×{item.quantity}</p>
                      <p className="text-xs" style={{ color: mutedColor }}>
                        {formatCurrency(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="border-t pt-3 space-y-2" style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}>
                <div className="flex justify-between text-sm" style={{ color: mutedColor }}>
                  <span>{t.storefront_subtotal}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: mutedColor }}>
                  <span>{t.storefront_delivery}</span>
                  <span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : t.common_free}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium" style={{ color: textColor }}>{t.storefront_total}</span>
                  <span className="text-xl font-bold" style={{ color: textColor }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </section>

            {error && (
              <p className="text-sm text-red-400 px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-base disabled:opacity-60 active:scale-[0.98] transition-transform"
              style={accentButton(settings)}
            >
              {submitting ? t.storefront_placing_order : (
                <>
                  {t.storefront_place_order} · {formatCurrency(total)} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
