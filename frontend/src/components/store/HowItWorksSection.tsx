'use client';

import Link from 'next/link';
import { UserPlus, Image, Megaphone, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';

export function HowItWorksSection({ id }: { id?: string }) {
  const { t } = useTranslation();

  const steps = [
    {
      icon: UserPlus,
      title: t.step1_title,
      description: t.step1_desc,
    },
    {
      icon: Image,
      title: t.step2_title,
      description: t.step2_desc,
    },
    {
      icon: Megaphone,
      title: t.step3_title,
      description: t.step3_desc,
    },
    {
      icon: PackageCheck,
      title: t.step4_title,
      description: t.step4_desc,
    },
  ];

  return (
    <section id={id} className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t.how_it_works_subtitle}</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            {t.how_it_works_title}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {t.how_it_works_desc}
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="card-surface p-6 h-full">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center text-black">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-4xl font-bold text-border/40">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/register">
            <Button variant="gold" size="lg">
              {t.how_it_works_cta}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
