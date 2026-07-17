'use client';

import { useCart } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CartPage() {
  const { items, update, remove, couponCode, setCoupon, discount } = useCart();
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const applyCoupon = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api/v1'}/cart/coupon`,
        { code: coupon }
      );
      setCoupon(coupon.toUpperCase(), data?.data?.discount ?? 0);
    } catch {
      setError('Invalid coupon');
      setCoupon(undefined, 0);
    } finally { setLoading(false); }
  };

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <ShoppingBag className="mx-auto mb-4 text-champagne" size={32} />
        <h1 className="font-serif text-4xl">Your cart is empty</h1>
        <p className="mt-2 text-charcoal-300">Curate your story with timeless pieces.</p>
        <Link href="/shop" className="btn-primary mt-6">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12 grid gap-10 md:grid-cols-[1fr_400px]">
      <div>
        <h1 className="font-serif text-4xl">Your Cart ({items.length})</h1>
        <div className="mt-8 divide-y divide-charcoal-100">
          {items.map((i) => (
            <div key={i.id} className="flex gap-4 py-6">
              <Link href={`/product/${i.slug}`} className="w-24 md:w-32 aspect-[4/5] overflow-hidden rounded-md bg-ivory">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex-1">
                <Link href={`/product/${i.slug}`} className="font-serif text-xl hover:text-primary">{i.name}</Link>
                <p className="text-xs text-charcoal-300 mt-1">{i.size ?? 'Standard'}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => update(i.id, i.quantity - 1)} className="h-9 w-9 rounded-full border border-charcoal-100">−</button>
                  <span className="w-10 text-center">{i.quantity}</span>
                  <button onClick={() => update(i.id, i.quantity + 1)} className="h-9 w-9 rounded-full border border-charcoal-100">+</button>
                  <button onClick={() => remove(i.id)} className="ml-3 text-charcoal-300 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="font-medium">{formatCurrency(i.unitPrice * i.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit rounded-xl2 bg-ivory p-6 sticky top-28">
        <h2 className="font-serif text-2xl">Order summary</h2>
        <div className="my-4 flex gap-2">
          <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon" className="input flex-1" />
          <button onClick={applyCoupon} disabled={loading} className="btn-outline px-4">{loading ? '…' : 'Apply'}</button>
        </div>
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        {couponCode && !error && <p className="text-xs text-champagne-500 mb-2">Applied: {couponCode}</p>}
        <div className="space-y-2 text-sm">
          <Row label="Subtotal" value={formatCurrency(subtotal)} />
          {discount > 0 && <Row label="Discount" value={`− ${formatCurrency(discount)}`} />}
          <Row label="Shipping" value={shipping === 0 ? 'Free' : formatCurrency(shipping)} />
          <Row label="Tax" value={formatCurrency(tax)} />
          <div className="flex justify-between border-t border-charcoal-200 pt-3 mt-3 font-medium">
            <span>Total</span><span>{formatCurrency(total)}</span>
          </div>
        </div>
        <Link href="/checkout" className="btn-primary w-full mt-6">Proceed to checkout</Link>
        <p className="mt-3 text-[11px] text-charcoal-300 text-center">Free shipping across India on orders above ₹1500.</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-charcoal-300">{label}</span><span>{value}</span></div>;
}
