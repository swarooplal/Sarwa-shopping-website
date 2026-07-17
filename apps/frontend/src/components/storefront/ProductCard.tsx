'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/store/wishlist';
import { formatCurrency, calcDiscount } from '@/lib/utils';
import { useCart } from '@/store/cart';

export function ProductCard({ product, priority = false }: { product: any; priority?: boolean }) {
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.has)(product.id);
  const addToCart = useCart((s) => s.add);

  const discount = calcDiscount(Number(product.price), product.offerPrice ? Number(product.offerPrice) : null);
  const finalPrice = product.offerPrice ? Number(product.offerPrice) : Number(product.price);
  const img = product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800';

  return (
    <m.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4 }}
      className="group relative"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-ivory">
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-[1500ms] group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] tracking-widest text-ivory">
              −{discount}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="absolute right-3 top-3 rounded-full bg-champagne px-2.5 py-1 text-[10px] tracking-widest text-white">
              NEW
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggle(product.id); }}
            className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white shadow-soft hover:text-champagne-500 transition"
            aria-label="Wishlist"
          >
            <Heart size={16} className={has ? 'fill-champagne text-champagne' : ''} />
          </button>
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-serif text-base">{product.name}</p>
            <p className="text-[11px] uppercase tracking-widest text-charcoal-300">{product.fabric ?? product.color ?? 'Heritage'}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatCurrency(finalPrice)}</p>
            {product.offerPrice && Number(product.offerPrice) < Number(product.price) && (
              <p className="text-[11px] text-charcoal-300 line-through">{formatCurrency(Number(product.price))}</p>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={() =>
          addToCart({
            productId: product.id,
            name: product.name,
            slug: product.slug,
            image: img,
            unitPrice: finalPrice,
            quantity: 1,
          })
        }
        className="mt-2 w-full rounded-full border border-primary py-2 text-[11px] uppercase tracking-[0.2em] text-primary opacity-0 transition group-hover:opacity-100 hover:bg-primary hover:text-ivory"
      >
        Add to bag
      </button>
    </m.div>
  );
}
