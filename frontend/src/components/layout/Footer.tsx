'use client';

import Link from 'next/link';
import { Store } from 'lucide-react';

const columns = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', href: '/#pricing' },
      { name: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'For sellers', href: '/#how-it-works' },
      { name: 'Get started', href: '/register' },
      { name: 'Sign in', href: '/login' },
    ],
  },
];

export function Footer() {
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
              The premium way to turn your Instagram, TikTok, or Facebook bio link into a
              beautiful storefront. No code. No monthly fees to start.
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
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} BioStor. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Made for modern creators.</p>
        </div>
      </div>
    </footer>
  );
}
