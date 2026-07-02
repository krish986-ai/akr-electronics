'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/client';
import { useOrdersStore, STATUS_BADGE_CLASSES } from '@/lib/stores/orders';

export default function OrdersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const orders = useOrdersStore(state => state.orders);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Sign in to view your orders</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Or track any order without an account using your order number.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/auth/login"
            className="h-11 px-6 leading-[44px] rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
          >
            Login
          </Link>
          <Link
            href="/track-order"
            className="h-11 px-6 leading-[44px] rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50"
          >
            Track an Order
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-5xl mb-4">📦</p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">No orders yet</h1>
        <p className="text-sm text-neutral-500 mb-6">When you place an order, it will show up here.</p>
        <Link
          href="/products"
          className="inline-block bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-1">My Orders</h1>
      <p className="text-sm text-neutral-500 mb-8">
        {orders.length} order{orders.length === 1 ? '' : 's'}
      </p>

      <div className="space-y-4">
        {orders.map(order => (
          <Link
            key={order.orderNumber}
            href={`/orders/${order.orderNumber}`}
            className="block bg-white border border-neutral-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-mono font-semibold text-neutral-900">{order.orderNumber}</p>
                <p className="text-xs text-neutral-500">
                  Placed {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}
                  {order.paymentMethod}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE_CLASSES[order.status] ?? 'bg-neutral-100 text-neutral-600'}`}
              >
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              {order.items.slice(0, 4).map(item => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.productId}
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover border border-neutral-200"
                />
              ))}
              {order.items.length > 4 && (
                <span className="text-xs text-neutral-500">+{order.items.length - 4} more</span>
              )}
              <p className="ml-auto font-bold text-neutral-900">₹{order.total.toLocaleString('en-IN')}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
