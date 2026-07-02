'use client';

import { useState } from 'react';
import { heroBanners } from '@/lib/mock/products';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState(heroBanners.map(b => ({ ...b, active: true })));
  const [announcement, setAnnouncement] = useState(
    'Grand Opening Offer — Free delivery above ₹999 · Use code SAVE10 for 10% off'
  );
  const [saved, setSaved] = useState(false);

  const toggleBanner = (id: string) =>
    setBanners(bs => bs.map(b => (b.id === id ? { ...b, active: !b.active } : b)));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Banners & Campaigns</h1>
          <p className="text-sm text-neutral-400">Control the homepage hero carousel and announcement bar</p>
        </div>
        <button className="px-4 h-10 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500">
          + New Banner
        </button>
      </div>

      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold mb-2">📢 Announcement Bar</h2>
        <div className="flex gap-2">
          <input
            value={announcement}
            onChange={e => {
              setAnnouncement(e.target.value);
              setSaved(false);
            }}
            className="flex-1 h-10 rounded-lg bg-neutral-900 border border-neutral-700 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => setSaved(true)}
            className="px-4 h-10 rounded-lg bg-neutral-700 text-sm font-medium hover:bg-neutral-600"
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      <h2 className="text-sm font-semibold mb-3">🎠 Hero Carousel ({banners.filter(b => b.active).length} active)</h2>
      <div className="space-y-3">
        {banners.map(b => (
          <div
            key={b.id}
            className={`bg-neutral-800 border rounded-xl p-4 flex items-center gap-4 ${
              b.active ? 'border-neutral-700' : 'border-neutral-700 opacity-50'
            }`}
          >
            <div className={`w-24 h-14 rounded-lg bg-gradient-to-r ${b.gradient} shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{b.title}</p>
              <p className="text-xs text-neutral-400 truncate">{b.subtitle}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                CTA: “{b.cta}” → {b.href}
              </p>
            </div>
            {b.badge && (
              <span className="text-[10px] bg-neutral-700 px-2 py-1 rounded-full whitespace-nowrap">{b.badge}</span>
            )}
            <button
              onClick={() => toggleBanner(b.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                b.active ? 'bg-emerald-600/20 text-emerald-400' : 'bg-neutral-700 text-neutral-400'
              }`}
            >
              {b.active ? 'Active' : 'Inactive'}
            </button>
            <button className="text-xs text-primary-400 hover:underline">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}
