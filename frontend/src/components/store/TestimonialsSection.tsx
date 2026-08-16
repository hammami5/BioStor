'use client';

import { Quote } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const testimonialNames = [
  { name: 'Amira K.', initial: 'A' },
  { name: 'Diego R.', initial: 'D' },
  { name: 'Sofia M.', initial: 'S' },
];

export function TestimonialsSection({ id }: { id?: string }) {
  const { t } = useTranslation();

  const testimonials = [
    {
      ...testimonialNames[0],
      role: t.testimonial1_role,
      quote: t.testimonial1_quote,
    },
    {
      ...testimonialNames[1],
      role: t.testimonial2_role,
      quote: t.testimonial2_quote,
    },
    {
      ...testimonialNames[2],
      role: t.testimonial3_role,
      quote: t.testimonial3_quote,
    },
  ];

  return (
    <section id={id} className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t.testimonials_subtitle}</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            {t.testimonials_title}
          </h2>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div key={item.name} className="card-surface p-6 relative">
              <Quote className="w-8 h-8 text-primary/30" />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-sm">
                  {item.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
