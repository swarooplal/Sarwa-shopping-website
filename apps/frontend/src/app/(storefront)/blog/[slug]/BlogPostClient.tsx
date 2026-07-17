'use client';

import { usePosts } from '@/hooks/queries';
import { formatDate } from '@/lib/utils';

export function BlogPostClient({ slug }: { slug: string }) {
  const { data, isLoading } = usePosts(slug);
  if (isLoading) return <div className="container-x py-24 text-center">Loading…</div>;
  if (!data) return <div className="container-x py-24 text-center">Post not found.</div>;

  return (
    <article className="container-x py-12 max-w-3xl">
      <p className="text-[11px] uppercase tracking-widest text-champagne-500">
        {data.publishedAt ? formatDate(data.publishedAt) : ''}
      </p>
      <h1 className="font-serif text-5xl mt-3">{data.title}</h1>
      <div className="aspect-[16/9] my-8 overflow-hidden rounded-xl bg-ivory">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.coverImage ?? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600'} className="h-full w-full object-cover" />
      </div>
      <div className="prose prose-lg max-w-none text-charcoal" dangerouslySetInnerHTML={{ __html: data.content }} />
    </article>
  );
}
