'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MessageCircle, ChevronLeft } from 'lucide-react';

type Mode = 'identifier' | 'phone' | 'whatsapp' | 'otp';

const IdentifierSchema = z.object({
  identifier: z.string().min(3, 'Enter your email or phone number'),
});
const PhoneSchema = z.object({
  phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number'),
});
const OtpSchema = z.object({
  code: z.string().regex(/^[0-9]{4,8}$/, 'Enter the 6-digit code'),
});

export default function AccountPage() {
  const { user, quickAuth, requestOtp, verifyOtp, hydrateFromQuery, logout } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('identifier');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const consumed = hydrateFromQuery();
    if (consumed) router.replace('/account');
  }, [hydrateFromQuery, router]);

  const identifierForm = useForm({ resolver: zodResolver(IdentifierSchema) });
  const phoneForm = useForm({ resolver: zodResolver(PhoneSchema) });
  const otpForm = useForm({ resolver: zodResolver(OtpSchema) });

  if (user) {
    return (
      <div className="container-x py-16 max-w-xl text-center">
        <span className="eyebrow">Welcome back</span>
        <h1 className="font-serif text-5xl mt-2">{user.firstName ?? user.email}</h1>
        <p className="text-sm text-charcoal-300 mt-2">Signed in as {user.email}</p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={() => router.push('/account/orders')} className="btn-primary">My orders</button>
          <button onClick={() => router.push('/account/addresses')} className="btn-outline">Addresses</button>
          <button onClick={logout} className="btn-ghost">Sign out</button>
        </div>
      </div>
    );
  }

  const onIdentifier = async (d: any) => {
    setSubmitting(true); setError(null);
    try { await quickAuth(d.identifier); router.push('/account'); }
    catch (e: any) { setError(e?.response?.data?.error?.message ?? 'Could not sign in.'); }
    finally { setSubmitting(false); }
  };

  const onRequestOtp = async (d: any) => {
    setSubmitting(true); setError(null);
    try {
      const raw = d.phone.replace(/[^0-9]/g, '');
      setPhone(raw);
      const { devCode } = await requestOtp(raw, channel);
      setDevCode(devCode ?? null);
      setMode('otp');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? 'Could not send code.');
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyOtp = async (d: any) => {
    setSubmitting(true); setError(null);
    try {
      await verifyOtp(phone, d.code, channel);
      router.push('/account');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? 'Invalid or expired code.');
    } finally {
      setSubmitting(false);
    }
  };

  const startGoogle = () => {
    const returnTo = '/account';
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api/v1'}/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <div className="container-x py-16 grid gap-12 md:grid-cols-2 max-w-5xl">
      <div
        className="hidden md:block bg-ivory luxury-mask"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div>
        <span className="eyebrow">SARWA · Account</span>
        <h1 className="font-serif text-4xl mt-2">
          {mode === 'otp' ? 'Enter the code' : 'Continue with SARWA'}
        </h1>
        <p className="text-sm text-charcoal-300 mt-2">
          {mode === 'otp'
            ? `We sent a 6-digit code to your phone via ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}.`
            : 'Sign in or create your account in seconds.'}
        </p>

        {mode === 'identifier' && (
          <>
            <button onClick={startGoogle} className="btn-outline w-full mt-6 flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-charcoal-300">
              <span className="h-px flex-1 bg-charcoal-100" /> or <span className="h-px flex-1 bg-charcoal-100" />
            </div>

            <form onSubmit={identifierForm.handleSubmit(onIdentifier)} className="space-y-4">
              <div>
                <label className="label">Email or phone</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                  <input className="input pl-10" placeholder="you@example.com or 9876543210" autoComplete="username" {...identifierForm.register('identifier')} />
                </div>
                {identifierForm.formState.errors.identifier && (
                  <p className="text-xs text-red-500 mt-1">{identifierForm.formState.errors.identifier.message as string}</p>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Continuing…' : 'Continue'}</button>
            </form>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => { setChannel('sms'); setMode('phone'); setError(null); }}
                className="border border-charcoal-100 rounded-md p-4 text-left hover:border-champagne transition"
              >
                <Phone size={16} className="text-champagne-500 mb-2" />
                <p className="text-sm font-medium">SMS OTP</p>
                <p className="text-xs text-charcoal-300">Sign in with a code by SMS</p>
              </button>
              <button
                onClick={() => { setChannel('whatsapp'); setMode('phone'); setError(null); }}
                className="border border-charcoal-100 rounded-md p-4 text-left hover:border-champagne transition"
              >
                <MessageCircle size={16} className="text-champagne-500 mb-2" />
                <p className="text-sm font-medium">WhatsApp OTP</p>
                <p className="text-xs text-charcoal-300">Sign in with a code by WhatsApp</p>
              </button>
            </div>
          </>
        )}

        {mode === 'phone' && (
          <>
            <button onClick={() => { setMode('identifier'); setError(null); }} className="text-xs text-charcoal-300 hover:text-charcoal mt-4 inline-flex items-center gap-1">
              <ChevronLeft size={12} /> Back
            </button>
            <form onSubmit={phoneForm.handleSubmit(onRequestOtp)} className="space-y-4 mt-4">
              <div>
                <label className="label">Phone number</label>
                <div className="relative">
                  {channel === 'sms'
                    ? <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                    : <MessageCircle size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />}
                  <input className="input pl-10" placeholder="9876543210" autoComplete="tel" {...phoneForm.register('phone')} />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{phoneForm.formState.errors.phone.message as string}</p>
                )}
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
            <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4 mt-4">
              <div>
                <label className="label">Verification code</label>
                <input
                  className="input tracking-[0.5em] text-center text-2xl"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  placeholder="••••••"
                  {...otpForm.register('code')}
                />
                {otpForm.formState.errors.code && (
                  <p className="text-xs text-red-500 mt-1">{otpForm.formState.errors.code.message as string}</p>
                )}
              </div>
              {devCode && (
                <p className="text-xs text-champagne-500">Dev mode: code is {devCode}</p>
              )}
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
                  } catch (e: any) {
                    setError(e?.response?.data?.error?.message ?? 'Could not resend.');
                  } finally { setSubmitting(false); }
                }}
                className="text-xs text-charcoal-300 hover:text-charcoal w-full text-center"
              >
                Resend code
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}