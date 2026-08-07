import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  productIds: string[];
  // See CartState.ownerUid in lib/stores/cart.ts — same guest-vs-account
  // ownership guard, mirrored here so the wishlist gets the same protection.
  ownerUid: string | null;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
  // Wholesale replace used by AccountSync to hydrate from / react to the
  // signed-in account's Firestore wishlist.
  replaceIds: (productIds: string[], ownerUid?: string | null) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      ownerUid: null,

      toggle: productId =>
        set(state => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter(id => id !== productId)
            : [...state.productIds, productId],
        })),

      remove: productId =>
        set(state => ({ productIds: state.productIds.filter(id => id !== productId) })),

      has: productId => get().productIds.includes(productId),

      clear: () => set({ productIds: [], ownerUid: null }),

      replaceIds: (productIds, ownerUid) => set({ productIds, ownerUid: ownerUid ?? null }),
    }),
    { name: 'akr-wishlist' }
  )
);
