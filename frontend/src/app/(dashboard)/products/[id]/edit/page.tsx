'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n';
import { ProductForm } from '@/components/products/ProductForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/utils';
import type { Category, Product } from '@/types';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { error } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const id = parseInt(params.id);
        const [prod, cats] = await Promise.all([api.getProduct(id), api.listCategories()]);
        setProduct(prod);
        setCategories(cats);
      } catch (err) {
        error(t.products_not_found, getErrorMessage(err));
        router.replace('/dashboard/products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id, router, error, t.products_not_found]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> {t.products_back_to_products}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t.products_edit_title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.products_edit_desc}
        </p>
      </div>
      {loading ? (
        <Skeleton className="h-96" />
      ) : (
        <ProductForm product={product} categories={categories} />
      )}
    </div>
  );
}
