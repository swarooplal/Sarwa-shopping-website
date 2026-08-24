'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone } from 'lucide-react';

const Schema = z.object({
  identifier: z.string().min(3, 'Enter your email or phone number'),
});
type FormData = z.infer<typeof Schema>;

export default function AccountPage() {
  const { user, quickAuth, logout } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { identifier: '' },
  });

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

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError(null);
    try {
      await quickAuth(data.identifier);
      router.push('/account');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? 'Could not sign in. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-x py-16 grid gap-12 md:grid-cols-2 max-w-5xl">
      <div
        className="hidden md:block bg-ivory luxury-mask"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div>
        <span className="eyebrow">SARWA · Account</span>
        <h1 className="font-serif text-4xl mt-2">Continue with SARWA</h1>
        <p className="text-sm text-charcoal-300 mt-2">
          Enter your email or phone number. If it's your first time, we'll set up your account instantly.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <label className="label">Email or phone</label>
            <div className="relative">
              <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
              <input
                className="input pl-10"
                placeholder="you@example.com or 9876543210"
                autoComplete="username"
                {...form.register('identifier')}
              />
            </div>
            {form.formState.errors.identifier && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.identifier.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Continuing…' : 'Continue'}
          </button>

          <p className="text-xs text-center text-charcoal-300 flex items-center justify-center gap-2">
            <Phone size={12} />
            No password needed. We'll sign you in or create your account.
          </p>
        </form>
      </div>
    </div>
  );
}