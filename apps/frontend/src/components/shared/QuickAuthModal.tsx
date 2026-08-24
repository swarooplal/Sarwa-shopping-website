'use client';

import { useEffect, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/store/auth';
import { Mail, Phone, X } from 'lucide-react';

type Resolver = () => void;

let openHandler: ((onResolved: Resolver) => void) | null = null;

export function requireAuth(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();
    openHandler?.(resolve);
  });
}

export function QuickAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [resolver, setResolver] = useState<Resolver | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { quickAuth } = useAuth();

  useEffect(() => {
    openHandler = (cb) => {
      setResolver(() => cb);
      setIsOpen(true);
    };
    return () => {
      openHandler = null;
    };
  }, []);

  const close = (signedIn: boolean) => {
    setIsOpen(false);
    setError(null);
    setIdentifier('');
    if (signedIn) resolver?.();
    setResolver(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Enter your email or phone');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await quickAuth(identifier.trim());
      close(true);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Could not sign in. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4"
          onClick={() => close(false)}
        >
          <m.div
            initial={{ scale: 0.96, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-xl2 bg-white p-8 shadow-luxury"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => close(false)}
              className="absolute right-4 top-4 text-charcoal-300 hover:text-charcoal"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <span className="eyebrow">SARWA</span>
            <h2 className="font-serif text-2xl mt-2">Continue with SARWA</h2>
            <p className="text-sm text-charcoal-300 mt-1">
              Sign in or create your account to continue. We'll keep your bag saved.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label">Email or phone</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                  <input
                    className="input pl-10"
                    placeholder="you@example.com or 9876543210"
                    autoComplete="username"
                    autoFocus
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Continuing…' : 'Continue'}
              </button>

              <p className="text-xs text-center text-charcoal-300 flex items-center justify-center gap-2">
                <Phone size={12} />
                No password needed. First-time users get an instant account.
              </p>
            </form>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}