'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

const FAQS = [
  { q: 'How do I place an order?', a: 'Browse our collections, add pieces to your cart, and checkout securely via Razorpay, Stripe, or COD.' },
  { q: 'Do you offer international shipping?', a: 'Yes — we ship worldwide via DHL Express. Duties are calculated at checkout.' },
  { q: 'What is your return policy?', a: 'We offer a 7-day return window on unused pieces in original packaging. Custom orders are non-returnable.' },
  { q: 'Are the sarees authentic?', a: 'Yes. Each piece is sourced directly from weavers and verified by our team.' },
  { q: 'Do you take customization orders?', a: 'Yes, for bridal and bulk orders. Reach out via the Contact page.' },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="container-x py-16 max-w-3xl">
      <span className="eyebrow text-center block">SARWA</span>
      <h1 className="font-serif text-5xl text-center mt-2">Frequently Asked</h1>
      <div className="divider mx-auto my-6" />
      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <div key={i} className="rounded-xl border border-charcoal-100">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-5 text-left">
              <span className="font-serif text-xl">{f.q}</span>
              <ChevronDown size={18} className={`transition ${open === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {open === i && (
                <m.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-charcoal">{f.a}</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
