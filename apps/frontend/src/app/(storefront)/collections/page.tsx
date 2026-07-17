'use client';

import { useCollections } from '@/hooks/queries';
import { CollectionCard } from '@/components/storefront/CollectionCard';
import { SectionHeader } from '@/components/storefront/SectionHeader';

export default function CollectionsPage() {
  const { data } = useCollections();
  return (
    <div className="container-x py-16">
      <SectionHeader eyebrow="Shop by collection" title="The SARWA Edit" subtitle="Each collection is a story — woven with intention, designed for the modern Indian." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((c: any) => (
          <CollectionCard
            key={c.id}
            title={c.name}
            subtitle={c.type}
            image={c.image ?? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900'}
            href={`/collections/${c.slug}`}
          />
        ))}
      </div>
    </div>
  );
}
