'use client';

import { Smartphone, Package, Palette, BarChart3, MessageSquare, Globe } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function FeaturesSection({ id }: { id?: string }) {
  const { t } = useTranslation();

  const features = [
    {
      icon: Smartphone,
      title: t.feature1_title,
      description: t.feature1_desc,
    },
    {
      icon: Palette,
      title: t.feature2_title,
      description: t.feature2_desc,
    },
    {
      icon: Package,
      title: t.feature3_title,
      description: t.feature3_desc,
    },
    {
      icon: MessageSquare,
      title: t.feature4_title,
      description: t.feature4_desc,
    },
    {
      icon: BarChart3,
      title: t.feature5_title,
      description: t.feature5_desc,
    },
    {
      icon: Globe,
      title: t.feature6_title,
      description: t.feature6_desc,
    },
  ];

  return (
    <section id={id} className="py-20 lg:py-28 border-t border-border/60 bg-black/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t.features_subtitle}</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            {t.features_title}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {t.features_desc}
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="card-surface p-6 group hover:border-primary/30 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
