import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UIProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  offerPrice?: number | null;
}

export interface CartItem {
  id: string; // temp local id
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  slug: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode?: string;
  discount: number;
  shipping: number;
  tax: number;
  add: (item: Omit<CartItem, 'id'>) => void;
  update: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setCoupon: (code: string | undefined, discount: number) => void;
  calcTotals: () => { subtotal: number; total: number; itemCount: number };
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      discount: 0,
      shipping: 0,
      tax: 0,
      add: (item) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [
              ...get().items,
              { ...item, id: `${item.productId}-${Date.now()}` },
            ],
            isOpen: true,
          });
        }
      },
      update: (id, qty) => {
        if (qty < 1) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)) });
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [], couponCode: undefined, discount: 0 }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set({ isOpen: !get().isOpen }),
      setCoupon: (code, discount) => set({ couponCode: code, discount }),
      calcTotals: () => {
        const items = get().items;
        const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
        const shipping = subtotal >= 1500 || subtotal === 0 ? 0 : 99;
        const tax = Math.round(subtotal * 0.05);
        const total = Math.max(0, subtotal - get().discount + shipping + tax);
        return { subtotal, total, itemCount: items.reduce((s, i) => s + i.quantity, 0) };
      },
    }),
    { name: 'sarwa-cart' }
  )
);
