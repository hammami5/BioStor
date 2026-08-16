'use client';

import Link from 'next/link';
import { Store } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function Footer() {
  const { t } = useTranslation();

  const columns = [
    {
      title: t.footer_product,
      links: [
        { name: t.footer_features, href: '/#features' },
        { name: t.footer_pricing, href: '/#pricing' },
        { name: t.footer_faq, href: '/#faq' },
      ],
    },
    {
      title: t.footer_company,
      links: [
        { name: t.footer_for_sellers, href: '/#how-it-works' },
        { name: t.footer_get_started, href: '/register' },
        { name: t.footer_sign_in, href: '/login' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-black/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center">
                <Store className="w-5 h-5 text-black" strokeWidth={2.2} />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Bio<span className="gradient-text">Stor</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              {t.footer_description}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} BioStor. {t.footer_rights}</p>
          <p className="text-xs text-muted-foreground">{t.footer_tagline}</p>
        </div>
      </div>
    </footer>
  );
}
