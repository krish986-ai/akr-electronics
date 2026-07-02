import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, FREE_DELIVERY_THRESHOLD } from '@/lib/mock/products';

export interface CartLine {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartLine[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    set => ({
      items: [],

      addItem: (product, quantity) =>
        set(state => {
          const existing = state.items.find(item => item.productId === product.id);
          if (existing) {
            return {
              items: state.items.map(item =>
                item.productId === product.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                slug: product.slug,
                image: product.image,
                price: product.price,
                stock: product.stock,
                quantity: Math.min(quantity, product.stock),
              },
            ],
          };
        }),

      removeItem: productId =>
        set(state => ({ items: state.items.filter(item => item.productId !== productId) })),

      updateQuantity: (productId, quantity) =>
        set(state => ({
          items:
            quantity <= 0
              ? state.items.filter(item => item.productId !== productId)
              : state.items.map(item =>
                  item.productId === productId
                    ? { ...item, quantity: Math.min(quantity, item.stock) }
                    : item
                ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    { name: 'akr-cart' }
  )
);

export function cartSubtotal(items: CartLine[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartShipping(subtotal: number): number {
  return subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 49;
}

export function cartCount(items: CartLine[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
