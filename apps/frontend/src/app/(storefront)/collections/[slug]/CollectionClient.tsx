'use client';

import { useCollection, useProducts } from '@/hooks/queries';
import { ProductCard } from '@/components/storefront/ProductCard';
import Image from 'next/image';
import { FilterPanel } from '@/components/storefront/FilterPanel';

export function CollectionClient({ slug }: { slug: string }) {
  const { data: collection } = useCollection(slug);
  const { data: productsData } = useProducts({ collection: slug, pageSize: 24 });
  const products = (productsData as any)?.data ?? [];

  return (
    <div>
      <section className="relative h-[55vh] w-full overflow-hidden">
        <Image
          src={collection?.image ?? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920'}
          alt={collection?.name ?? ''}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 grid place-items-center text-center text-ivory px-6">
          <div>
            <span className="eyebrow text-champagne">SARWA · Collection</span>
            <h1 className="font-serif text-5xl md:text-7xl mt-2">{collection?.name ?? slug}</h1>
            {collection?.description && (
              <p className="mt-4 max-w-2xl mx-auto text-base text-ivory/85">{collection.description}</p>
            )}
          </div>
        </div>
      </section>

      <div className="container-x grid gap-10 py-12 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:block sticky top-28 self-start h-fit">
          <FilterPanel />
        </aside>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
