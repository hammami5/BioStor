'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Instagram, ShoppingBag, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/context';
import { useTranslation } from '@/lib/i18n';

export function HeroSection() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const ctaHref = user ? (user.role === 'super_admin' ? '/admin' : '/dashboard') : '/register';

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/10 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-medium text-primary">
                <Instagram className="w-3.5 h-3.5" />
                {t.hero_badge}
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance"
            >
              {t.hero_title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground max-w-xl"
            >
              {t.hero_subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Link href={ctaHref}>
                <Button variant="gold" size="lg" className="w-full sm:w-auto">
                  {t.hero_cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t.hero_secondary}
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-10 grid grid-cols-3 gap-6 max-w-md"
            >
              {[
                { value: t.hero_stat1_value, label: t.hero_stat1_label },
                { value: t.hero_stat2_value, label: t.hero_stat2_label },
                { value: t.hero_stat3_value, label: t.hero_stat3_label },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

function PhoneMockup() {
  const { t } = useTranslation();

  const products = [
    { name: t.hero_mockup_product1_name, price: t.hero_mockup_product1_price, tag: t.hero_mockup_product1_tag },
    { name: t.hero_mockup_product2_name, price: t.hero_mockup_product2_price, tag: t.hero_mockup_product2_tag },
    { name: t.hero_mockup_product3_name, price: t.hero_mockup_product3_price, tag: t.hero_mockup_product3_tag },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative mx-auto"
    >
      <div className="w-[300px] sm:w-[330px] rounded-[2.5rem] border-[6px] border-zinc-800 bg-zinc-900 shadow-soft overflow-hidden">
        <div className="flex items-center justify-center pt-2 pb-1">
          <div className="w-20 h-5 rounded-full bg-zinc-800" />
        </div>
        <div className="px-4 py-3 bg-gradient-to-br from-zinc-800 to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{t.hero_mockup_store}</p>
              <p className="text-[10px] text-zinc-400">{t.hero_mockup_handle}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-300 leading-relaxed">
            {t.hero_mockup_bio}
          </p>
        </div>
        <div className="px-4 py-3 space-y-3">
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="flex items-center gap-3 bg-zinc-800/70 rounded-2xl p-2.5"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                <Star className="w-5 h-5 text-gold-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{p.name}</p>
                <p className="text-sm font-bold gradient-text">{p.price}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {p.tag !== t.hero_mockup_product1_tag ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-semibold">
                    {p.tag}
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white font-semibold">
                    {p.tag}
                  </span>
                )}
                <button className="w-7 h-7 rounded-lg gold-gradient flex items-center justify-center text-black">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="px-4 pb-5">
          <div className="gold-gradient rounded-xl py-3 text-center">
            <p className="text-sm font-bold text-black">{t.hero_mockup_checkout}</p>
          </div>
        </div>
      </div>
      <div
        className="absolute -bottom-4 -left-6 px-4 py-3 rounded-2xl bg-card border border-border shadow-soft animate-float"
      >
        <p className="text-xs text-muted-foreground">{t.hero_mockup_new_order}</p>
        <p className="text-sm font-bold gradient-text">+$24.00</p>
      </div>
    </motion.div>
  );
}
