'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCategories } from '@/hooks/queries';
import { useState } from 'react';

export function FilterPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: categories } = useCategories();
  const [priceMin, setPriceMin] = useState(params.get('minPrice') ?? '');
  const [priceMax, setPriceMax] = useState(params.get('maxPrice') ?? '');

  const buildUrl = (updates: Record<string, string | null>) => {
    const u = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '') u.delete(k);
      else u.set(k, v);
    });
    return `/shop?${u.toString()}`;
  };

  const setFilter = (k: string, v: string) => router.push(buildUrl({ [k]: v }));
  const active = (k: string) => params.get(k);

  return (
    <div className="space-y-8 text-sm">
      <div>
        <h4 className="eyebrow mb-3">Category</h4>
        <ul className="space-y-2">
          {categories?.filter((c: any) => !c.parentId).map((c: any) => (
            <li key={c.id}>
              <button
                className={`hover:text-primary transition ${active('category') === c.slug ? 'text-primary font-medium' : 'text-charcoal-300'}`}
                onClick={() => setFilter('category', c.slug)}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="eyebrow mb-3">Price</h4>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="Min"
            className="input !py-2 text-sm"
          />
          <span className="text-charcoal-300">—</span>
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Max"
            className="input !py-2 text-sm"
          />
        </div>
        <button
          onClick={() =>
            router.push(buildUrl({ minPrice: priceMin || null, maxPrice: priceMax || null }))
          }
          className="mt-3 text-[11px] uppercase tracking-widest text-champagne-500"
        >
          Apply
        </button>
      </div>

      <div>
        <h4 className="eyebrow mb-3">Curated</h4>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setFilter('featured', 'true')}
              className={`hover:text-primary transition ${active('featured') ? 'text-primary font-medium' : 'text-charcoal-300'}`}
            >
              Featured
            </button>
          </li>
          <li>
            <button
              onClick={() => setFilter('new', 'true')}
              className={`hover:text-primary transition ${active('new') ? 'text-primary font-medium' : 'text-charcoal-300'}`}
            >
              New Arrivals
            </button>
          </li>
          <li>
            <button
              onClick={() => setFilter('trending', 'true')}
              className={`hover:text-primary transition ${active('trending') ? 'text-primary font-medium' : 'text-charcoal-300'}`}
            >
              Trending
            </button>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="eyebrow mb-3">Fabric</h4>
        <ul className="space-y-2">
          {['Silk', 'Cotton', 'Linen', 'Chiffon', 'Organza', 'Georgette'].map((f) => (
            <li key={f}>
              <button
                onClick={() => setFilter('fabric', f.toLowerCase())}
                className={`hover:text-primary transition ${active('fabric') === f.toLowerCase() ? 'text-primary font-medium' : 'text-charcoal-300'}`}
              >
                {f}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
