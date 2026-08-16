'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n';
import { ProductForm } from '@/components/products/ProductForm';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Category } from '@/types';

export default function NewProductPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> {t.products_back_to_products}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t.products_create_title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.products_add_desc}
        </p>
      </div>
      {loading ? <Skeleton className="h-96" /> : <ProductForm categories={categories} />}
    </div>
  );
}
