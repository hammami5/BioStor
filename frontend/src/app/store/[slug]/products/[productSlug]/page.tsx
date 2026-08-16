import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { resolveAbsoluteUrl } from '@/lib/utils';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';

interface PageProps {
  params: { slug: string; productSlug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, productSlug } = params;
  try {
    const product = await publicApi.publicProduct(slug, productSlug);
    const image = resolveAbsoluteUrl(product.images[0]);
    return {
      title: product.name,
      description: product.description || undefined,
      openGraph: {
        title: product.name,
        description: product.description || undefined,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return { title: 'Product' };
  }
}

export default async function PublicProductPage({ params }: PageProps) {
  const { slug, productSlug } = params;
  let product;
  let store;
  try {
    [product, store] = await Promise.all([
      publicApi.publicProduct(slug, productSlug),
      publicApi.publicStore(slug),
    ]);
  } catch {
    notFound();
  }

  return (
    <ProductDetailClient
      product={product}
      storeSlug={slug}
      storeName={store.store.store_name}
      settings={store.store.settings}
      isLight={store.store.settings?.theme === 'light'}
    />
  );
}
