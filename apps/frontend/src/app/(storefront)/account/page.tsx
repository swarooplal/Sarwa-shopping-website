'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User } from 'lucide-react';

type Mode = 'login' | 'register' | 'forgot' | 'reset' | 'sent' | 'done';

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const RegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const ForgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

const ResetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function AccountPage() {
  const { user, login, register, forgotPassword, resetPassword, logout } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);

  const loginForm = useForm({ resolver: zodResolver(LoginSchema) });
  const registerForm = useForm({ resolver: zodResolver(RegisterSchema) });
  const forgotForm = useForm({ resolver: zodResolver(ForgotSchema) });
  const resetForm = useForm({ resolver: zodResolver(ResetSchema) });

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

  const onLogin = async (d: any) => {
    setSubmitting(true); setError(null);
    try { await login(d.email, d.password); router.push('/account'); }
    catch (e: any) {
      setError(e?.response?.data?.error?.message ?? 'Invalid email or password');
    } finally { setSubmitting(false); }
  };

  const onRegister = async (d: any) => {
    setSubmitting(true); setError(null);
    try { await register(d); router.push('/account'); }
    catch (e: any) {
      setError(e?.response?.data?.error?.message ?? 'Could not create account');
    } finally { setSubmitting(false); }
  };

  const onForgot = async (d: any) => {
    setSubmitting(true); setError(null);
    try {
      const { devResetToken } = await forgotPassword(d.email);
      setResetEmail(d.email);
      if (devResetToken) {
        setResetToken(devResetToken);
        setMode('reset');
      } else {
        setMode('sent');
      }
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? 'Could not send reset link');
    } finally { setSubmitting(false); }
  };

  const onReset = async (d: any) => {
    if (!resetToken) return;
    setSubmitting(true); setError(null);
    try {
      await resetPassword(resetToken, d.password);
      setMode('done');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? 'Could not reset password');
    } finally { setSubmitting(false); }
  };

  const heading =
    mode === 'login' ? 'Welcome back'
    : mode === 'register' ? 'Join SARWA'
    : mode === 'forgot' ? 'Forgot your password?'
    : mode === 'sent' ? 'Check your inbox'
    : mode === 'reset' ? 'Choose a new password'
    : 'Password updated';

  const sub =
    mode === 'login' ? 'Sign in to view orders and saved pieces.'
    : mode === 'register' ? 'Create an account to start shopping.'
    : mode === 'forgot' ? 'Enter your email and we\'ll send a reset link.'
    : mode === 'sent' ? `If an account exists for ${resetEmail}, a reset link is on its way.`
    : mode === 'reset' ? 'Your reset link is verified. Pick a new password.'
    : 'You can now sign in with your new password.';

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
        <h1 className="font-serif text-4xl mt-2">{heading}</h1>
        <p className="text-sm text-charcoal-300 mt-2">{sub}</p>

        {mode === 'login' && (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="mt-8 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input className="input pl-10" type="email" autoComplete="email" {...loginForm.register('email')} />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.email.message as string}</p>
              )}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input className="input pl-10" type="password" autoComplete="current-password" {...loginForm.register('password')} />
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.password.message as string}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Signing in…' : 'Sign in'}</button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={() => { setMode('forgot'); setError(null); }} className="text-champagne-500 link-underline">
                Forgot password?
              </button>
              <button type="button" onClick={() => { setMode('register'); setError(null); }} className="text-charcoal-300 hover:text-charcoal">
                Create an account →
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="mt-8 space-y-4">
            <div>
              <label className="label">First name</label>
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input className="input pl-10" autoComplete="given-name" {...registerForm.register('firstName')} />
              </div>
              {registerForm.formState.errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.firstName.message as string}</p>
              )}
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input className="input pl-10" type="email" autoComplete="email" {...registerForm.register('email')} />
              </div>
              {registerForm.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.email.message as string}</p>
              )}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input className="input pl-10" type="password" autoComplete="new-password" placeholder="At least 8 characters" {...registerForm.register('password')} />
              </div>
              {registerForm.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.password.message as string}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Creating…' : 'Create account'}</button>
            <p className="text-xs text-center text-charcoal-300">
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(null); }} className="text-champagne-500 link-underline">
                Sign in
              </button>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={forgotForm.handleSubmit(onForgot)} className="mt-8 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input className="input pl-10" type="email" autoComplete="email" {...forgotForm.register('email')} />
              </div>
              {forgotForm.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{forgotForm.formState.errors.email.message as string}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Sending…' : 'Send reset link'}</button>
            <p className="text-xs text-center text-charcoal-300">
              Remembered it?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(null); }} className="text-champagne-500 link-underline">
                Back to sign in
              </button>
            </p>
          </form>
        )}

        {mode === 'sent' && (
          <div className="mt-8 space-y-4">
            <div className="rounded-md border border-champagne/30 bg-champagne/5 px-4 py-3 text-sm">
              A password reset link has been sent to <strong>{resetEmail}</strong>. Check your inbox.
            </div>
            <button onClick={() => { setMode('login'); setError(null); }} className="btn-primary w-full">Back to sign in</button>
          </div>
        )}

        {mode === 'reset' && (
          <form onSubmit={resetForm.handleSubmit(onReset)} className="mt-8 space-y-4">
            <div>
              <label className="label">New password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input className="input pl-10" type="password" autoComplete="new-password" placeholder="At least 8 characters" {...resetForm.register('password')} />
              </div>
              {resetForm.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1">{resetForm.formState.errors.password.message as string}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Updating…' : 'Update password'}</button>
          </form>
        )}

        {mode === 'done' && (
          <div className="mt-8 space-y-4">
            <div className="rounded-md border border-champagne/30 bg-champagne/5 px-4 py-3 text-sm">
              Your password has been updated.
            </div>
            <button onClick={() => { setMode('login'); setError(null); }} className="btn-primary w-full">Sign in</button>
          </div>
        )}
      </div>
    </div>
  );
}