import { create } from 'zustand';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => void;
  loadCart: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,

  addItem: (product: Product, quantity: number) => {
    const state = get();
    const existingItem = state.items.find(
      (item) => item.product.id === product.id
    );

    if (existingItem) {
      set((state) => ({
        items: state.items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        ),
      }));
    } else {
      set((state) => ({
        items: [...state.items, { id: product.id, product, quantity }],
      }));
    }

    get().calculateTotal();
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
    get().calculateTotal();
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      ),
    }));
    get().calculateTotal();
  },

  clearCart: () => {
    set({ items: [], total: 0 });
  },

  calculateTotal: () => {
    const state = get();
    const total = state.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    set({ total });
  },

  loadCart: (items: CartItem[]) => {
    set({ items });
    get().calculateTotal();
  },
}));
