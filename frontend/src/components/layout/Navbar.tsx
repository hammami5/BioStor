'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Store } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const links = [
  { name: 'Features', href: '#features' },
  { name: 'How it works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const ctaHref = user ? (user.role === 'super_admin' ? '/admin' : '/dashboard') : '/register';
  const ctaLabel = user ? 'Go to dashboard' : 'Start free';

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background/85 backdrop-blur-xl border-b border-border' : 'bg-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-glow-gold">
              <Store className="w-5 h-5 text-black" strokeWidth={2.2} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Bio<span className="gradient-text">Stor</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!user && (
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
            )}
            <Link href={ctaHref}>
              <Button variant="gold" size="md">
                {loading ? 'Loading…' : ctaLabel}
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1 animate-slide-down">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              {!user && (
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
              )}
              <Link href={ctaHref} onClick={() => setOpen(false)}>
                <Button variant="gold" className="w-full">
                  {ctaLabel}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
