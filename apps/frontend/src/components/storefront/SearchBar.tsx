'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/hooks/queries';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';

export function SearchBar({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const router = useRouter();
  const { data } = useSearch(q);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/shop?q=${encodeURIComponent(q)}`);
    onClose();
  };

  return (
    <div>
      <form onSubmit={submit} className="flex items-center gap-3 border-b border-charcoal-100 pb-3">
        <Search size={20} className="text-champagne" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search sarees, jewellery, occasion…"
          className="flex-1 bg-transparent text-base font-serif italic focus:outline-none"
        />
        <button type="button" onClick={onClose} className="text-xs uppercase tracking-widest text-charcoal-300">
          Close
        </button>
      </form>

      <AnimatePresence>
        {q.length > 0 && (
          <m.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {data?.suggestions?.length > 0 && (
              <div>
                <p className="eyebrow mb-3">Categories</p>
                <ul className="space-y-1.5">
                  {data.suggestions.map((s: any, i: number) => (
                    <li key={i}>
                      <Link href={s.link} onClick={onClose} className="text-sm hover:text-primary">
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data?.products?.length > 0 && (
              <div className="md:col-span-2">
                <p className="eyebrow mb-3">Products</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {data.products.map((p: any) => (
                    <Link key={p.id} href={`/product/${p.slug}`} onClick={onClose} className="group">
                      <div className="aspect-[4/5] overflow-hidden rounded-xl bg-ivory">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image ?? ''} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                      <p className="mt-2 text-xs">{p.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {q.length > 1 && data && !data?.products?.length && !data?.suggestions?.length && (
              <p className="text-sm text-charcoal-300 col-span-3">No results for "{q}".</p>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
