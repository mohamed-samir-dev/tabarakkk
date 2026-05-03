import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../components/products/types";

export interface CartItem {
  product: Product;
  qty: number;
}

export interface CustomerInfo {
  name: string;
  nationalId: string;
  whatsapp: string;
  address: string;
  installmentType: "full" | "installment";
  months: number;
  downPayment: number;
}

export interface OrderRateLimit {
  count: number;
  blockedUntil: number | null;
}

interface CartState {
  items: CartItem[];
  customer: CustomerInfo | null;
  rateLimit: OrderRateLimit;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  setCustomer: (info: CustomerInfo) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  recordOrder: () => void;
  getRateLimitStatus: () => { blocked: boolean; remainingMs: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      rateLimit: { count: 0, blockedUntil: null },
      addItem: (product) =>
        set((s) => {
          const existing = s.items.find((i) => i.product._id === product._id);
          if (existing)
            return {
              items: s.items.map((i) =>
                i.product._id === product._id ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          return { items: [...s.items, { product, qty: 1 }] };
        }),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.product._id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.product._id !== id)
              : s.items.map((i) =>
                  i.product._id === id ? { ...i, qty } : i
                ),
        })),
      setCustomer: (info) => set({ customer: info }),
      clear: () => set({ items: [], customer: null }),
      recordOrder: () =>
        set((s) => {
          const newCount = s.rateLimit.count + 1;
          if (newCount > 3) {
            const penalty = (newCount - 3) * 5 * 60 * 1000;
            return { rateLimit: { count: newCount, blockedUntil: Date.now() + penalty } };
          }
          return { rateLimit: { count: newCount, blockedUntil: null } };
        }),
      getRateLimitStatus: () => {
        const { blockedUntil } = get().rateLimit;
        if (!blockedUntil) return { blocked: false, remainingMs: 0 };
        const remaining = blockedUntil - Date.now();
        if (remaining <= 0) return { blocked: false, remainingMs: 0 };
        return { blocked: true, remainingMs: remaining };
      },
      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      totalPrice: () =>
        get().items.reduce(
          (sum, i) =>
            sum + (i.product.salePrice ?? i.product.originalPrice ?? i.product.price) * i.qty,
          0
        ),
    }),
    { name: "cart-storage" }
  )
);
