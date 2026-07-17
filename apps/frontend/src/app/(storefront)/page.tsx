'use client';

import { HeroSlider } from '@/components/storefront/HeroSlider';
import { SectionHeader } from '@/components/storefront/SectionHeader';
import { CollectionCard } from '@/components/storefront/CollectionCard';
import { ProductCard } from '@/components/storefront/ProductCard';
import { EditGrid, EditItem } from '@/components/storefront/EditGrid';
import { ReviewCard } from '@/components/storefront/ReviewCard';
import {
  useFeaturedProducts,
  useNewArrivals,
  useTrendingProducts,
  useCollections,
} from '@/hooks/queries';

export default function HomePage() {
  return (
    <>
      <HeroSlider />

      <section className="container-x py-20">
        <SectionHeader
          eyebrow="Curated collections"
          title="Shop by Edit"
          subtitle="From heritage silks to everyday cotton — the SARWA collections are made for moments, big and small."
        />
        <CollectionsGrid />
      </section>

      <section className="bg-ivory py-20">
        <div className="container-x">
          <SectionHeader
            eyebrow="Icons of the season"
            title="Featured Sarees"
            subtitle="Pieces our editors are reaching for this season."
            cta={{ label: 'View all', href: '/shop?featured=true' }}
          />
          <FeaturedGrid />
        </div>
      </section>

      <section className="container-x py-20">
        <SectionHeader
          eyebrow="Heritage reimagined"
          title="The Bridal Edit"
          subtitle="Handwoven heirlooms and timeless silhouettes."
        />
        <EditGrid
          items={[
            {
              id: 'bridal',
              title: 'Banarasi Silks',
              category: 'Heritage · Wedding',
              watermark: 'Bridal Edit',
              image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200',
              href: '/collections/wedding-edit',
            },
            {
              id: 'temple',
              title: 'Temple Jewellery',
              category: 'Statement',
              watermark: 'Heritage',
              image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=1200',
              href: '/shop/temple-jewellery',
            },
            {
              id: 'new',
              title: 'New Arrivals',
              category: 'Just In',
              watermark: 'New',
              image: 'https://images.unsplash.com/photo-1610189000263-c2eb18f8dad2?w=1200',
              href: '/shop?new=true',
            },
            {
              id: 'festive',
              title: 'Festive Edit',
              category: 'Celebration',
              watermark: 'SAREE',
              image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200',
              href: '/shop/festive',
            },
            {
              id: 'jewellery',
              title: 'Fine Jewellery',
              category: 'Treasures',
              watermark: 'GOLD',
              image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200',
              href: '/shop/jewellery',
            },
          ]}
        />
      </section>

      <section className="container-x py-20">
        <SectionHeader
          eyebrow="Just In"
          title="New Arrivals"
          subtitle="Fresh from the looms and ateliers of India."
          cta={{ label: 'Shop all new', href: '/shop?new=true' }}
        />
        <NewArrivals />
      </section>

      <section className="bg-primary text-ivory py-20">
        <div className="container-x">
          <SectionHeader
            eyebrow="The SARWA promise"
            title="Why choose us"
            subtitle="Heritage craftsmanship meets modern sensibility — designed to last, made to be lived in."
          />
          <div className="grid gap-10 md:grid-cols-4 text-center">
            <PromiseItem title="Handpicked" subtitle="Every piece personally curated by our editors." />
            <PromiseItem title="Authentic" subtitle="Direct from master weavers across India." />
            <PromiseItem title="Free Shipping" subtitle="On orders above ₹1500, across India." />
            <PromiseItem title="Easy Returns" subtitle="7-day returns on unused products." />
          </div>
        </div>
      </section>

      <section className="container-x py-20">
        <SectionHeader
          eyebrow="Loved by you"
          title="What our community says"
        />
        <div className="grid gap-6 md:grid-cols-3">
          <ReviewCard
            name="Aanya S."
            rating={5}
            title="Stunning craftsmanship"
            comment="The fabric, the fall, the colours — everything feels intentional. Worth every rupee."
          />
          <ReviewCard
            name="Priya R."
            rating={4}
            title="Gift-worthy packaging"
            comment="Sent a saree to my mother — the unboxing felt like a ritual. Beautiful."
          />
          <ReviewCard
            name="Meera K."
            rating={5}
            title="Heritage feel"
            comment="You can feel the craft in every thread. SARWA is the new heirloom destination."
          />
        </div>
      </section>

      <section className="container-x py-20">
        <SectionHeader
          eyebrow="Trending now"
          title="Beloved by SARWA"
          cta={{ label: 'View all', href: '/shop?trending=true' }}
        />
        <TrendingGrid />
      </section>

      <InstagramGallery />
    </>
  );
}

function CollectionsGrid() {
  const { data } = useCollections();
  const fallback = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200';
  const items: EditItem[] = (data ?? []).slice(0, 5).map((c: any) => ({
    id: c.id,
    title: c.name,
    category: c.type,
    watermark: (c.name ?? '').toUpperCase().slice(0, 12),
    image: c.image ?? fallback,
    href: `/collections/${c.slug}`,
  }));

  if (items.length === 0) return null;

  return (
    <EditGrid items={items} />
  );
}

function FeaturedGrid() {
  const { data } = useFeaturedProducts();
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {(data ?? []).slice(0, 4).map((p: any) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function NewArrivals() {
  const { data } = useNewArrivals();
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {(data ?? []).slice(0, 4).map((p: any) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function TrendingGrid() {
  const { data } = useTrendingProducts();
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {(data ?? []).slice(0, 4).map((p: any) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function PromiseItem({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="font-serif text-2xl text-champagne">{title}</h3>
      <p className="mt-2 text-sm text-ivory/75">{subtitle}</p>
    </div>
  );
}

function InstagramGallery() {
  const photos = [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
    'https://images.unsplash.com/photo-1610189000263-c3eb18f8dad2?w=600',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600',
    'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
  ];
  return (
    <section className="bg-ivory py-20">
      <div className="container-x">
        <SectionHeader eyebrow="@sarwa.in · Instagram" title="From the SARWA journal" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {photos.map((src, i) => (
            <a key={i} href="#" className="group relative block aspect-square overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Instagram" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
