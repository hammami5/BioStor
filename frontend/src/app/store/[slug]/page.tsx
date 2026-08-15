import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { CatalogClient } from '@/components/storefront/CatalogClient';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  try {
    const data = await publicApi.publicStore(slug);
    return {
      title: data.store.store_name,
      description: data.store.description || undefined,
      openGraph: {
        title: data.store.store_name,
        description: data.store.description || undefined,
        images: data.store.logo ? [data.store.logo] : undefined,
      },
    };
  } catch {
    return { title: 'Storefront' };
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
