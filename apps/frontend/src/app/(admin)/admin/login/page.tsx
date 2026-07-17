'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState('admin@sarwa.in');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace('/admin');
  }, [user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.replace('/admin');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Login failed. Check your credentials.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-50 grid place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-4xl tracking-[0.25em]">SARWA</Link>
          <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-champagne-500">Admin Panel</p>
        </div>

        <div className="luxury-card p-8">
          <h1 className="font-serif text-3xl mb-1">Sign in</h1>
          <p className="text-sm text-charcoal-300 mb-6">
            Use your SARWA admin credentials.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-charcoal-300 hover:text-charcoal"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-charcoal-300 text-center">
            Seeded admin: <code className="font-mono">admin@sarwa.in</code> /{' '}
            <code className="font-mono">admin123</code>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-charcoal-300 hover:text-primary">
            ← Back to storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
