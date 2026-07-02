'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useOrdersStore, orderTimeline, STATUS_BADGE_CLASSES } from '@/lib/stores/orders';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const orders = useOrdersStore(state => state.orders);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const order = orders.find(o => o.orderNumber === decodeURIComponent(id));

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Order not found</h1>
        <p className="text-sm text-neutral-500 mb-6">
          We couldn&apos;t find this order on this device.
        </p>
        <Link href="/orders" className="text-primary-600 hover:underline">
          ← Back to My Orders
        </Link>
      </div>
    );
  }

  const timeline = orderTimeline(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/orders" className="text-xs text-neutral-500 hover:text-primary-600">
        ← My Orders
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-2 mt-2 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 font-mono">{order.orderNumber}</h1>
          <p className="text-xs text-neutral-500">
            Placed {new Date(order.placedAt).toLocaleString('en-IN')} · {order.paymentMethod}
          </p>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_BADGE_CLASSES[order.status] ?? 'bg-neutral-100 text-neutral-600'}`}
        >
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 mb-4">Order Progress</h2>
            <ol className="space-y-4">
              {timeline.map((step, i) => (
                <li key={step.label} className="flex gap-3">
                  <span
                    className={`w-6 h-6 rounded-full grid place-items-center text-xs shrink-0 ${
                      step.done ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {step.done ? '✓' : i + 1}
                  </span>
                  <p className={`text-sm font-medium ${step.done ? 'text-neutral-900' : 'text-neutral-400'}`}>
                    {step.label}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 mb-4">Items ({order.items.length})</h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.productId} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover border border-neutral-200"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.productId}`}
                      className="text-sm font-medium text-neutral-900 hover:text-primary-600 line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 mb-3">Payment Summary</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-neutral-200 font-bold">
                <span>Total</span>
                <span>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 mb-3">Delivery Address</h2>
            <p className="text-sm font-medium text-neutral-900">{order.address.name}</p>
            <p className="text-sm text-neutral-600 mt-1">
              {order.address.address}, {order.address.city}, {order.address.state} —{' '}
              {order.address.pincode}
            </p>
            <p className="text-sm text-neutral-600 mt-1">📞 {order.address.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
