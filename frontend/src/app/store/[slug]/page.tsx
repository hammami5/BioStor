import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { resolveAbsoluteUrl, SITE_URL } from '@/lib/utils';
import { CatalogClient } from '@/components/storefront/CatalogClient';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  try {
    const data = await publicApi.publicStore(slug);
    const image = resolveAbsoluteUrl(data.store.logo);
    const canonical = `${SITE_URL}/store/${slug}`;
    return {
      title: `${data.store.store_name} | BioStor`,
      description: data.store.description || `Shop at ${data.store.store_name} on BioStor`,
      openGraph: {
        title: data.store.store_name,
        description: data.store.description || `Shop at ${data.store.store_name} on BioStor`,
        url: canonical,
        siteName: 'BioStor',
        images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
        type: 'website',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: data.store.store_name,
        description: data.store.description || `Shop at ${data.store.store_name} on BioStor`,
        images: image ? [image] : undefined,
      },
      alternates: { canonical },
    };
  } catch {
    return { title: 'Store Not Found | BioStor' };
  }
}

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = params;
  let data;
  try {
    data = await publicApi.publicStore(slug);
  } catch {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <CatalogClient
        store={data.store}
        products={data.products}
        categories={data.categories}
      />
    </Suspense>
  );
}
