'use client';

import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Amira K.',
    role: 'Skincare founder · 48k followers',
    quote:
      'I had customers asking how to buy for months. BioStor gave me a store in one afternoon — my DMs now say "just ordered!".',
    initial: 'A',
  },
  {
    name: 'Diego R.',
    role: 'Streetwear brand · 120k followers',
    quote:
      'We were on spreadsheets and DMs. Moving to BioStor felt like getting a real brand overnight. The checkout flow is genius.',
    initial: 'D',
  },
  {
    name: 'Sofia M.',
    role: 'Jewelry designer · 23k followers',
    quote:
      'The store looks exactly like my aesthetic. Custom colors made all the difference. My conversion doubled in a month.',
    initial: 'S',
  },
];

export function TestimonialsSection({ id }: { id?: string }) {
  return (
    <section id={id} className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Loved by sellers</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            Creators who switched to BioStor
          </h2>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card-surface p-6 relative">
              <Quote className="w-8 h-8 text-primary/30" />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">“{t.quote}”</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-sm">
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
