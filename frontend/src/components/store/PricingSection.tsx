'use client';

import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started and testing the waters.',
    features: [
      'Up to 20 products',
      '1 active category set',
      'Standard analytics',
      'BioStor branding',
      'Order notifications',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For creators who are serious about selling.',
    features: [
      'Up to 100 products',
      'Custom branding & logo',
      'Advanced analytics',
      'Priority support',
      'Unlimited orders',
      'Custom accent colors',
    ],
    cta: 'Go Pro',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '$29',
    period: '/month',
    description: 'For growing brands and teams.',
    features: [
      'Unlimited products',
      'Everything in Pro',
      'Custom button styles',
      'Featured product slots',
      'Early access features',
      'Dedicated support',
    ],
    cta: 'Go Business',
    highlighted: false,
  },
];

export function PricingSection({ id }: { id?: string }) {
  return (
    <section id={id} className="py-20 lg:py-28 border-t border-border/60 bg-black/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Start free. Upgrade when you grow. No transaction fees, ever.
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative card-surface p-7 flex flex-col',
                plan.highlighted && 'border-primary/50 shadow-glow-gold'
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full gold-gradient text-black text-xs font-bold">
                  <Sparkles className="w-3 h-3" />
                  Most popular
                </div>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-7 block">
                <Button variant={plan.highlighted ? 'gold' : 'outline'} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
