'use client';

import Link from 'next/link';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';

export default function StoreNotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-zinc-800 flex items-center justify-center mx-auto mb-6">
          <Store className="w-10 h-10 text-zinc-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {t.store_not_found_title}
        </h1>
        <p className="text-zinc-400 mb-8">
          {t.store_not_found_desc}
        </p>
        <Link href="/">
          <Button variant="gold" className="gap-2">
            {t.store_not_found_back}
          </Button>
        </Link>
      </div>
    </div>
  );
}
