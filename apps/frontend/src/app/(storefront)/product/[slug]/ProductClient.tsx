'use client';

import { useProduct, useReviews, useProducts } from '@/hooks/queries';
import { ProductGallery } from '@/components/storefront/ProductGallery';
import { ProductInfo } from '@/components/storefront/ProductInfo';
import { ProductCard } from '@/components/storefront/ProductCard';
import { useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

export function ProductClient({ slug }: { slug: string }) {
  const { data: product, isLoading } = useProduct(slug);
  const { data: reviews } = useReviews(product?.id);
  const { data: relatedData } = useProducts({ category: product?.categories?.[0]?.category?.slug, pageSize: 4 });
  const [openSection, setOpenSection] = useState<string | null>('description');

  if (isLoading) {
    return (
      <div className="container-x py-12 grid gap-12 md:grid-cols-2">
        <div className="aspect-[4/5] rounded-xl bg-ivory animate-pulse" />
        <div className="space-y-3">
          <div className="h-7 w-3/4 rounded bg-ivory animate-pulse" />
          <div className="h-4 w-1/4 rounded bg-ivory animate-pulse" />
          <div className="h-10 w-1/3 rounded bg-ivory animate-pulse mt-6" />
          <div className="h-12 w-full rounded-full bg-ivory animate-pulse mt-6" />
        </div>
      </div>
    );
  }

  if (!product) return <div className="container-x py-24 text-center">Product not found.</div>;

  return (
    <div className="container-x py-10">
      <div className="grid gap-12 md:grid-cols-2">
        <ProductGallery images={product.images?.map((i: any) => i.url) ?? []} />
        <ProductInfo product={product} />
      </div>

      <section className="mt-20 max-w-3xl">
        <Accordion
          open={openSection === 'description'}
          onToggle={() => setOpenSection(openSection === 'description' ? null : 'description')}
          title="Description"
        >
          <p className="text-sm leading-8 text-charcoal">{product.description}</p>
        </Accordion>
        <Accordion
          open={openSection === 'care'}
          onToggle={() => setOpenSection(openSection === 'care' ? null : 'care')}
          title="Fabric & Care"
        >
          <p className="text-sm leading-8 text-charcoal">
            Fabric: {product.fabric ?? 'Premium heritage blend'}. Dry clean only. Store flat in muslin. Colour may vary slightly due to lighting.
          </p>
        </Accordion>
        <Accordion
          open={openSection === 'shipping'}
          onToggle={() => setOpenSection(openSection === 'shipping' ? null : 'shipping')}
          title="Shipping & Returns"
        >
          <p className="text-sm leading-8 text-charcoal">
            Free shipping across India on orders above ₹1500. International shipping calculated at checkout.
            7-day return on unused pieces. Custom orders are non-returnable.
          </p>
        </Accordion>
      </section>

      <section className="mt-20">
        <h2 className="font-serif text-3xl mb-8">Customer Reviews</h2>
        {reviews?.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {reviews.map((r: any) => (
              <div key={r.id} className="luxury-card p-6">
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? 'fill-champagne text-champagne' : 'text-charcoal-100'} />
                  ))}
                </div>
                {r.title && <h4 className="font-serif text-lg">{r.title}</h4>}
                <p className="text-sm leading-7 text-charcoal mt-2">{r.comment}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-champagne-500">— {r.userName}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-charcoal-300">No reviews yet. Be the first to share your thoughts.</p>
        )}
      </section>

      <section className="mt-20">
        <h2 className="font-serif text-3xl mb-8">You may also love</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {((relatedData as any)?.data ?? []).slice(0, 4).map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Accordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-t border-charcoal-100">
      <button onClick={onToggle} className="flex w-full items-center justify-between py-4">
        <span className="font-serif text-lg">{title}</span>
        <ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden pb-6"
          >
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
