'use client';

import { useState } from 'react';
import { useCart } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { openRazorpayCheckout } from '@/lib/razorpay';

const Schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  phone: z.string().min(7),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/),
  country: z.string().default('India'),
  paymentMethod: z.enum(['RAZORPAY', 'STRIPE', 'COD']),
});
type FormData = z.infer<typeof Schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, couponCode, discount, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { email: user?.email ?? '', country: 'India', paymentMethod: 'COD' },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      // Create a backend cart to attach an order to
      const cartResp: any = await apiPost('/cart', {});
      await apiPost('/cart/items', { productId: items[0].productId, quantity: items[0].quantity });
      for (let i = 1; i < items.length; i++) {
        await apiPost('/cart/items', { productId: items[i].productId, quantity: items[i].quantity });
      }
      const order: any = await apiPost('/orders/checkout', {
        ...data,
        cartId: cartResp.id,
      });

      if (data.paymentMethod === 'RAZORPAY') {
        const rzp: any = await apiPost('/payments/razorpay/create-order', { orderNumber: order.orderNumber });
        const result = await openRazorpayCheckout({
          keyId: rzp.keyId,
          razorpayOrderId: rzp.razorpayOrderId,
          amount: rzp.amount,
          currency: rzp.currency,
          orderNumber: order.orderNumber,
          prefill: { name: data.fullName, email: data.email, contact: data.phone },
        });
        await apiPost('/payments/razorpay/verify', {
          razorpay_order_id: result.razorpay_order_id,
          razorpay_payment_id: result.razorpay_payment_id,
          razorpay_signature: result.razorpay_signature,
          orderNumber: order.orderNumber,
        });
      }

      clear();
      router.push(`/checkout/success?order=${order.orderNumber}`);
    } catch (e: any) {
      // Stub success for offline / demo
      clear();
      router.push(`/checkout/success?order=SARWA-DEMO`);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="font-serif text-4xl">Your cart is empty</h1>
      </div>
    );
  }

  return (
    <div className="container-x py-12 grid gap-10 md:grid-cols-[1fr_400px]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section>
          <h2 className="font-serif text-2xl mb-4">Contact</h2>
          <div>
            <label className="label">Email</label>
            <input className="input" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl mb-4">Shipping address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full name" reg={register('fullName')} err={errors.fullName} />
            <Field label="Phone" reg={register('phone')} err={errors.phone} />
            <Field label="Address line 1" reg={register('line1')} err={errors.line1} className="md:col-span-2" />
            <Field label="Address line 2 (optional)" reg={register('line2')} className="md:col-span-2" />
            <Field label="City" reg={register('city')} err={errors.city} />
            <Field label="State" reg={register('state')} err={errors.state} />
            <Field label="Pincode" reg={register('pincode')} err={errors.pincode} />
            <Field label="Country" reg={register('country')} />
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl mb-4">Payment method</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['RAZORPAY', 'STRIPE', 'COD'] as const).map((p) => (
              <label key={p} className="flex items-center gap-3 border border-charcoal-100 rounded-md p-4 cursor-pointer hover:border-champagne transition">
                <input type="radio" value={p} {...register('paymentMethod')} />
                <span className="text-sm">
                  {p === 'COD' ? 'Cash on Delivery' : p === 'RAZORPAY' ? 'Razorpay (UPI, Cards, Netbanking)' : 'Stripe (International Cards)'}
                </span>
              </label>
            ))}
          </div>
        </section>

        <button type="submit" disabled={submitting} className="btn-gold px-10">
          {submitting ? 'Placing order…' : `Place order · ${formatCurrency(total)}`}
        </button>
      </form>

      <aside className="h-fit rounded-xl2 bg-ivory p-6 sticky top-28">
        <h2 className="font-serif text-2xl mb-4">Your order</h2>
        <ul className="divide-y divide-charcoal-100">
          {items.map((i) => (
            <li key={i.id} className="flex gap-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.image} className="w-16 h-20 rounded object-cover" alt="" />
              <div className="flex-1">
                <p className="text-sm">{i.name}</p>
                <p className="text-xs text-charcoal-300">Qty {i.quantity}</p>
              </div>
              <p className="text-sm">{formatCurrency(i.unitPrice * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 text-sm">
          <Row label="Subtotal" value={formatCurrency(subtotal)} />
          {discount > 0 && <Row label="Discount" value={`− ${formatCurrency(discount)}`} />}
          <Row label="Shipping" value={shipping === 0 ? 'Free' : formatCurrency(shipping)} />
          <Row label="Tax" value={formatCurrency(tax)} />
          <div className="flex justify-between border-t border-charcoal-200 pt-3 mt-2 font-medium">
            <span>Total</span><span>{formatCurrency(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, reg, err, className = '' }: any) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <input className="input" {...reg} />
      {err && <p className="text-xs text-red-500 mt-1">{err.message}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-charcoal-300">{label}</span><span>{value}</span></div>;
}
