'use client';

import { useEffect, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Mail } from 'lucide-react';
import { useSubscribe } from '@/hooks/queries';

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const subs = useSubscribe();

  useEffect(() => {
    const shown = typeof window !== 'undefined' && sessionStorage.getItem('sarwa_promo_seen');
    if (shown) return;
    const t = setTimeout(() => setOpen(true), 12000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    if (typeof window !== 'undefined') sessionStorage.setItem('sarwa_promo_seen', '1');
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-center bg-charcoal/50 backdrop-blur-sm p-4"
        >
          <m.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="relative grid w-full max-w-lg grid-cols-1 md:grid-cols-2 overflow-hidden rounded-xl2 bg-white shadow-luxury"
          >
            <button onClick={close} className="absolute right-3 top-3 z-10 p-1 text-charcoal-300 hover:text-primary"><X size={18} /></button>
            <div className="hidden md:block bg-ivory luxury-mask" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="p-8">
              <span className="eyebrow">Welcome to SARWA</span>
              <h3 className="font-serif text-3xl mt-2 leading-tight">Receive 10% off your first saree.</h3>
              <p className="mt-3 text-sm text-charcoal-300">Join the journal for new drops, styling notes, and private invitations.</p>
              <form
                onSubmit={(e) => { e.preventDefault(); subs.mutate({ email }); close(); }}
                className="mt-6 space-y-3"
              >
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="input pl-10"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">Subscribe & Save</button>
                <p className="text-[11px] text-charcoal-300 text-center">By subscribing you agree to receive marketing from SARWA.</p>
              </form>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
