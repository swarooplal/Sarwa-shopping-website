'use client';

import { usePage } from '@/hooks/queries';

export function PageRenderer({ slug }: { slug: string }) {
  const { data: page, isLoading } = usePage(slug);

  if (isLoading) return <div className="container-x py-24 animate-pulse">Loading…</div>;

  return (
    <div className="container-x py-16 max-w-3xl">
      <span className="eyebrow">SARWA</span>
      <h1 className="mt-2 font-serif text-5xl">{page?.title ?? slug.replace(/-/g, ' ')}</h1>
      <div className="divider my-6" />
      <article
        className="prose prose-lg max-w-none text-charcoal"
        dangerouslySetInnerHTML={{ __html: page?.content ?? '' }}
      />
    </div>
  );
}
