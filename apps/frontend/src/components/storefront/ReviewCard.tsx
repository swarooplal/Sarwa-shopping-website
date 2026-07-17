'use client';

import { Star, Quote } from 'lucide-react';

export function ReviewCard({ name, rating, comment, title }: { name: string; rating: number; comment: string; title?: string }) {
  return (
    <div className="luxury-card p-8 relative">
      <Quote size={28} className="absolute -top-3 left-6 text-champagne" />
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? 'fill-champagne text-champagne' : 'text-charcoal-100'}
          />
        ))}
      </div>
      {title && <h4 className="font-serif text-xl">{title}</h4>}
      <p className="mt-3 text-sm leading-7 text-charcoal">{comment}</p>
      <p className="mt-5 text-[11px] uppercase tracking-[0.25em] text-champagne-500">— {name}</p>
    </div>
  );
}
