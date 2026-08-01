import { create } from 'zustand';
import { Product } from '@/lib/mock/products';
import { CartLine } from '@/lib/stores/cart';

// "Buy Now" checks out a single item without touching the persistent cart —
// deliberately not persisted to storage, so it only survives the current
// tab session and never leaks into a later, unrelated checkout.
interface BuyNowState {
  item: CartLine | null;
  setBuyNow: (product: Product, quantity: number) => void;
  clearBuyNow: () => void;
}

export const useBuyNowStore = create<BuyNowState>()(set => ({
  item: null,

  setBuyNow: (product, quantity) =>
    set({
      item: {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
        stock: product.stock,
        quantity: Math.min(Math.max(quantity, 1), product.stock),
      },
    }),

  clearBuyNow: () => set({ item: null }),
}));
