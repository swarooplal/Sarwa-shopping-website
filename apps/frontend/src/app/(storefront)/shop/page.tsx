'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { FilterPanel } from '@/components/storefront/FilterPanel';
import { useProducts, useCategories } from '@/hooks/queries';
import { useState } from 'react';
import { m } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

function ShopInner() {
  const searchParams = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const category = searchParams.get('category') ?? undefined;
  const collection = searchParams.get('collection') ?? undefined;
  const featured = searchParams.get('featured') === 'true';
  const newArrival = searchParams.get('new') === 'true';
  const trending = searchParams.get('trending') === 'true';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sortBy = searchParams.get('sortBy') ?? 'newest';

  const { data, isLoading } = useProducts({
    category, collection,
    featured: featured || undefined,
    isNewArrival: newArrival || undefined,
    isTrending: trending || undefined,
    minPrice, maxPrice, sortBy,
    pageSize: 24,
  });

  const products = data ?? [];

  return (
    <div className="container-x grid gap-10 py-10 md:grid-cols-[260px_1fr]">
      <aside className="hidden md:block sticky top-28 self-start h-fit">
        <FilterPanel />
      </aside>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="eyebrow">SARWA</span>
            <h1 className="font-serif text-4xl md:text-5xl mt-2">
              {category ? `Shop ${category.replace(/-/g, ' ')}` : collection ? 'Curated collection' : 'All Products'}
            </h1>
            <p className="text-sm text-charcoal-300 mt-1">{products.length ?? (isLoading ? '…' : 0)} pieces</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen(true)}
              className="md:hidden btn-outline !py-2 !px-4 text-xs"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <SortSelect />
          </div>
        </div>

        {isLoading ? <GridSkeleton /> : products.length === 0 ? <Empty /> : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
            {products.map((p: any, i: number) => (
              <m.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ProductCard product={p} />
              </m.div>
            ))}
          </div>
        )}
      </div>

      {filterOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-white p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl">Filters</h3>
            <button onClick={() => setFilterOpen(false)}><X /></button>
          </div>
          <FilterPanel />
          <button onClick={() => setFilterOpen(false)} className="btn-primary w-full mt-8">Apply</button>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-x py-10">Loading…</div>}>
      <ShopInner />
    </Suspense>
  );
}

function SortSelect() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const cur = params?.get('sortBy') ?? 'newest';
  const update = (v: string) => {
    if (typeof window === 'undefined') return;
    const u = new URL(window.location.href);
    if (v === 'newest') u.searchParams.delete('sortBy');
    else u.searchParams.set('sortBy', v);
    window.location.href = u.toString();
  };
  return (
    <select
      value={cur}
      onChange={(e) => update(e.target.value)}
      className="rounded-full border border-charcoal-100 bg-white px-4 py-2 text-xs uppercase tracking-widest"
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low → High</option>
      <option value="price-desc">Price: High → Low</option>
    </select>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[4/5] rounded-xl bg-ivory animate-pulse" />
          <div className="h-3 w-2/3 rounded bg-ivory animate-pulse" />
          <div className="h-3 w-1/3 rounded bg-ivory animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <p className="font-serif text-2xl">No products match these filters.</p>
      <p className="text-sm text-charcoal-300 mt-2">Try removing a filter.</p>
    </div>
  );
}
