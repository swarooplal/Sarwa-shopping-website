'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';

export function CollectionCard({
  title,
  image,
  href,
  subtitle,
  size = 'default',
}: {
  title: string;
  image: string;
  href: string;
  subtitle?: string;
  size?: 'default' | 'tall' | 'wide';
}) {
  const aspect =
    size === 'tall' ? 'aspect-[3/4]' : size === 'wide' ? 'aspect-[16/9]' : 'aspect-[4/5]';

  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-xl ${aspect}`}
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent transition-opacity duration-500 group-hover:from-black/60" />
      <m.div
        initial={{ y: 20, opacity: 0.8 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="absolute inset-x-0 bottom-0 p-6 text-ivory"
      >
        {subtitle && <span className="text-[11px] uppercase tracking-[0.3em] text-champagne">{subtitle}</span>}
        <h3 className="mt-1 font-serif text-2xl md:text-3xl">{title}</h3>
        <span className="mt-2 inline-block text-xs uppercase tracking-widest border-b border-ivory/60 pb-0.5 opacity-80 transition group-hover:opacity-100">
          Discover →
        </span>
      </m.div>
    </Link>
  );
}
