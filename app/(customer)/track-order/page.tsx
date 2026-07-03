'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { trackableOrders, TrackableOrder } from '@/lib/mock/products';
import {
  useOrdersStore,
  orderTimeline,
  PlacedOrder,
  STATUS_BADGE_CLASSES,
} from '@/lib/stores/orders';
import { useAuth } from '@/lib/auth/client';
import { fetchMyOrders } from '@/lib/orders/service';

export default function TrackOrderPage() {
  const { user, isLoading } = useAuth();
  const [myOrders, setMyOrders] = useState<PlacedOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setOrdersLoading(false);
      return;
    }
    fetchMyOrders(user.id)
      .then(setMyOrders)
      .finally(() => setOrdersLoading(false));
  }, [user, isLoading]);

  if (isLoading || ordersLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold text-neutral-900">Track Your Orders</h1>
        <p className="text-sm text-neutral-500 mt-2">
          Your order history, automatically — no order number needed.
        </p>

        {myOrders.length === 0 ? (
          <div className="mt-10 text-center bg-white border border-dashed border-neutral-300 rounded-xl p-10">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium text-neutral-900">No orders yet</p>
            <p className="text-sm text-neutral-500 mt-1 mb-4">
              When you place an order, its live status will show up here.
            </p>
            <Link
              href="/products"
              className="inline-block bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {myOrders.map(order => (
              <div key={order.orderNumber} className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <Link
                      href={`/orders/${order.orderNumber}`}
                      className="font-bold font-mono text-neutral-900 hover:text-primary-600"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      Placed {new Date(order.placedAt).toLocaleDateString('en-IN')} · ₹
                      {order.total.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_BADGE_CLASSES[order.status] ?? 'bg-neutral-100 text-neutral-600'}`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <ol className="mt-5 space-y-3">
                  {orderTimeline(order.status).map((step, i) => (
                    <li key={i} className="flex gap-3 items-center">
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

                <p className="mt-4 text-xs text-neutral-500">
                  {order.items.map(i => `${i.quantity} × ${i.name}`).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <GuestTracker />;
}

function GuestTracker() {
  const placedOrders = useOrdersStore(state => state.orders);
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<TrackableOrder | null>(null);
  const [error, setError] = useState('');

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    const wantedNumber = orderNumber.trim().toLowerCase();
    const wantedEmail = email.trim().toLowerCase();

    const placed = placedOrders.find(
      o =>
        o.orderNumber.toLowerCase() === wantedNumber &&
        o.address.email.toLowerCase() === wantedEmail
    );
    if (placed) {
      setResult({
        orderNumber: placed.orderNumber,
        email: placed.address.email,
        status: placed.status === 'CANCELLED' ? 'CONFIRMED' : placed.status,
        placedAt: new Date(placed.placedAt).toLocaleDateString('en-IN'),
        items: placed.items.map(i => ({ name: i.name, quantity: i.quantity })),
        timeline: orderTimeline(placed.status).map(step => ({
          label: step.label,
          date: '',
          done: step.done,
        })),
      });
      setError('');
      return;
    }

    const demo = trackableOrders.find(
      o => o.orderNumber.toLowerCase() === wantedNumber && o.email.toLowerCase() === wantedEmail
    );
    if (demo) {
      setResult(demo);
      setError('');
    } else {
      setResult(null);
      setError('No order found. Check your order number and email.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Track Your Order</h1>
      <p className="text-sm text-neutral-500 mt-2">
        <Link href="/auth/login" className="text-primary-600 hover:underline">
          Sign in
        </Link>{' '}
        to see all your orders automatically, or look one up with your order number.
      </p>

      <form onSubmit={lookup} className="mt-8 bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Order Number</label>
          <input
            value={orderNumber}
            onChange={e => setOrderNumber(e.target.value)}
            placeholder="e.g. AKR-2026-1042"
            required
            className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          className="w-full h-10 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
        >
          Track Order
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {result && (
        <div className="mt-8 bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-neutral-900">{result.orderNumber}</h2>
              <p className="text-xs text-neutral-500">Placed on {result.placedAt}</p>
            </div>
            <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-3 py-1 rounded-full">
              {result.status.replace(/_/g, ' ')}
            </span>
          </div>

          <ol className="mt-6 space-y-4">
            {result.timeline.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className={`w-6 h-6 rounded-full grid place-items-center text-xs shrink-0 ${
                    step.done ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {step.done ? '✓' : i + 1}
                </span>
                <div>
                  <p className={`text-sm font-medium ${step.done ? 'text-neutral-900' : 'text-neutral-400'}`}>
                    {step.label}
                  </p>
                  {step.date && <p className="text-xs text-neutral-400">{step.date}</p>}
                </div>
              </li>
            ))}
          </ol>

          <h3 className="mt-6 text-sm font-semibold text-neutral-900">Items</h3>
          <ul className="mt-2 space-y-1">
            {result.items.map(item => (
              <li key={item.name} className="text-sm text-neutral-700">
                {item.quantity} × {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
