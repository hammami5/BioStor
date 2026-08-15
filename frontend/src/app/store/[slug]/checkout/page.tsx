import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { CheckoutClient } from '@/components/storefront/CheckoutClient';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  try {
    const data = await publicApi.publicStore(slug);
    return { title: `Checkout — ${data.store.store_name}` };
  } catch {
    return { title: 'Checkout' };
  }
}

export default async function CheckoutPage({ params }: PageProps) {
  const { slug } = params;
  let store;
  try {
    store = (await publicApi.publicStore(slug)).store;
  } catch {
    notFound();
  }

  return (
    <CheckoutClient
      storeSlug={slug}
      storeName={store.store_name}
      settings={store.settings}
      isLight={store.settings?.theme === 'light'}
    />
  );
}
