'use client';

import { useState } from 'react';
import { useSubscribe } from '@/hooks/queries';
import { Mail, ArrowRight, Check } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const subs = useSubscribe();
  const [done, setDone] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subs.mutate({ email }, { onSuccess: () => { setDone(true); setEmail(''); } });
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary">
        <Check size={16} className="text-champagne" /> Welcome — check your inbox.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email for the SARWA journal"
          className="w-full rounded-full border border-charcoal-100 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-champagne"
        />
      </div>
      <button type="submit" className="btn-primary text-xs uppercase tracking-widest">
        Join <ArrowRight size={14} />
      </button>
    </form>
  );
}
