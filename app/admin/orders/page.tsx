'use client';

import { useEffect, useState } from 'react';
import {
  useOrdersStore,
  ORDER_STATUSES,
  OrderStatus,
  STATUS_BADGE_CLASSES,
  PlacedOrder,
} from '@/lib/stores/orders';

export default function AdminOrdersPage() {
  const { orders, updateStatus } = useOrdersStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const filtered = orders.filter(
    o =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.address.name.toLowerCase().includes(search.toLowerCase()) ||
      o.address.email.toLowerCase().includes(search.toLowerCase())
  );

  const revenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
          <p className="text-sm text-neutral-500">
            {orders.length} order{orders.length === 1 ? '' : 's'} · ₹
            {revenue.toLocaleString('en-IN')} revenue
          </p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search order #, name, email..."
          className="h-10 w-72 rounded-lg border border-neutral-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-neutral-300">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium text-neutral-900">No orders yet</p>
          <p className="text-sm text-neutral-500 mt-1">
            Orders placed on the storefront will appear here. Place a test order via the checkout to
            try the status pipeline.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <AdminOrderCard
              key={order.orderNumber}
              order={order}
              expanded={expanded === order.orderNumber}
              onToggle={() =>
                setExpanded(expanded === order.orderNumber ? null : order.orderNumber)
              }
              onStatusChange={status => updateStatus(order.orderNumber, status)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-neutral-500 text-center py-8">No orders match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}

function AdminOrderCard({
  order,
  expanded,
  onToggle,
  onStatusChange,
}: {
  order: PlacedOrder;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: OrderStatus) => void;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="p-4 flex items-center gap-4 flex-wrap">
        <button onClick={onToggle} className="text-neutral-400 hover:text-neutral-700" aria-label="Toggle details">
          {expanded ? '▾' : '▸'}
        </button>
        <div className="min-w-[140px]">
          <p className="font-mono font-semibold text-sm text-neutral-900">{order.orderNumber}</p>
          <p className="text-xs text-neutral-500">
            {new Date(order.placedAt).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div className="flex-1 min-w-[140px]">
          <p className="text-sm font-medium text-neutral-900">{order.address.name}</p>
          <p className="text-xs text-neutral-500">{order.address.email}</p>
        </div>
        <p className="font-bold text-neutral-900">₹{order.total.toLocaleString('en-IN')}</p>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE_CLASSES[order.status] ?? 'bg-neutral-100 text-neutral-600'}`}
        >
          {order.status.replace(/_/g, ' ')}
        </span>
        <select
          value={order.status}
          onChange={e => onStatusChange(e.target.value as OrderStatus)}
          className="h-9 rounded-lg border border-neutral-300 px-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {expanded && (
        <div className="border-t border-neutral-200 bg-neutral-50 p-4 grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Items</h3>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.productId} className="flex items-center gap-2 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-9 h-9 rounded object-cover border border-neutral-200"
                  />
                  <span className="flex-1 text-neutral-800">{item.name}</span>
                  <span className="text-neutral-500">× {item.quantity}</span>
                  <span className="font-medium">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-neutral-200 text-sm space-y-1">
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-neutral-900">
                <span>Total ({order.paymentMethod})</span>
                <span>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Delivery Address</h3>
            <p className="text-sm text-neutral-800">{order.address.name}</p>
            <p className="text-sm text-neutral-600">
              {order.address.address}, {order.address.city}, {order.address.state} —{' '}
              {order.address.pincode}
            </p>
            <p className="text-sm text-neutral-600 mt-1">📞 {order.address.phone}</p>
          </div>
        </div>
      )}
    </div>
  );
}
