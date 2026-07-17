import Link from 'next/link';
import { Check } from 'lucide-react';

export default function SuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const order = searchParams?.order ?? 'SARWA-DEMO';
  return (
    <div className="container-x py-24 text-center max-w-2xl">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-champagne/10 text-champagne mb-6">
        <Check size={32} />
      </div>
      <span className="eyebrow">Order confirmed</span>
      <h1 className="mt-3 font-serif text-5xl">Thank you for choosing SARWA.</h1>
      <p className="mt-4 text-charcoal-300">Your order <span className="text-primary font-medium">{order}</span> is being prepared with care.</p>
      <p className="mt-2 text-sm text-charcoal-300">A confirmation has been sent to your email. We'll be in touch with tracking details soon.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/account/orders" className="btn-primary">View orders</Link>
        <Link href="/shop" className="btn-outline">Continue shopping</Link>
      </div>
    </div>
  );
}
