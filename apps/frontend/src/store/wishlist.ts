import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  count: () => number;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (id) => set({ items: Array.from(new Set([...get().items, id])) }),
      remove: (id) => set({ items: get().items.filter((i) => i !== id) }),
      has: (id) => get().items.includes(id),
      toggle: (id) =>
        get().items.includes(id) ? get().items && set({ items: get().items.filter((i) => i !== id) }) : set({ items: [...get().items, id] }),
      count: () => get().items.length,
    }),
    { name: 'sarwa-wishlist' }
  )
);
