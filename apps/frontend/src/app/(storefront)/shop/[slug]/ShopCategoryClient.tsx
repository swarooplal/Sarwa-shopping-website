'use client';

import { ProductCard } from '@/components/storefront/ProductCard';
import { useCategoryProducts, useProducts } from '@/hooks/queries';

export function ShopCategoryClient({ slug }: { slug: string }) {
  const { data, isLoading } = useProducts({ category: slug, pageSize: 24 });
  const products = (data as any)?.data ?? [];

  return (
    <div className="container-x py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="eyebrow">SARWA</span>
        <h1 className="font-serif text-4xl md:text-5xl mt-2 capitalize">{slug.replace(/-/g, ' ')}</h1>
        <div className="divider mt-4 mx-auto" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/5] rounded-xl bg-ivory animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-ivory animate-pulse" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-serif text-2xl">Coming Soon</p>
          <p className="text-sm text-charcoal-300 mt-2">We're curating pieces for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
