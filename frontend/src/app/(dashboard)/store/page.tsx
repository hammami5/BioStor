'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Palette, ImagePlus, Store as StoreIcon, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tabs, TabContent } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/lib/i18n';
import { cn, getErrorMessage, isValidHexColor } from '@/lib/utils';
import type { Store } from '@/types';

const ACCENT_COLORS = ['#d4af37', '#000000', '#8b5cf6', '#0ea5e9', '#10b981', '#ef4444', '#f97316', '#ec4899'];

const DEFAULT_STORE: Store = {
  id: 0,
  owner_id: 0,
  store_name: 'My Store',
  slug: 'my-store',
  logo: null,
  description: 'Handpicked pieces, shipped worldwide.',
  instagram_username: null,
  contact_email: null,
  contact_phone: null,
  contact_address: null,
  contact_city: null,
  is_active: true,
  is_suspended: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  settings: {
    accent_color: '#d4af37',
    button_style: 'pill',
    theme: 'dark',
    currency: 'USD',
    delivery_fee: 0,
  },
};

export default function StorePage() {
  const router = useRouter();
  const { success, error } = useToast();
  const { t } = useTranslation();
  const [tab, setTab] = useState('design');
  const [store, setStore] = useState<Store>(DEFAULT_STORE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);

  useEffect(() => {
    api
      .getMyStore()
      .then(setStore)
      .catch((err) => {
        error(t.common_error, getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [error, t]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateMyStore({
        description: store.description,
        instagram_username: store.instagram_username,
        contact_email: store.contact_email,
        contact_phone: store.contact_phone,
        contact_address: store.contact_address,
        contact_city: store.contact_city,
      });
      setStore(updated);
      success(t.store_saved, t.store_profile);
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store.settings || !isValidHexColor(store.settings.accent_color)) {
      error(t.common_error, t.store_accent_color);
      return;
    }
    setSavingDesign(true);
    try {
      const updated = await api.updateStoreSettings({
        accent_color: store.settings!.accent_color,
        button_style: store.settings!.button_style,
        theme: store.settings!.theme,
        currency: store.settings!.currency,
        delivery_fee: store.settings!.delivery_fee,
      });
      setStore(updated);
      success(t.store_saved, t.store_design);
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
    } finally {
      setSavingDesign(false);
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      const updated = await api.uploadStoreLogo(file);
      setStore(updated);
      success(t.store_logo);
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const accent = store.settings?.accent_color || '#d4af37';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.store_title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.store_description}
          </p>
        </div>
        <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline">
            <ExternalLink className="w-4 h-4" /> {t.store_preview}
          </Button>
        </a>
      </div>

      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'design', label: t.store_design },
          { value: 'profile', label: t.store_profile },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <TabContent value="design" activeValue={tab}>
          <form onSubmit={saveDesign} className="card-surface p-6 space-y-6">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" /> {t.store_design}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.store_accent_color}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Label>{t.store_accent_color}</Label>
              <input
                type="color"
                value={accent}
                onChange={(e) =>
                  setStore((s) => ({ ...s, settings: { ...s.settings!, accent_color: e.target.value } }))
                }
                className="w-10 h-10 rounded-lg bg-transparent border border-border cursor-pointer"
              />
              <Input
                value={accent}
                onChange={(e) =>
                  setStore((s) => ({ ...s, settings: { ...s.settings!, accent_color: e.target.value } }))
                }
                className="max-w-[120px] font-mono"
                placeholder="#d4af37"
              />
            </div>
            <div className="flex flex-wrap gap-2.5">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setStore((s) => ({ ...s, settings: { ...s.settings!, accent_color: color } }))
                  }
                  className={cn(
                    'w-9 h-9 rounded-full border-2 transition-transform hover:scale-110',
                    accent === color ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ background: color }}
                  aria-label={`Accent ${color}`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.store_button_style}</Label>
                <Select
                  value={store.settings?.button_style}
                  onChange={(e) =>
                    setStore((s) => ({
                      ...s,
                      settings: { ...s.settings!, button_style: e.target.value as 'pill' | 'rounded' | 'square' },
                    }))
                  }
                  options={[
                    { value: 'pill', label: t.store_pill },
                    { value: 'rounded', label: t.store_rounded },
                    { value: 'square', label: t.store_square },
                  ]}
                />
              </div>
              <div>
                <Label>{t.store_theme}</Label>
                <Select
                  value={store.settings?.theme}
                  onChange={(e) =>
                    setStore((s) => ({ ...s, settings: { ...s.settings!, theme: e.target.value as 'light' | 'dark' } }))
                  }
                  options={[
                    { value: 'dark', label: t.store_dark },
                    { value: 'light', label: t.store_light },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.store_currency}</Label>
                <Select
                  value={store.settings?.currency}
                  onChange={(e) =>
                    setStore((s) => ({ ...s, settings: { ...s.settings!, currency: e.target.value } }))
                  }
                  options={[
                    { value: 'TND', label: 'TND · د.ت' },
                    { value: 'USD', label: 'USD · $' },
                    { value: 'EUR', label: 'EUR · €' },
                    { value: 'GBP', label: 'GBP · £' },
                    { value: 'MAD', label: 'MAD · DH' },
                  ]}
                />
              </div>
              <div>
                <Label>{t.store_delivery_fee}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={store.settings?.delivery_fee ?? 0}
                  onChange={(e) =>
                    setStore((s) => ({ ...s, settings: { ...s.settings!, delivery_fee: parseFloat(e.target.value) || 0 } }))
                  }
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border/60">
              <Button type="submit" variant="gold" isLoading={savingDesign}>
                {t.store_save}
              </Button>
            </div>
          </form>
        </TabContent>

        <TabContent value="profile" activeValue={tab}>
          <form onSubmit={saveProfile} className="card-surface p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <StoreIcon className="w-4 h-4 text-primary" /> {t.store_profile}
            </h3>
            <div>
              <Label>{t.store_logo}</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted/50 flex items-center justify-center">
                  {store.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={store.logo} alt={t.store_logo_alt} className="w-full h-full object-cover" />
                  ) : (
                    <StoreIcon className="w-6 h-6 text-muted-foreground/50" />
                  )}
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium cursor-pointer hover:bg-muted transition-colors">
                  <ImagePlus className="w-4 h-4" /> {t.store_logo}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadLogo(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>
            <div>
              <Label>{t.store_name}</Label>
              <Input value={store.store_name} disabled helperText={t.common_close} />
            </div>
            <Input
              label={t.store_description}
              value={store.description || ''}
              onChange={(e) => setStore((s) => ({ ...s, description: e.target.value }))}
              placeholder={t.store_description}
            />
            <Input
              label={t.store_instagram}
              value={store.instagram_username || ''}
              onChange={(e) => setStore((s) => ({ ...s, instagram_username: e.target.value }))}
              placeholder="yourhandle"
              helperText={t.store_contact_email}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.store_contact_email}
                type="email"
                value={store.contact_email || ''}
                onChange={(e) => setStore((s) => ({ ...s, contact_email: e.target.value }))}
                placeholder="hello@…"
              />
              <Input
                label={t.store_contact_phone}
                value={store.contact_phone || ''}
                onChange={(e) => setStore((s) => ({ ...s, contact_phone: e.target.value }))}
                placeholder="+1 555 000 0000"
              />
            </div>
            <Input
              label={t.store_contact_address}
              value={store.contact_address || ''}
              onChange={(e) => setStore((s) => ({ ...s, contact_address: e.target.value }))}
              placeholder={t.store_contact_address}
            />
            <Input
              label={t.store_city}
              value={store.contact_city || ''}
              onChange={(e) => setStore((s) => ({ ...s, contact_city: e.target.value }))}
              placeholder={t.store_city}
            />
            <div className="pt-4 border-t border-border/60">
              <Button type="submit" variant="gold" isLoading={saving}>
                {t.store_save}
              </Button>
            </div>
          </form>
        </TabContent>

        <div className="lg:sticky lg:top-20">
          <p className="text-sm font-medium text-muted-foreground mb-3">{t.store_preview}</p>
          <PhonePreview store={store} accent={accent} />
        </div>
      </div>
    </div>
  );
}

function PhonePreview({ store, accent }: { store: Store; accent: string }) {
  const { t } = useTranslation();
  const radius =
    store.settings?.button_style === 'pill'
      ? 'rounded-full'
      : store.settings?.button_style === 'square'
      ? 'rounded-none'
      : 'rounded-xl';
  const theme = store.settings?.theme || 'dark';

  return (
    <div className={cn('mx-auto w-[290px] rounded-[2rem] border-4 p-2 overflow-hidden transition-colors', theme === 'light' ? 'border-zinc-300 bg-white' : 'border-zinc-700 bg-zinc-900')}>
      <div className="flex items-center justify-center pt-1 pb-2">
        <div className={cn('w-16 h-4 rounded-full', theme === 'light' ? 'bg-zinc-200' : 'bg-zinc-700')} />
      </div>
      <div
        className={cn('rounded-2xl p-4', theme === 'light' ? 'bg-zinc-50' : 'bg-gradient-to-br from-zinc-800 to-zinc-900')}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden" style={{ background: accent }}>
            {store.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logo} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div>
            <p className={cn('text-sm font-semibold', theme === 'light' ? 'text-zinc-900' : 'text-white')}>
              {store.store_name}
            </p>
            <p className={cn('text-[10px]', theme === 'light' ? 'text-zinc-500' : 'text-zinc-400')}>
              {store.instagram_username ? `@${store.instagram_username}` : store.store_name}
            </p>
          </div>
        </div>
        {store.description && (
          <p className={cn('mt-3 text-xs leading-relaxed', theme === 'light' ? 'text-zinc-600' : 'text-zinc-300')}>
            {store.description}
          </p>
        )}
        <div className={cn('mt-4 space-y-2.5')}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn('flex items-center gap-2.5 p-2.5 rounded-xl', theme === 'light' ? 'bg-white border border-zinc-200' : 'bg-zinc-800/70')}>
              <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: `${accent}33` }} />
              <div className="flex-1">
                <div className={cn('h-2 rounded w-24', theme === 'light' ? 'bg-zinc-300' : 'bg-zinc-600')} />
                <div className={cn('h-2 rounded w-16 mt-1.5', theme === 'light' ? 'bg-zinc-200' : 'bg-zinc-700')} />
              </div>
              <button
                className={cn('px-3 py-1.5 text-[10px] font-bold text-white', radius)}
                style={{ background: accent }}
              >
                {t.store_buy}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
