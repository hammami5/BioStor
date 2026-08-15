'use client';

import { Smartphone, Package, Palette, BarChart3, MessageSquare, Globe } from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Mobile-first storefront',
    description:
      'A store that looks stunning on any phone. Your followers tap your link and land straight on a store built to convert.',
  },
  {
    icon: Palette,
    title: 'Your brand, your look',
    description:
      'Custom colors, button styles, and your logo. Match your aesthetic and make your store unmistakably yours.',
  },
  {
    icon: Package,
    title: 'Products & variants',
    description:
      'Add products in seconds — sizes, colors, pricing, stock. Organize with categories and highlight bestsellers.',
  },
  {
    icon: MessageSquare,
    title: 'Orders without friction',
    description:
      'Customers checkout by message-style forms. No accounts, no clutter. Orders arrive to you instantly.',
  },
  {
    icon: BarChart3,
    title: 'Real-time analytics',
    description:
      'Revenue, orders, best sellers and conversion — see what works and double down on it.',
  },
  {
    icon: Globe,
    title: 'One link everywhere',
    description:
      'Point your Instagram, TikTok, or Facebook bio link to your store. Every follower becomes a potential customer.',
  },
];

export function FeaturesSection({ id }: { id?: string }) {
  return (
    <section id={id} className="py-20 lg:py-28 border-t border-border/60 bg-black/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Why BioStor</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            Everything you need to sell from your bio
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Built for creators, influencers, and small brands who want a real storefront — without
            the complexity of traditional ecommerce.
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
