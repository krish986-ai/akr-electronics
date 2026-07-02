'use client';

import { useState } from 'react';

export default function BulkOrdersPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Bulk & B2B Orders</h1>
      <p className="text-sm text-neutral-500 mt-2">
        Special pricing for schools, colleges, ATL labs, startups and businesses. GST-billed
        quotes, volume discounts, and dedicated support.
      </p>

      <div className="mt-6 grid sm:grid-cols-3 gap-4 text-center">
        {[
          { icon: '🏫', label: 'Schools & ATL Labs' },
          { icon: '🎓', label: 'Colleges & Universities' },
          { icon: '🏭', label: 'Startups & Industry' },
        ].map(x => (
          <div key={x.label} className="p-4 bg-white border border-neutral-200 rounded-xl">
            <p className="text-2xl">{x.icon}</p>
            <p className="text-sm font-medium mt-1">{x.label}</p>
          </div>
        ))}
      </div>

      {sent ? (
        <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <p className="font-semibold text-emerald-800">✓ Enquiry received!</p>
          <p className="text-sm text-emerald-700 mt-1">
            Our B2B team will send you a quote within one business day.
          </p>
        </div>
      ) : (
        <form
          onSubmit={e => {
            e.preventDefault();
            setSent(true);
          }}
          className="mt-8 bg-white border border-neutral-200 rounded-xl p-6 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              required
              placeholder="Contact name"
              className="h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              required
              placeholder="Organisation"
              className="h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              required
              type="email"
              placeholder="Work email"
              className="h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              required
              placeholder="Phone"
              className="h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              placeholder="GSTIN (optional)"
              className="h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 sm:col-span-2"
            />
          </div>
          <textarea
            required
            rows={5}
            placeholder="What do you need? List products and quantities — or paste your BOM."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="h-10 px-6 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
          >
            Request Quote
          </button>
        </form>
      )}
    </div>
  );
}
