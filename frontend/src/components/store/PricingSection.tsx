'use client';

import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export function PricingSection({ id }: { id?: string }) {
  const { t } = useTranslation();

  const plans = [
    {
      name: t.pricing_free,
      price: '$0',
      period: t.pricing_year,
      description: t.pricing_free_desc,
      features: [
        t.pricing_free_feat1,
        t.pricing_free_feat2,
        t.pricing_free_feat3,
        t.pricing_free_feat4,
        t.pricing_free_feat5,
      ],
      cta: t.pricing_free_cta,
      highlighted: false,
    },
    {
      name: t.pricing_pro,
      price: '$12',
      period: t.pricing_per_month,
      description: t.pricing_pro_desc,
      features: [
        t.pricing_pro_feat1,
        t.pricing_pro_feat2,
        t.pricing_pro_feat3,
        t.pricing_pro_feat4,
        t.pricing_pro_feat5,
        t.pricing_pro_feat6,
      ],
      cta: t.pricing_pro_cta,
      highlighted: true,
    },
    {
      name: t.pricing_business,
      price: '$29',
      period: t.pricing_per_month,
      description: t.pricing_business_desc,
      features: [
        t.pricing_business_feat1,
        t.pricing_business_feat2,
        t.pricing_business_feat3,
        t.pricing_business_feat4,
        t.pricing_business_feat5,
        t.pricing_business_feat6,
      ],
      cta: t.pricing_business_cta,
      highlighted: false,
    },
  ];

  return (
    <section id={id} className="py-20 lg:py-28 border-t border-border/60 bg-black/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t.pricing_subtitle}</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            {t.pricing_title}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {t.pricing_desc}
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
                  {t.pricing_popular}
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
