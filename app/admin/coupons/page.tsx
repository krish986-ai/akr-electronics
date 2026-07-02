'use client';

import { useState } from 'react';
import { coupons as seedCoupons, Coupon } from '@/lib/mock/products';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(seedCoupons);
  const [form, setForm] = useState({ code: '', type: 'PERCENT' as Coupon['type'], value: 10, minOrder: 0 });

  const toggle = (code: string) =>
    setCoupons(cs => cs.map(c => (c.code === code ? { ...c, active: !c.active } : c)));

  const addCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = form.code.trim().toUpperCase();
    if (!code || coupons.some(c => c.code === code)) return;
    setCoupons(cs => [
      ...cs,
      { code, type: form.type, value: form.value, minOrder: form.minOrder, expiresAt: '2026-12-31', active: true },
    ]);
    setForm({ code: '', type: 'PERCENT', value: 10, minOrder: 0 });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Coupons</h1>
      <p className="text-sm text-neutral-400 mb-6">
        {coupons.filter(c => c.active).length} active of {coupons.length} total
      </p>

      <form onSubmit={addCoupon} className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Code</label>
          <input
            value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
            placeholder="MAKER20"
            className="h-9 w-32 rounded-lg bg-neutral-900 border border-neutral-700 px-3 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Type</label>
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value as Coupon['type'] }))}
            className="h-9 rounded-lg bg-neutral-900 border border-neutral-700 px-2 text-sm"
          >
            <option value="PERCENT">% off</option>
            <option value="FLAT">₹ flat off</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Value</label>
          <input
            type="number"
            min={1}
            value={form.value}
            onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
            className="h-9 w-24 rounded-lg bg-neutral-900 border border-neutral-700 px-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Min order (₹)</label>
          <input
            type="number"
            min={0}
            value={form.minOrder}
            onChange={e => setForm(f => ({ ...f, minOrder: Number(e.target.value) }))}
            className="h-9 w-28 rounded-lg bg-neutral-900 border border-neutral-700 px-3 text-sm"
          />
        </div>
        <button type="submit" className="h-9 px-4 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500">
          + Create Coupon
        </button>
      </form>

      <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-850 text-neutral-400 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Discount</th>
              <th className="text-left px-4 py-3">Min Order</th>
              <th className="text-left px-4 py-3">Expires</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {coupons.map(c => (
              <tr key={c.code}>
                <td className="px-4 py-3 font-mono font-semibold text-amber-400">{c.code}</td>
                <td className="px-4 py-3">{c.type === 'PERCENT' ? `${c.value}% off` : `₹${c.value} off`}</td>
                <td className="px-4 py-3">₹{c.minOrder}</td>
                <td className="px-4 py-3 text-neutral-400">{c.expiresAt}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(c.code)}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      c.active ? 'bg-emerald-600/20 text-emerald-400' : 'bg-neutral-700 text-neutral-400'
                    }`}
                  >
                    {c.active ? 'Active' : 'Disabled'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
