'use client';

import { useCart } from '@/store/cart';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export function CartDrawer() {
  const { items, isOpen, close, update, remove, couponCode, setCoupon, clear } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const router = useRouter();

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const discount = useCart.getState().discount;
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const applyCoupon = async () => {
    setApplying(true);
    setCouponError(null);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api/v1'}/cart/coupon`,
        { code: couponInput }
      );
      const value = data?.data?.discount ?? 0;
      setCoupon(couponInput.toUpperCase(), value);
    } catch {
      setCouponError('Coupon invalid or below minimum purchase.');
      setCoupon(undefined, 0);
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70]"
        >
          <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={close} />
          <m.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-luxury flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-charcoal-100 p-5">
              <h3 className="font-serif text-xl">Your cart ({items.length})</h3>
              <button onClick={close} aria-label="Close"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <ShoppingBag size={32} className="mx-auto mb-4 text-champagne" />
                    <p className="font-serif text-lg mb-1">Your cart is empty</p>
                    <p className="text-sm text-charcoal-300 mb-6">Discover our story through fabric.</p>
                    <Link href="/shop" onClick={close} className="btn-primary">Continue shopping</Link>
                  </div>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-4">
                      <Link href={`/product/${i.slug}`} onClick={close} className="block w-20 h-24 overflow-hidden rounded-md bg-ivory">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                      </Link>
                      <div className="flex-1">
                        <Link href={`/product/${i.slug}`} onClick={close} className="text-sm font-medium hover:text-primary">{i.name}</Link>
                        <p className="text-xs text-charcoal-300 mt-0.5">{i.size ?? 'Standard'}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button onClick={() => update(i.id, i.quantity - 1)} className="h-7 w-7 rounded-full border border-charcoal-100">−</button>
                          <span className="text-sm w-6 text-center">{i.quantity}</span>
                          <button onClick={() => update(i.id, i.quantity + 1)} className="h-7 w-7 rounded-full border border-charcoal-100">+</button>
                          <button onClick={() => remove(i.id)} className="ml-auto text-charcoal-300 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-medium">{formatCurrency(i.unitPrice * i.quantity)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-charcoal-100 p-5 space-y-4">
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code"
                    className="input flex-1"
                  />
                  <button onClick={applyCoupon} disabled={applying} className="btn-outline px-4">
                    {applying ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                {couponCode && !couponError && (
                  <p className="text-xs text-champagne-500">Applied: {couponCode}</p>
                )}
                <div className="space-y-1.5 text-sm">
                  <Row label="Subtotal" value={formatCurrency(subtotal)} />
                  {discount > 0 && <Row label={`Discount (${couponCode})`} value={`- ${formatCurrency(discount)}`} />}
                  <Row label="Shipping" value={shipping === 0 ? 'Free' : formatCurrency(shipping)} />
                  <Row label="Tax" value={formatCurrency(tax)} />
                  <div className="flex items-center justify-between border-t border-charcoal-100 pt-3 mt-2 font-medium">
                    <span>Total</span><span>{formatCurrency(total)}</span>
                  </div>
                </div>
                <button
                  onClick={() => { close(); router.push('/checkout'); }}
                  className="btn-primary w-full"
                >
                  Checkout · {formatCurrency(total)}
                </button>
                <Link href="/cart" onClick={close} className="btn-ghost w-full text-xs uppercase tracking-widest">
                  View full cart
                </Link>
              </div>
            )}
          </m.aside>
        </m.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-charcoal">
      <span className="text-charcoal-300">{label}</span>
      <span>{value}</span>
    </div>
  );
}
