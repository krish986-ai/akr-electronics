'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { products, productReviews, productQuestions, coupons } from '@/lib/mock/products';
import { useOrdersStore, STATUS_BADGE_CLASSES } from '@/lib/stores/orders';

const LOW_STOCK_THRESHOLD = 100;

export default function AdminDashboard() {
  const orders = useOrdersStore(state => state.orders);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lowStock = products.filter(p => p.stock < LOW_STOCK_THRESHOLD);
  const pendingReviews = productReviews.filter(r => r.status === 'PENDING');
  const unansweredQuestions = productQuestions.filter(q => !q.answer);
  const activeCoupons = coupons.filter(c => c.active);
  const catalogValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const stats = [
    { label: 'Products Live', value: String(products.length), sub: `${lowStock.length} low stock`, icon: '📦', href: '/admin/products' },
    { label: 'Inventory Value', value: `₹${(catalogValue / 100000).toFixed(1)}L`, sub: 'At current prices', icon: '💰', href: '/admin/products' },
    { label: 'Pending Reviews', value: String(pendingReviews.length), sub: `${unansweredQuestions.length} open questions`, icon: '⭐', href: '/admin/reviews' },
    { label: 'Active Coupons', value: String(activeCoupons.length), sub: `${coupons.length} total`, icon: '🎟️', href: '/admin/coupons' },
  ];

  const recentOrders = (mounted ? orders : []).slice(0, 5).map(o => ({
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
        <p className="text-sm text-neutral-500">Store overview · mock data until backend integration (Phase 17)</p>
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
