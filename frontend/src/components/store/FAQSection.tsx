'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: 'Do I need to know how to code?',
    a: 'Not at all. BioStor is designed to be used without any technical skills. Add products, customize the look, and share your link — that is it.',
  },
  {
    q: 'How do my customers pay?',
    a: 'Customers place an order through a simple form — they share their name, phone, and delivery details. You confirm the order and arrange payment and shipping your way, which keeps fees at zero.',
  },
  {
    q: 'Can I use my own logo and colors?',
    a: 'Yes. Free plans include BioStor branding, while Pro and Business plans let you upload your logo, pick custom accent colors, and choose button styles to match your brand.',
  },
  {
    q: 'How much does it cost?',
    a: 'BioStor is free to start with 20 products. Pro is $12/month and Business is $29/month. There are never any transaction fees on top.',
  },
  {
    q: 'Where should I put my store link?',
    a: 'Anywhere your audience is: your Instagram bio, TikTok bio, Facebook page, YouTube channel, or even a QR code on packaging.',
  },
  {
    q: 'What happens if I cancel my subscription?',
    a: 'Your store and data stay safe. You keep your free plan features and can upgrade again whenever you like.',
  },
];

export function FAQSection({ id }: { id?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id={id} className="py-20 lg:py-28 border-t border-border/60 bg-black/20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="card-surface overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300',
                    openIndex === i && 'rotate-180 text-primary'
                  )}
                />
              </button>
              <div
                className={cn(
                  'grid transition-all duration-300 ease-in-out',
                  openIndex === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
