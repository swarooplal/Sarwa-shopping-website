'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, ArrowUpRight } from 'lucide-react';

export interface MenuNode {
  id: string;
  label: string;
  link?: string | null;
  image?: string | null;
  categorySlug?: string | null;
  isActive?: boolean;
  parentId?: string | null;
  sortOrder?: number;
  children?: MenuNode[];
  products?: any[];
}

function resolveHref(item: MenuNode): string {
  if (item.link && item.link !== '#') return item.link;
  if (item.categorySlug) return `/shop/${item.categorySlug}`;
  return '#';
}

export function MegaMenu({ items, parentLabel }: { items: MenuNode[]; parentLabel?: string }) {
  if (!items?.length) return null;
  const active = items.filter((i) => i.isActive !== false);
  const columns = Math.min(Math.max(active.length, 1), 4);

  return (
    <div className="container-x py-12">
      <div className="grid gap-10" style={{ gridTemplateColumns: `220px repeat(${columns}, minmax(0, 1fr))` }}>
        <div className="border-r border-charcoal-100 pr-6">
          {parentLabel && (
            <p className="eyebrow mb-3 text-champagne-500">Shop {parentLabel}</p>
          )}
          <h4 className="font-serif text-2xl mb-4">All {parentLabel ?? 'Items'}</h4>
          <Link
            href={resolveHref(active[0] ?? { id: '', label: '' } as MenuNode)}
            className="inline-flex items-center gap-1.5 text-sm uppercase tracking-[0.18em] text-primary hover:text-champagne-500 transition"
          >
            View Collection <ArrowUpRight size={14} />
          </Link>
        </div>

        {active.map((col) => (
          <MegaMenuColumn key={col.id} item={col} />
        ))}
      </div>
    </div>
  );
}

function MegaMenuColumn({ item }: { item: MenuNode }) {
  const groups: MenuNode[] = item.children?.filter((c) => c.isActive !== false) ?? [];
  const featureCards = groups.filter((g) => (g.products && g.products.length > 0) || g.image);
  const linkGroups = groups.filter((g) => !featureCards.includes(g));

  return (
    <div>
      <Link
        href={resolveHref(item)}
        className="eyebrow mb-4 inline-block text-charcoal hover:text-primary transition"
      >
        {item.label}
      </Link>

      {groups.length > 0 ? (
        <ul className="space-y-1.5">
          {linkGroups.slice(0, 1).flatMap((g) =>
            g.children?.filter((s) => s.isActive !== false).map((leaf) => (
              <li key={leaf.id}>
                <Link
                  href={resolveHref(leaf)}
                  className="text-[13px] text-charcoal-300 hover:text-primary transition"
                >
                  {leaf.label}
                </Link>
              </li>
            )) ?? []
          )}
        </ul>
      ) : null}

      <div className="mt-4 space-y-1">
        {linkGroups.slice(1).map((group) => (
          <CollapsibleGroup key={group.id} group={group} />
        ))}
      </div>

      {featureCards.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {featureCards.slice(0, 4).map((card) => (
            <Link
              key={card.id}
              href={resolveHref(card)}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-ivory">
                {card.image ? (
                  <Image src={card.image} alt={card.label} fill sizes="200px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : card.products?.[0]?.images?.[0]?.url ? (
                  <Image
                    src={card.products[0].images[0].url}
                    alt={card.label}
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <p className="mt-2 text-xs text-charcoal group-hover:text-primary">{card.label}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsibleGroup({ group }: { group: MenuNode }) {
  const [open, setOpen] = useState(true);
  const children = group.children?.filter((c) => c.isActive !== false) ?? [];

  return (
    <div className="border-b border-charcoal-100/70 pb-2">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between py-2 text-left"
      >
        <span className="text-[13px] uppercase tracking-[0.18em] text-charcoal hover:text-primary transition">
          {group.label}
        </span>
        {children.length > 0 ? (
          <ChevronDown
            size={14}
            className={`text-charcoal-300 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        ) : (
          <ChevronRight size={14} className="text-charcoal-300" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && children.length > 0 && (
          <m.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pb-2 pl-3 border-l border-charcoal-100 ml-1">
              {children.map((leaf) => (
                <li key={leaf.id}>
                  <Link
                    href={resolveHref(leaf)}
                    className="block py-1 text-[13px] text-charcoal-300 hover:text-primary hover:translate-x-0.5 transition-all"
                  >
                    {leaf.label}
                  </Link>
                </li>
              ))}
            </div>
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
