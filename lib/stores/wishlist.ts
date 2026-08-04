import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
  // Wholesale replace used by AccountSync to hydrate from / react to the
  // signed-in account's Firestore wishlist.
  replaceIds: (productIds: string[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggle: productId =>
        set(state => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter(id => id !== productId)
            : [...state.productIds, productId],
        })),

      remove: productId =>
        set(state => ({ productIds: state.productIds.filter(id => id !== productId) })),

      has: productId => get().productIds.includes(productId),

      clear: () => set({ productIds: [] }),

      replaceIds: productIds => set({ productIds }),
    }),
    { name: 'akr-wishlist' }
  )
);
