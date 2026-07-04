'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productReviews, productQuestions, coupons, Product } from '@/lib/mock/products';
import { STATUS_BADGE_CLASSES, PlacedOrder } from '@/lib/stores/orders';
import { getProducts } from '@/lib/data/catalog';
import { adminFetch } from '@/lib/api/admin-client';

const LOW_STOCK_THRESHOLD = 100;

interface DashboardOrder extends PlacedOrder {
  id: string;
  archived?: boolean;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
    (async () => {
      try {
        const res = await adminFetch('/api/admin/orders');
        const data = await res.json();
        if (res.ok) setOrders(data.orders);
      } catch {
        // Orders unavailable — revenue shows once signed in with Firebase
      }
    })();
  }, []);

  const lowStock = products.filter(p => p.stock < LOW_STOCK_THRESHOLD);
  const pendingReviews = productReviews.filter(r => r.status === 'PENDING');
  const unansweredQuestions = productQuestions.filter(q => !q.answer);
  const activeCoupons = coupons.filter(c => c.active);

  const countedOrders = orders.filter(o => o.status !== 'CANCELLED');
  const totalRevenue = countedOrders.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      sub: `${countedOrders.length} order${countedOrders.length === 1 ? '' : 's'} incl. removed`,
      icon: '💰',
      href: '/admin/orders',
    },
    { label: 'Products Live', value: String(products.length), sub: `${lowStock.length} low stock`, icon: '📦', href: '/admin/products' },
    { label: 'Pending Reviews', value: String(pendingReviews.length), sub: `${unansweredQuestions.length} open questions`, icon: '⭐', href: '/admin/reviews' },
    { label: 'Active Coupons', value: String(activeCoupons.length), sub: `${coupons.length} total`, icon: '🎟️', href: '/admin/coupons' },
  ];

  const recentOrders = orders
    .filter(o => !o.archived)
    .slice(0, 5)
    .map(o => ({
      id: o.orderNumber,
      customer: o.address.name,
      amount: `₹${o.total.toLocaleString('en-IN')}`,
      status: o.status,
    }));

  const topProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-neutral-500">Store overview · live from Firebase</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-primary-500 transition-colors"
          >
            <span className="text-2xl">{s.icon}</span>
            <p className="text-2xl font-bold mt-3">{s.value}</p>
            <p className="text-sm text-neutral-700">{s.label}</p>
            <p className="text-xs text-neutral-500 mt-1">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-primary-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.length === 0 && (
              <p className="text-sm text-neutral-500">No orders yet — they appear here once customers check out.</p>
            )}
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0">
                <div>
                  <p className="text-sm font-mono">{o.id}</p>
                  <p className="text-xs text-neutral-500">{o.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{o.amount}</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE_CLASSES[o.status] ?? 'bg-amber-100 text-amber-600'}`}
                  >
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">⚠️ Low Stock Alerts</h2>
            <Link href="/admin/products" className="text-xs text-primary-600 hover:underline">
              Manage stock →
            </Link>
          </div>
          <div className="space-y-2">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0">
                <div>
                  <p className="text-sm">{p.name}</p>
                  <p className="text-xs text-neutral-500 font-mono">{p.sku}</p>
                </div>
                <span className={`text-sm font-bold ${p.stock < 50 ? 'text-red-600' : 'text-amber-600'}`}>
                  {p.stock} left
                </span>
              </div>
            ))}
            {lowStock.length === 0 && <p className="text-sm text-neutral-500">All products well stocked ✓</p>}
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="font-semibold mb-4">🏆 Top Products (by review volume)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topProducts.map(p => (
            <div key={p.id} className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
              <p className="text-xs font-medium line-clamp-2">{p.name}</p>
              <p className="text-sm font-bold mt-1">₹{p.price.toLocaleString('en-IN')}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                ★ {p.rating} · {p.reviews} reviews
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
