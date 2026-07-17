'use client';

import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { MenuNode } from './MegaMenu';

function resolveHref(item: MenuNode): string {
  if (item.link && item.link !== '#') return item.link;
  if (item.categorySlug) return `/shop/${item.categorySlug}`;
  return '#';
}

export function MobileMenu({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: MenuNode[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-charcoal/40 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          <m.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 left-0 z-[61] w-[88%] max-w-sm bg-white md:hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-charcoal-100">
              <span className="font-serif text-2xl tracking-[0.25em]">SARWA</span>
              <button onClick={onClose} className="p-2" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-4 py-4">
              <ul className="space-y-1">
                {items.map((root) => (
                  <MobileMenuNode key={root.id} item={root} onClose={onClose} depth={0} />
                ))}
              </ul>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileMenuNode({
  item,
  onClose,
  depth = 0,
}: {
  item: MenuNode;
  onClose: () => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = (item.children ?? []).length > 0;

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={resolveHref(item)}
          onClick={onClose}
          className="block py-3 text-[13px] uppercase tracking-[0.18em] border-b border-charcoal-100/60"
          style={{ paddingLeft: depth * 14 }}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div
        className="flex items-center justify-between py-3 border-b border-charcoal-100/60"
        style={{ paddingLeft: depth * 14 }}
      >
        <Link
          href={resolveHref(item)}
          onClick={onClose}
          className="text-[13px] uppercase tracking-[0.18em] flex-1"
        >
          {item.label}
        </Link>
        <button
          className="p-2"
          onClick={() => setOpen((s) => !s)}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <m.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <li className="pt-2 pb-1">
              <Link
                href={resolveHref(item)}
                onClick={onClose}
                className="block py-1.5 text-sm text-champagne-500"
                style={{ paddingLeft: (depth + 1) * 14 }}
              >
                Shop All {item.label}
              </Link>
            </li>
            {(item.children ?? []).map((c) => (
              <MobileMenuNode key={c.id} item={c} onClose={onClose} depth={depth + 1} />
            ))}
          </m.ul>
        )}
      </AnimatePresence>
    </li>
  );
}
