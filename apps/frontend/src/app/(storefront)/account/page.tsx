'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiPost, setAccessToken, apiGet } from '@/lib/api';
import { Mail, Lock } from 'lucide-react';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const RegSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export default function AccountPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { login, register, user, logout } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginForm = useForm({ resolver: zodResolver(LoginSchema) });
  const regForm = useForm({ resolver: zodResolver(RegSchema) });

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
    try {
      await login(d.email, d.password);
      router.push('/account');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? 'Invalid credentials');
    } finally { setSubmitting(false); }
  };

  const onRegister = async (d: any) => {
    setSubmitting(true); setError(null);
    try {
      await register(d);
      await login(d.email, d.password);
      router.push('/account');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? 'Registration failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="container-x py-16 grid gap-12 md:grid-cols-2 max-w-5xl">
      <div className="hidden md:block bg-ivory luxury-mask" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div>
        <span className="eyebrow">SARWA · Account</span>
        <h1 className="font-serif text-4xl mt-2">{mode === 'login' ? 'Welcome back' : 'Join SARWA'}</h1>
        <p className="text-sm text-charcoal-300 mt-2">
          {mode === 'login' ? 'Sign in to view orders and saved pieces.' : 'Create an account for faster checkout.'}
        </p>

        {mode === 'login' ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="mt-8 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input className="input pl-10" type="email" {...loginForm.register('email')} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input className="input pl-10" type="password" {...loginForm.register('password')} />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Signing in…' : 'Sign in'}</button>
            <p className="text-xs text-center text-charcoal-300">
              New here?{' '}
              <button type="button" onClick={() => setMode('register')} className="text-champagne-500 link-underline">
                Create an account
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={regForm.handleSubmit(onRegister)} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input className="input" placeholder="First name" {...regForm.register('firstName')} />
              <input className="input" placeholder="Last name" {...regForm.register('lastName')} />
            </div>
            <input className="input" type="email" placeholder="Email" {...regForm.register('email')} />
            <input className="input" type="password" placeholder="Password (8+ characters)" {...regForm.register('password')} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Creating…' : 'Create account'}</button>
            <p className="text-xs text-center text-charcoal-300">
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')} className="text-champagne-500 link-underline">
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
