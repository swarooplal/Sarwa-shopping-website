'use client';

import { useEffect, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/store/auth';
import { Mail, Phone, MessageCircle, X, ChevronLeft } from 'lucide-react';

type Resolver = () => void;
type Mode = 'identifier' | 'phone' | 'otp';

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
  const [mode, setMode] = useState<Mode>('identifier');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [phone, setPhone] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { quickAuth, requestOtp, verifyOtp } = useAuth();

  useEffect(() => {
    openHandler = (cb) => {
      setResolver(() => cb);
      setIsOpen(true);
      setMode('identifier');
      setError(null);
    };
    return () => {
      openHandler = null;
    };
  }, []);

  const close = (signedIn: boolean) => {
    setIsOpen(false);
    setError(null);
    setIdentifier('');
    setPhone('');
    setCode('');
    setDevCode(null);
    if (signedIn) resolver?.();
    setResolver(null);
  };

  const startGoogle = () => {
    const returnTo = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api/v1';
    window.location.href = `${apiBase}/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  };

  const onIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) { setError('Enter your email or phone'); return; }
    setSubmitting(true); setError(null);
    try { await quickAuth(identifier.trim()); close(true); }
    catch (err: any) { setError(err?.response?.data?.error?.message ?? 'Could not sign in.'); }
    finally { setSubmitting(false); }
  };

  const onRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { setError('Enter your phone'); return; }
    setSubmitting(true); setError(null);
    try {
      const normalized = phone.replace(/[^0-9]/g, '');
      const { devCode } = await requestOtp(normalized, channel);
      setPhone(normalized);
      setDevCode(devCode ?? null);
      setMode('otp');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Could not send code.');
    } finally { setSubmitting(false); }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError('Enter the code'); return; }
    setSubmitting(true); setError(null);
    try { await verifyOtp(phone, code.trim(), channel); close(true); }
    catch (err: any) { setError(err?.response?.data?.error?.message ?? 'Invalid code.'); }
    finally { setSubmitting(false); }
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
            <h2 className="font-serif text-2xl mt-2">
              {mode === 'otp' ? 'Enter the code' : 'Continue to checkout'}
            </h2>
            <p className="text-sm text-charcoal-300 mt-1">
              {mode === 'otp'
                ? `Code sent via ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} to your phone.`
                : 'Sign in or create your account to continue.'}
            </p>

            {mode === 'identifier' && (
              <>
                <button onClick={startGoogle} className="btn-outline w-full mt-6 flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                  Continue with Google
                </button>

                <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-charcoal-300">
                  <span className="h-px flex-1 bg-charcoal-100" /> or <span className="h-px flex-1 bg-charcoal-100" />
                </div>

                <form onSubmit={onIdentifier} className="space-y-4">
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
                </form>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button onClick={() => { setChannel('sms'); setMode('phone'); setError(null); }} className="border border-charcoal-100 rounded-md p-3 text-left hover:border-champagne transition">
                    <Phone size={14} className="text-champagne-500 mb-1" />
                    <p className="text-sm font-medium">SMS OTP</p>
                  </button>
                  <button onClick={() => { setChannel('whatsapp'); setMode('phone'); setError(null); }} className="border border-charcoal-100 rounded-md p-3 text-left hover:border-champagne transition">
                    <MessageCircle size={14} className="text-champagne-500 mb-1" />
                    <p className="text-sm font-medium">WhatsApp OTP</p>
                  </button>
                </div>
              </>
            )}

            {mode === 'phone' && (
              <>
                <button onClick={() => { setMode('identifier'); setError(null); }} className="text-xs text-charcoal-300 hover:text-charcoal mt-4 inline-flex items-center gap-1">
                  <ChevronLeft size={12} /> Back
                </button>
                <form onSubmit={onRequestOtp} className="space-y-4 mt-3">
                  <div>
                    <label className="label">Phone number</label>
                    <div className="relative">
                      {channel === 'sms'
                        ? <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                        : <MessageCircle size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />}
                      <input className="input pl-10" placeholder="9876543210" autoComplete="tel" autoFocus value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <button disabled={submitting} className="btn-primary w-full">
                    {submitting ? 'Sending…' : `Send code via ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}`}
                  </button>
                </form>
              </>
            )}

            {mode === 'otp' && (
              <>
                <button onClick={() => { setMode('phone'); setError(null); }} className="text-xs text-charcoal-300 hover:text-charcoal mt-4 inline-flex items-center gap-1">
                  <ChevronLeft size={12} /> Change number
                </button>
                <form onSubmit={onVerifyOtp} className="space-y-4 mt-3">
                  <div>
                    <label className="label">Verification code</label>
                    <input
                      className="input tracking-[0.5em] text-center text-2xl"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={8}
                      placeholder="••••••"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  {devCode && <p className="text-xs text-champagne-500">Dev mode: code is {devCode}</p>}
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <button disabled={submitting} className="btn-primary w-full">
                    {submitting ? 'Verifying…' : 'Verify and continue'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setSubmitting(true); setError(null);
                      try {
                        const { devCode } = await requestOtp(phone, channel);
                        setDevCode(devCode ?? null);
                      } catch (err: any) {
                        setError(err?.response?.data?.error?.message ?? 'Could not resend.');
                      } finally { setSubmitting(false); }
                    }}
                    className="text-xs text-charcoal-300 hover:text-charcoal w-full text-center"
                  >
                    Resend code
                  </button>
                </form>
              </>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}