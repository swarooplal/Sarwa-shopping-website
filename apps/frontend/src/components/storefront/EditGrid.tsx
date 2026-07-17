'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';

export interface EditItem {
  id: string;
  title: string;
  category?: string;
  watermark?: string;
  image: string;
  href: string;
}

export function EditGrid({ items }: { items: EditItem[] }) {
  const feature = items[0];
  const others = items.slice(1, 5);

  if (!feature) return null;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-3 md:hidden snap-x snap-mandatory -mx-4 px-4">
        <div className="min-w-[80%] snap-center">
          <EditCard item={feature} variant="feature" />
        </div>
        {others.map((item) => (
          <div key={item.id} className="min-w-[70%] snap-center">
            <EditCard item={item} variant="standard" />
          </div>
        ))}
      </div>

      <div className="hidden md:grid md:grid-cols-2 md:grid-rows-2 md:gap-3 md:min-h-[640px]">
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="md:row-span-2"
        >
          <EditCard item={feature} variant="feature" />
        </m.div>

        {others.map((item, idx) => (
          <m.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.08 * (idx + 1) }}
          >
            <EditCard item={item} variant="standard" />
          </m.div>
        ))}
      </div>
    </>
  );
}

function EditCard({
  item,
  variant,
}: {
  item: EditItem;
  variant: 'feature' | 'standard';
}) {
  const aspect =
    variant === 'feature'
      ? 'aspect-[3/4] md:aspect-auto md:h-full'
      : 'aspect-[4/3] md:aspect-auto md:h-full';

  return (
    <Link
      href={item.href}
      className={`group relative block overflow-hidden rounded-none w-full ${aspect}`}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes={variant === 'feature' ? '(max-width: 768px) 80vw, 50vw' : '(max-width: 768px) 70vw, 25vw'}
        className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent transition-opacity duration-500 group-hover:from-black/80" />

      {item.watermark && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-serif uppercase tracking-[0.18em] text-ivory/[0.08] text-[18vw] md:text-[6vw] leading-none whitespace-nowrap select-none"
        >
          {item.watermark}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-ivory">
        {item.category && (
          <span className="block text-[10px] uppercase tracking-[0.28em] text-champagne">
            {item.category}
          </span>
        )}
        <h3
          className={`mt-1 font-serif ${
            variant === 'feature' ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-xl md:text-2xl'
          } drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]`}
        >
          {item.title}
        </h3>
        <span className="mt-2 inline-block text-[10px] uppercase tracking-[0.3em] border-b border-ivory/60 pb-0.5 opacity-90 transition group-hover:opacity-100">
          Discover →
        </span>
      </div>
    </Link>
  );
}
