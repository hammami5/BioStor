'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/context';

export function CTASection() {
  const { user } = useAuth();
  const href = user ? (user.role === 'super_admin' ? '/admin' : '/dashboard') : '/register';

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-transparent to-transparent p-10 sm:p-16 text-center">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/10 blur-[100px] pointer-events-none"
            aria-hidden="true"
          />
          <h2 className="relative text-3xl sm:text-5xl font-bold tracking-tight text-balance">
            Your followers are ready to buy.
            <br />
            <span className="gradient-text">Give them a store.</span>
          </h2>
          <p className="relative mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
            Set up your BioStor link in minutes. Your first order could be waiting.
          </p>
          <div className="relative mt-8">
            <Link href={href}>
              <Button variant="gold" size="xl">
                Start your store — it&apos;s free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
