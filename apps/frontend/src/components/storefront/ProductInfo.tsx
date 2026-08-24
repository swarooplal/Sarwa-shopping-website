'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import { useAuth } from '@/store/auth';
import { requireAuth } from '@/components/shared/QuickAuthModal';
import { formatCurrency, calcDiscount } from '@/lib/utils';

export function ProductInfo({ product }: { product: any }) {
  const price = Number(product.price);
  const offerPrice = product.offerPrice ? Number(product.offerPrice) : null;
  const finalPrice = offerPrice && offerPrice < price ? offerPrice : price;
  const discount = calcDiscount(price, offerPrice);

  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const wishHas = useWishlist((s) => s.has)(product.id);
  const wishToggle = useWishlist((s) => s.toggle);

  const buildItem = () => ({
    productId: product.id,
    variantId: size ?? undefined,
    name: product.name,
    slug: product.slug,
    image: product.images?.[0]?.url ?? '',
    unitPrice: finalPrice,
    quantity: qty,
    size: size ?? undefined,
  });

  const onAdd = async () => {
    if (!user) {
      await requireAuth();
      if (!useAuth.getState().user) return;
    }
    add(buildItem());
    openCart();
  };

  const onBuyNow = async () => {
    if (!user) {
      await requireAuth();
      if (!useAuth.getState().user) return;
    }
    add(buildItem());
    router.push('/checkout');
  };

  const sizes = ['Free Size', 'S', 'M', 'L', 'XL'];

  return (
    <div>
      <span className="eyebrow">{product.fabric ?? 'SARWA · Heritage'}</span>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl leading-tight">{product.name}</h1>
      <p className="mt-3 text-sm text-charcoal-300">{product.shortDescription}</p>

      <div className="mt-5 flex items-baseline gap-3">
        <span className="text-3xl font-medium">{formatCurrency(finalPrice)}</span>
        {offerPrice && offerPrice < price && (
          <>
            <span className="text-sm text-charcoal-300 line-through">{formatCurrency(price)}</span>
            <span className="text-xs uppercase tracking-widest text-champagne-500">Save {discount}%</span>
          </>
        )}
      </div>

      <div className="divider mt-6" />

      <div className="mt-6">
        <p className="text-xs uppercase tracking-widest text-charcoal-300 mb-3">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`h-10 min-w-12 rounded-full border px-4 text-xs uppercase tracking-widest transition ${size === s ? 'border-primary bg-primary text-ivory' : 'border-charcoal-100 hover:border-primary'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <div className="flex items-center border border-charcoal-100 rounded-full">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-11">−</button>
          <span className="w-10 text-center">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="h-11 w-11">+</button>
        </div>
        <button onClick={onAdd} className="btn-primary flex-1">
          <ShoppingBag size={16} /> Add to bag
        </button>
        <button
          onClick={() => wishToggle(product.id)}
          className={`h-11 w-11 rounded-full border grid place-items-center transition ${wishHas ? 'border-champagne text-champagne' : 'border-charcoal-100 hover:border-primary'}`}
          aria-label="Wishlist"
        >
          <Heart size={18} className={wishHas ? 'fill-champagne' : ''} />
        </button>
      </div>

      <button onClick={onBuyNow} className="btn-gold mt-3 w-full">Buy it now</button>

      <ul className="mt-8 space-y-3 text-sm">
        <li className="flex items-start gap-3"><Truck size={18} className="text-champagne mt-0.5" /> Free shipping above ₹1500 · Estimated delivery 5-7 days</li>
        <li className="flex items-start gap-3"><RotateCcw size={18} className="text-champagne mt-0.5" /> 7-day return on unused pieces</li>
        <li className="flex items-start gap-3"><ShieldCheck size={18} className="text-champagne mt-0.5" /> Authenticity guaranteed · Directly from master weavers</li>
      </ul>

      <div className="mt-8 text-xs text-charcoal-300">
        <p>SKU: {product.sku}</p>
        <p>Category: {product.categories?.map((c: any) => c.category?.name).join(', ') ?? 'Heritage'}</p>
      </div>
    </div>
  );
}
