'use client';

import { useState } from 'react';
import { trackableOrders, TrackableOrder } from '@/lib/mock/products';
import { useOrdersStore, orderTimeline } from '@/lib/stores/orders';

export default function TrackOrderPage() {
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
      setError('No order found. Check your order number and email. (Demo: AKR-2026-1042 / demo@akr.com)');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Track Your Order</h1>
      <p className="text-sm text-neutral-500 mt-2">
        Enter your order number and the email used at checkout — no login required.
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
