'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/api/admin-client';

interface CustomerRow {
  uid: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  lastSignIn: string;
  disabled: boolean;
  emailVerified: boolean;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch('/api/admin/customers');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load');
        setCustomers(data.customers);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = customers.filter(
    c =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Customers</h1>
          <p className="text-sm text-neutral-500">
            {customers.length} registered account{customers.length === 1 ? '' : 's'} (live from Firebase)
          </p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search email or name..."
          className="h-10 w-64 rounded-lg border border-neutral-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-neutral-500">Loading customers...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Verified</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Last Sign-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(c => (
                <tr key={c.uid} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{c.name}</p>
                    <p className="text-xs text-neutral-500">{c.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        c.role === 'ADMIN' ? 'bg-primary-50 text-primary-700' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {c.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.emailVerified ? '✅' : '—'}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">{c.createdAt}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">{c.lastSignIn || 'Never'}</td>
                </tr>
              ))}
              {filtered.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
