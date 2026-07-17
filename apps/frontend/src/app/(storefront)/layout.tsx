import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { NewsletterPopup } from '@/components/storefront/NewsletterPopup';
import { Suspense } from 'react';
import { SkeletonHeader } from '@/components/storefront/SkeletonHeader';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<SkeletonHeader />}>
        <Header />
      </Suspense>
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartDrawer />
      <NewsletterPopup />
    </>
  );
}
