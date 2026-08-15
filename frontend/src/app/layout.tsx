import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { Providers } from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: {
    default: 'BioStor — Turn Your Bio Link Into a Professional Store',
    template: '%s · BioStor',
  },
  description:
    'Create a beautiful, mobile-optimized storefront in minutes. Start selling directly from your Instagram, TikTok, or Facebook bio link. No coding required.',
  keywords: [
    'bio store',
    'instagram store',
    'social commerce',
    'link in bio',
    'ecommerce',
    'mobile store',
  ],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'BioStor — Turn Your Bio Link Into a Professional Store',
    description: 'Create a beautiful, mobile-optimized storefront in minutes.',
    siteName: 'BioStor',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
