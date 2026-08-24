'use client';

import { useEffect, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/store/auth';
import { Mail, Lock, User, X, ChevronLeft } from 'lucide-react';

type Resolver = () => void;
type Mode = 'email' | 'register' | 'login' | 'forgot' | 'reset' | 'done';

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
  const [mode, setMode] = useState<Mode>('email');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register, forgotPassword, resetPassword, checkEmail } = useAuth();

  useEffect(() => {
    openHandler = (cb) => {
      setResolver(() => cb);
      setIsOpen(true);
      setMode('email');
      setError(null);
      setEmail('');
      setFirstName('');
      setPassword('');
    };
    return () => {
      openHandler = null;
    };
  }, []);

  const close = (signedIn: boolean) => {
    setIsOpen(false);
    setError(null);
    if (signedIn) resolver?.();
    setResolver(null);
  };

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Enter your email'); return; }
    setSubmitting(true); setError(null);
    try {
      const exists = await checkEmail(email.trim());
      setMode(exists ? 'login' : 'register');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Could not verify email.');
    } finally { setSubmitting(false); }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) { setError('Enter your first name'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setSubmitting(true); setError(null);
    try {
      await register({ firstName: firstName.trim(), email: email.trim(), password });
      close(true);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Could not create account.');
    } finally { setSubmitting(false); }
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Enter your password'); return; }
    setSubmitting(true); setError(null);
    try {
      await login(email.trim(), password);
      close(true);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Invalid email or password.');
    } finally { setSubmitting(false); }
  };

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      const { devResetToken } = await forgotPassword(email.trim());
      if (devResetToken) {
        setResetToken(devResetToken);
        setMode('reset');
      } else {
        setMode('done');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Could not send reset link.');
    } finally { setSubmitting(false); }
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) return;
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setSubmitting(true); setError(null);
    try {
      await resetPassword(resetToken, password);
      setMode('done');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Could not reset password.');
    } finally { setSubmitting(false); }
  };

  const heading =
    mode === 'email' ? 'Continue to checkout'
    : mode === 'register' ? 'Create your account'
    : mode === 'login' ? 'Welcome back'
    : mode === 'forgot' ? 'Forgot your password?'
    : mode === 'reset' ? 'Choose a new password'
    : 'Password updated';

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
            <h2 className="font-serif text-2xl mt-2">{heading}</h2>

            {mode === 'email' && (
              <form onSubmit={onEmailSubmit} className="mt-6 space-y-4">
                <p className="text-sm text-charcoal-300">Sign in or create an account to continue.</p>
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                    <input className="input pl-10" type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Checking…' : 'Continue'}</button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={onRegister} className="mt-6 space-y-4">
                <p className="text-sm text-charcoal-300">New here? Set up your account in seconds.</p>
                <div>
                  <label className="label">First name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                    <input className="input pl-10" autoComplete="given-name" autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={email} disabled />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                    <input className="input pl-10" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Creating…' : 'Create account'}</button>
                <button type="button" onClick={() => { setMode('email'); setError(null); }} className="text-xs text-charcoal-300 hover:text-charcoal w-full text-center inline-flex items-center justify-center gap-1">
                  <ChevronLeft size={12} /> Use a different email
                </button>
              </form>
            )}

            {mode === 'login' && (
              <form onSubmit={onLogin} className="mt-6 space-y-4">
                <p className="text-sm text-charcoal-300">Welcome back. Enter your password.</p>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={email} disabled />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                    <input className="input pl-10" type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Signing in…' : 'Sign in'}</button>
                <div className="flex items-center justify-between text-xs">
                  <button type="button" onClick={() => { setMode('forgot'); setError(null); }} className="text-champagne-500 link-underline">
                    Forgot password?
                  </button>
                  <button type="button" onClick={() => { setMode('email'); setError(null); }} className="text-charcoal-300 hover:text-charcoal inline-flex items-center gap-1">
                    <ChevronLeft size={12} /> Different email
                  </button>
                </div>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={onForgot} className="mt-6 space-y-4">
                <p className="text-sm text-charcoal-300">We'll send a reset link to {email}.</p>
                <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Sending…' : 'Send reset link'}</button>
                <button type="button" onClick={() => { setMode('login'); setError(null); }} className="text-xs text-charcoal-300 hover:text-charcoal w-full text-center inline-flex items-center justify-center gap-1">
                  <ChevronLeft size={12} /> Back to sign in
                </button>
              </form>
            )}

            {mode === 'reset' && (
              <form onSubmit={onReset} className="mt-6 space-y-4">
                <p className="text-sm text-charcoal-300">Enter your new password.</p>
                <div>
                  <label className="label">New password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                    <input className="input pl-10" type="password" autoComplete="new-password" placeholder="At least 8 characters" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Updating…' : 'Update password'}</button>
              </form>
            )}

            {mode === 'done' && (
              <div className="mt-6 space-y-4">
                <div className="rounded-md border border-champagne/30 bg-champagne/5 px-4 py-3 text-sm">
                  Your password has been updated. Please sign in.
                </div>
                <button onClick={() => { setMode('login'); setPassword(''); setError(null); }} className="btn-primary w-full">Sign in</button>
              </div>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}