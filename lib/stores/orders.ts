import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const ORDER_STATUSES = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number] | 'CANCELLED';

export interface PlacedOrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PlacedOrder {
  orderNumber: string;
  placedAt: string;
  status: OrderStatus;
  paymentMethod: string;
  items: PlacedOrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  address: ShippingAddress;
}

interface OrdersState {
  orders: PlacedOrder[];
  placeOrder: (order: PlacedOrder) => void;
  updateStatus: (orderNumber: string, status: OrderStatus) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    set => ({
      orders: [],

      placeOrder: order => set(state => ({ orders: [order, ...state.orders] })),

      updateStatus: (orderNumber, status) =>
        set(state => ({
          orders: state.orders.map(o => (o.orderNumber === orderNumber ? { ...o, status } : o)),
        })),
    }),
    { name: 'akr-orders' }
  )
);

export function nextOrderNumber(): string {
  const suffix = Date.now().toString().slice(-6);
  return `AKR-2026-${suffix}`;
}

export interface TimelineStep {
  label: string;
  done: boolean;
}

const TIMELINE_LABELS: Record<(typeof ORDER_STATUSES)[number], string> = {
  CONFIRMED: 'Order confirmed',
  PROCESSING: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
};

export function orderTimeline(status: OrderStatus): TimelineStep[] {
  if (status === 'CANCELLED') {
    return [
      { label: 'Order confirmed', done: true },
      { label: 'Cancelled', done: true },
    ];
  }
  const reached = ORDER_STATUSES.indexOf(status);
  return ORDER_STATUSES.map((s, i) => ({ label: TIMELINE_LABELS[s], done: i <= reached }));
}

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  CONFIRMED: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};
