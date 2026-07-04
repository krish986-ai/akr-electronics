'use client';

import { useEffect, useState } from 'react';
import { adminFetch, adminMutate } from '@/lib/api/admin-client';
import {
  ORDER_STATUSES,
  OrderStatus,
  STATUS_BADGE_CLASSES,
  PlacedOrder,
} from '@/lib/stores/orders';

interface AdminOrder extends PlacedOrder {
  id: string;
  userId?: string;
  archived?: boolean;
}

interface BulkEnquiry {
  id: string;
  contactName: string;
  organisation: string;
  email: string;
  phone: string;
  gstin?: string;
  requirements: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
}

const STATUS_FILTERS = ['ALL', ...ORDER_STATUSES, 'CANCELLED', 'REMOVED'] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'orders' | 'bulk'>('orders');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('ALL');

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

  const removeOrder = async (order: AdminOrder) => {
    if (
      !window.confirm(
        `Remove delivered order ${order.orderNumber} from this list? It stays in total revenue on the dashboard.`
      )
    ) {
      return;
    }
    const previous = orders;
    setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, archived: true } : o)));
    try {
      await adminMutate('/api/admin/orders', 'PATCH', { id: order.id, archive: true });
    } catch (e) {
      setOrders(previous);
      setError(e instanceof Error ? e.message : 'Failed to remove order');
    }
  };

  const deleteForever = async (order: AdminOrder) => {
    const password = window.prompt(
      `⚠ PERMANENT DELETE — ${order.orderNumber}\n\nThis removes the order completely: from this list, the dashboard revenue, and the customer's account. It cannot be undone.\n\nEnter the admin action password to continue:`
    );
    if (password === null) return;
    setError('');
    try {
      await adminMutate('/api/admin/orders', 'DELETE', { id: order.id, password });
      setOrders(prev => prev.filter(o => o.id !== order.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete order');
    }
  };

  const visible = orders.filter(o => !o.archived && o.status !== 'PENDING');
  const archivedOrders = orders.filter(o => o.archived);
  const pendingCount = orders.filter(o => !o.archived && o.status === 'PENDING').length;
  const pool = statusFilter === 'REMOVED' ? archivedOrders : visible;
  const filtered = pool.filter(
    o =>
      (statusFilter === 'ALL' || statusFilter === 'REMOVED' || o.status === statusFilter) &&
      (o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.address.name.toLowerCase().includes(search.toLowerCase()) ||
        o.address.email.toLowerCase().includes(search.toLowerCase()))
  );

  const revenue = orders
    .filter(o => o.status !== 'CANCELLED' && o.status !== 'PENDING')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
          <p className="text-sm text-neutral-500">
            {visible.length} order{visible.length === 1 ? '' : 's'} · ₹
            {revenue.toLocaleString('en-IN')} revenue incl. removed (live from Firebase)
            {pendingCount > 0 && (
              <span className="ml-2 text-orange-600 font-medium">
                · {pendingCount} QR payment{pendingCount === 1 ? '' : 's'} awaiting verification in Payments
              </span>
            )}
          </p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search order #, name, email..."
          className="h-10 w-72 rounded-lg border border-neutral-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setView('orders')}
          className={`h-9 px-4 rounded-lg text-sm font-semibold ${
            view === 'orders'
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          🛒 Customer Orders
        </button>
        <button
          onClick={() => setView('bulk')}
          className={`h-9 px-4 rounded-lg text-sm font-semibold ${
            view === 'bulk'
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          🏫 Bulk Enquiries
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {view === 'bulk' ? (
        <BulkEnquiriesPanel onError={setError} />
      ) : (
        <>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`h-8 px-3 rounded-full text-xs font-semibold ${
                  statusFilter === s
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {s === 'ALL' ? 'All' : s === 'REMOVED' ? '🗂 Removed' : s.replace(/_/g, ' ')}
                {s !== 'ALL' && (
                  <span className="ml-1 opacity-60">
                    {s === 'REMOVED'
                      ? archivedOrders.length
                      : visible.filter(o => o.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-neutral-500 bg-white rounded-xl border border-neutral-200">
              Loading orders...
            </p>
          ) : visible.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-neutral-300">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-medium text-neutral-900">No orders yet</p>
              <p className="text-sm text-neutral-500 mt-1">
                Orders placed on the storefront will appear here. Place a test order via the checkout
                to try the status pipeline.
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
                  onRemove={() => removeOrder(order)}
                  onDeleteForever={() => deleteForever(order)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-8">
                  No orders match this filter.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BulkEnquiriesPanel({ onError }: { onError: (message: string) => void }) {
  const [enquiries, setEnquiries] = useState<BulkEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch('/api/admin/bulk-orders');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load enquiries');
        setEnquiries(data.enquiries);
      } catch (e) {
        onError(e instanceof Error ? e.message : 'Failed to load enquiries');
      } finally {
        setLoading(false);
      }
    })();
  }, [onError]);

  const changeStatus = async (id: string, status: BulkEnquiry['status']) => {
    const previous = enquiries;
    setEnquiries(prev => prev.map(q => (q.id === id ? { ...q, status } : q)));
    try {
      await adminMutate('/api/admin/bulk-orders', 'PATCH', { id, status });
    } catch (e) {
      setEnquiries(previous);
      onError(e instanceof Error ? e.message : 'Failed to update enquiry');
    }
  };

  if (loading) {
    return (
      <p className="p-8 text-center text-sm text-neutral-500 bg-white rounded-xl border border-neutral-200">
        Loading bulk enquiries...
      </p>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-neutral-300">
        <p className="text-4xl mb-3">🏫</p>
        <p className="font-medium text-neutral-900">No bulk enquiries yet</p>
        <p className="text-sm text-neutral-500 mt-1">
          Quote requests from the Bulk &amp; B2B Orders page will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {enquiries.map(q => (
        <div key={q.id} className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <p className="text-sm font-semibold text-neutral-900">{q.organisation}</p>
              <p className="text-xs text-neutral-500">
                {q.contactName} · {q.email} · {q.phone}
                {q.gstin && ` · GSTIN: ${q.gstin}`}
              </p>
            </div>
            <p className="text-xs text-neutral-400">
              {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN') : ''}
            </p>
            <select
              value={q.status}
              onChange={e => changeStatus(q.id, e.target.value as BulkEnquiry['status'])}
              className="h-9 rounded-lg border border-neutral-300 px-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <p className="mt-3 text-sm text-neutral-700 whitespace-pre-wrap bg-neutral-50 border border-neutral-200 rounded-lg p-3">
            {q.requirements}
          </p>
        </div>
      ))}
    </div>
  );
}

function AdminOrderCard({
  order,
  expanded,
  onToggle,
  onStatusChange,
  onRemove,
  onDeleteForever,
}: {
  order: AdminOrder;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: OrderStatus) => void;
  onRemove: () => void;
  onDeleteForever: () => void;
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
        {order.status === 'DELIVERED' && !order.archived && (
          <button
            onClick={onRemove}
            className="h-9 px-3 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 whitespace-nowrap"
          >
            🗑 Remove
          </button>
        )}
        <button
          onClick={onDeleteForever}
          title="Permanently delete this order from everywhere (password required)"
          className="h-9 px-3 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 whitespace-nowrap"
        >
          ✕ Delete Forever
        </button>
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
