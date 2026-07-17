'use client';

import { usePosts } from '@/hooks/queries';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function BlogPage() {
  const { data, isLoading } = usePosts();

  const posts = (data as any)?.data ?? data ?? [];

  return (
    <div className="container-x py-16">
      <div className="text-center mb-12">
        <span className="eyebrow">Journal</span>
        <h1 className="font-serif text-5xl mt-2">The SARWA Journal</h1>
        <p className="text-sm text-charcoal-300 mt-2">Stories on craft, heritage, and modern Indian style.</p>
      </div>
      {isLoading ? (
        <p className="text-center text-charcoal-300">Loading…</p>
      ) : (
        <div className="grid gap-10 md:grid-cols-3">
          {(Array.isArray(posts) ? posts : []).map((p: any) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="luxury-card overflow-hidden block group">
              <div className="aspect-[4/3] bg-ivory overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.coverImage ?? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900'} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="text-[11px] uppercase tracking-widest text-champagne-500">{p.publishedAt ? formatDate(p.publishedAt) : ''}</p>
                <h3 className="mt-2 font-serif text-xl group-hover:text-primary">{p.title}</h3>
                {p.excerpt && <p className="mt-2 text-sm text-charcoal-300 line-clamp-3">{p.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
