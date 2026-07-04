'use client';

import { useState } from 'react';

const inputCls =
  'h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

export default function BulkOrdersPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    contactName: '',
    organisation: '',
    email: '',
    phone: '',
    gstin: '',
    requirements: '',
  });

  const setField = (name: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/bulk-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, gstin: form.gstin.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit enquiry');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit enquiry');
    } finally {
      setSending(false);
    }
  };

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
        <form onSubmit={submit} className="mt-8 bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              required
              value={form.contactName}
              onChange={setField('contactName')}
              placeholder="Contact name"
              className={inputCls}
            />
            <input
              required
              value={form.organisation}
              onChange={setField('organisation')}
              placeholder="Organisation"
              className={inputCls}
            />
            <input
              required
              type="email"
              value={form.email}
              onChange={setField('email')}
              placeholder="Work email"
              className={inputCls}
            />
            <input
              required
              value={form.phone}
              onChange={setField('phone')}
              placeholder="Phone"
              className={inputCls}
            />
            <input
              value={form.gstin}
              onChange={setField('gstin')}
              placeholder="GSTIN (optional)"
              className={`${inputCls} sm:col-span-2`}
            />
          </div>
          <textarea
            required
            rows={5}
            value={form.requirements}
            onChange={setField('requirements')}
            placeholder="What do you need? List products and quantities — or paste your BOM."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={sending}
            className="h-10 px-6 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Request Quote'}
          </button>
        </form>
      )}
    </div>
  );
}
