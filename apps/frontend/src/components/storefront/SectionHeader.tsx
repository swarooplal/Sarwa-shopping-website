'use client';

import Link from 'next/link';
import { m } from 'framer-motion';

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  cta,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <m.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center mb-12"
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-2 font-serif text-4xl md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-3 max-w-xl text-sm md:text-base text-charcoal-300">{subtitle}</p>}
      <div className="divider mt-5" />
      {cta && (
        <Link href={cta.href} className="mt-6 link-underline text-xs uppercase tracking-[0.3em]">
          {cta.label}
        </Link>
      )}
    </m.div>
  );
}
