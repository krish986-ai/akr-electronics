'use client';

import { useEffect, useState } from 'react';
import { adminFetch, adminMutate } from '@/lib/api/admin-client';
import {
  ORDER_STATUSES,
  OrderStatus,
  STATUS_BADGE_CLASSES,
  PlacedOrder,
} from '@/lib/stores/orders';
import { OrderSettings, defaultOrderSettings } from '@/lib/orders/settings';

interface AdminOrder extends PlacedOrder {
  id: string;
  userId?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch('/api/admin/orders');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load');
        setOrders(data.orders);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const changeStatus = async (id: string, status: OrderStatus) => {
    const previous = orders;
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
    try {
      await adminMutate('/api/admin/orders', 'PATCH', { id, status });
    } catch (e) {
      setOrders(previous);
      setError(e instanceof Error ? e.message : 'Failed to update status');
    }
  };

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
            {revenue.toLocaleString('en-IN')} revenue (live from Firebase)
          </p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search order #, name, email..."
          className="h-10 w-72 rounded-lg border border-neutral-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <OrderSettingsPanel onError={setError} />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="p-8 text-center text-sm text-neutral-500 bg-white rounded-xl border border-neutral-200">
          Loading orders...
        </p>
      ) : orders.length === 0 ? (
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
              key={order.id}
              order={order}
              expanded={expanded === order.id}
              onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
              onStatusChange={status => changeStatus(order.id, status)}
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

function OrderSettingsPanel({ onError }: { onError: (message: string) => void }) {
  const [settings, setSettings] = useState<OrderSettings>(defaultOrderSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch('/api/admin/order-settings');
        const data = await res.json();
        if (res.ok) setSettings(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setAmount = (key: keyof OrderSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Number(e.target.value) || 0);
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await adminMutate('/api/admin/order-settings', 'PUT', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to save order settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <h2 className="font-semibold text-neutral-900">Delivery &amp; Order Settings</h2>
          <p className="text-xs text-neutral-500">
            Applied instantly at checkout for all customers
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs font-medium text-emerald-600">✓ Saved</span>}
          <button
            onClick={save}
            disabled={saving || loading}
            className="h-9 px-4 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading settings...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Minimum order amount (₹)
            </label>
            <input
              type="number"
              min={0}
              value={settings.minOrderAmount}
              onChange={setAmount('minOrderAmount')}
              className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Orders below this get the small order charge
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Small order delivery charge (₹)
            </label>
            <input
              type="number"
              min={0}
              value={settings.lowOrderCharge}
              onChange={setAmount('lowOrderCharge')}
              className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Extra delivery charge for orders below the minimum
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Fast delivery charge (₹)
            </label>
            <input
              type="number"
              min={0}
              value={settings.fastDeliveryCharge}
              onChange={setAmount('fastDeliveryCharge')}
              disabled={!settings.fastDeliveryEnabled}
              className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-400"
            />
            <p className="text-[11px] text-neutral-500 mt-1">Charge for 1-2 day delivery</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Fast delivery orders
            </label>
            <button
              onClick={() =>
                setSettings(prev => ({ ...prev, fastDeliveryEnabled: !prev.fastDeliveryEnabled }))
              }
              className={`h-10 w-full rounded-lg text-sm font-semibold border transition-colors ${
                settings.fastDeliveryEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-500'
              }`}
            >
              {settings.fastDeliveryEnabled ? '● Accepting' : '○ Not accepting'}
            </button>
            <p className="text-[11px] text-neutral-500 mt-1">
              Turn off to hide fast delivery at checkout
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Cash on Delivery
            </label>
            <button
              onClick={() => setSettings(prev => ({ ...prev, codEnabled: !prev.codEnabled }))}
              className={`h-10 w-full rounded-lg text-sm font-semibold border transition-colors ${
                settings.codEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-500'
              }`}
            >
              {settings.codEnabled ? '● Accepting' : '○ Not accepting'}
            </button>
            <p className="text-[11px] text-neutral-500 mt-1">
              Turn off to stop taking COD orders
            </p>
          </div>
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
  order: AdminOrder;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: OrderStatus) => void;
}) {
  const itemsSubtotal = order.subtotal;
  const lowOrderCharge = order.lowOrderCharge ?? 0;

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
            {order.shippingMethod === 'express' && (
              <span className="ml-1 text-amber-600 font-semibold">⚡ Fast</span>
            )}
          </p>
        </div>
        <div className="flex-1 min-w-[140px]">
          <p className="text-sm font-medium text-neutral-900">{order.address.name}</p>
          <p className="text-xs text-neutral-500">{order.address.email}</p>
        </div>
        <p className="font-bold text-neutral-900">₹{order.total.toLocaleString('en-IN')}</p>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
          {order.paymentMethod === 'Cash on Delivery' ? '💵 COD' : order.paymentMethod}
        </span>
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
                  <span className="text-neutral-500">
                    ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-semibold text-neutral-500 uppercase mt-4 mb-2">
              Pricing Breakdown
            </h3>
            <div className="text-sm space-y-1 bg-white border border-neutral-200 rounded-lg p-3">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal (incl. GST)</span>
                <span>₹{itemsSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>
                  {order.shippingMethod === 'express' ? 'Fast delivery charge' : 'Shipping'}
                </span>
                <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
              </div>
              {lowOrderCharge > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Small order charge</span>
                  <span>₹{lowOrderCharge}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-neutral-900 pt-1 border-t border-neutral-200">
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
            <p className="text-sm text-neutral-600">✉️ {order.address.email}</p>
            <p className="text-xs text-neutral-500 mt-3">
              Delivery method:{' '}
              <span className="font-medium text-neutral-700">
                {order.shippingMethod === 'express' ? 'Fast (1-2 days)' : 'Standard (3-5 days)'}
              </span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Payment method:{' '}
              <span className="font-medium text-neutral-700">{order.paymentMethod}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
