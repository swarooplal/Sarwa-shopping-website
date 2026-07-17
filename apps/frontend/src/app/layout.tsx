import './globals.css';
import type { Metadata } from 'next';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { MotionProvider } from '@/components/providers/MotionProvider';

export const metadata: Metadata = {
  title: { default: 'SARWA — Heritage Sarees & Jewellery', template: '%s · SARWA' },
  description:
    'SARWA is a luxury Indian saree & jewellery house celebrating heritage craftsmanship and contemporary elegance.',
  openGraph: {
    title: 'SARWA — Heritage Sarees & Jewellery',
    description: 'Handpicked sarees, fine jewellery — made for the modern Indian.',
    type: 'website',
  },
  metadataBase: new URL('http://localhost:3000'),
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-white">
      <body className="min-h-screen bg-white text-charcoal antialiased">
        <QueryProvider>
          <MotionProvider>{children}</MotionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
