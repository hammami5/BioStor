import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Storefront',
  robots: { index: true, follow: true },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
