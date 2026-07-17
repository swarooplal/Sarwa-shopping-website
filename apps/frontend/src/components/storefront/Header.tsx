'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Search, Heart, User, ShoppingBag, Menu } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import { useMenus } from '@/hooks/queries';
import { cn } from '@/lib/utils';
import { MegaMenu, MenuNode } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { SearchBar } from './SearchBar';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openCart = useCart((s) => s.open);
  const cartCount = useCart((s) => s.items.reduce((a, b) => a + b.quantity, 0));
  const wishCount = useWishlist((s) => s.items.length);
  const { data: menus } = useMenus();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  }, []);

  const isTransparent = !scrolled && !activeId && !searchOpen;

  const onEnter = (id: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setActiveId(id);
  };
  const onLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setActiveId(null), 120);
  };

  const active = (menus ?? []).find((m: MenuNode) => m.id === activeId);

  return (
    <>
      <PromoBar />
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-500',
          isTransparent
            ? 'bg-transparent text-charcoal'
            : 'bg-white/95 backdrop-blur-md text-primary shadow-soft border-b border-charcoal-100/40'
        )}
        onMouseLeave={onLeave}
      >
        <div className="container-x flex h-16 items-center justify-between md:h-20">
          <button
            className="md:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <Link href="/" className="font-serif text-2xl tracking-[0.25em] md:text-3xl">
            SARWA
          </Link>

          <nav className="hidden md:flex items-center gap-10" onMouseLeave={onLeave}>
            {(menus ?? []).map((menuItem: MenuNode) => (
              <div
                key={menuItem.id}
                className="relative"
                onMouseEnter={() => onEnter(menuItem.id)}
              >
                <Link
                  href={menuItem.link ?? menuItem.categorySlug ? `/shop/${menuItem.categorySlug ?? ''}` : '#'}
                  className={cn(
                    'relative inline-block py-7 text-[12px] uppercase tracking-[0.22em] transition-colors',
                    activeId === menuItem.id ? 'text-champagne-500' : 'hover:text-champagne-500'
                  )}
                >
                  {menuItem.label}
                  <span
                    className={cn(
                      'pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-4 h-px bg-champagne-500 transition-all duration-500',
                      activeId === menuItem.id ? 'w-full' : 'w-0'
                    )}
                  />
                </Link>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="p-2"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <Link href="/wishlist" className="relative hidden md:inline-flex p-2" aria-label="Wishlist">
              <Heart size={18} />
              {wishCount > 0 && (
                <span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-champagne text-[10px] font-medium text-white grid place-items-center">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link href="/account" className="hidden md:inline-flex p-2" aria-label="Account">
              <User size={18} />
            </Link>
            <button onClick={openCart} className="relative p-2" aria-label="Cart">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-ivory grid place-items-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {active && (active.children?.length ?? 0) > 0 && (
            <m.div
              key={active.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="hidden md:block absolute left-0 right-0 bg-white shadow-luxury border-t border-charcoal-100/40"
              onMouseEnter={() => onEnter(active.id)}
              onMouseLeave={onLeave}
            >
              <MegaMenu items={active.children ?? []} parentLabel={active.label} />
            </m.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {searchOpen && (
            <m.div
              key="search"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="absolute left-0 right-0 border-t border-charcoal-100/40 bg-white shadow-luxury"
            >
              <div className="container-x py-6">
                <SearchBar onClose={() => setSearchOpen(false)} />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} items={menus ?? []} />
    </>
  );
}

function PromoBar() {
  return (
    <div className="bg-primary text-ivory text-[11px] tracking-[0.25em] uppercase text-center py-2">
      Free shipping across India on orders above ₹1500 · Use{' '}
      <span className="text-champagne">WELCOME10</span> for 10% off
    </div>
  );
}
