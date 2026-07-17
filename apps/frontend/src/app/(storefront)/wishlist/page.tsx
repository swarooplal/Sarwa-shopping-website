'use client';

import { useWishlist } from '@/store/wishlist';
import { useProducts } from '@/hooks/queries';
import { ProductCard } from '@/components/storefront/ProductCard';
import Link from 'next/link';

export default function WishlistPage() {
  const items = useWishlist((s) => s.items);
  const { data, isLoading } = useProducts({ pageSize: 50 });
  const all = (data as any)?.data ?? [];
  const list = all.filter((p: any) => items.includes(p.id));

  return (
    <div className="container-x py-16">
      <div className="text-center mb-12">
        <span className="eyebrow">My selection</span>
        <h1 className="font-serif text-5xl mt-2">Wishlist</h1>
        <p className="text-sm text-charcoal-300 mt-2">Your saved pieces, ready when you are.</p>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif text-xl mb-4">Your wishlist is empty.</p>
          <Link href="/shop" className="btn-primary">Discover pieces</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {list.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
