'use client';

import { useEffect, useState } from 'react';
import { adminFetch, adminMutate } from '@/lib/api/admin-client';
import { useAuth } from '@/lib/auth/client';
import { isCreatorEmail } from '@/lib/auth/creator';

interface CustomerRow {
  uid: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  branch: string;
  college: string;
  isCreator: boolean;
  createdAt: string;
  lastSignIn: string;
  disabled: boolean;
  emailVerified: boolean;
}

export default function AdminCustomersPage() {
  const { user } = useAuth();
  const canManageRoles = isCreatorEmail(user?.email);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [updatingUid, setUpdatingUid] = useState('');

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

  const changeRole = async (customer: CustomerRow, role: 'ADMIN' | 'CUSTOMER') => {
    const action = role === 'ADMIN' ? 'make an admin' : 'remove admin access from';
    if (!window.confirm(`Are you sure you want to ${action} ${customer.name} (${customer.email})?`)) {
      return;
    }
    setUpdatingUid(customer.uid);
    setError('');
    try {
      await adminMutate('/api/admin/customers', 'PATCH', { uid: customer.uid, role });
      setCustomers(prev => prev.map(c => (c.uid === customer.uid ? { ...c, role } : c)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update role');
    } finally {
      setUpdatingUid('');
    }
  };

  const filtered = customers.filter(
    c =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.college.toLowerCase().includes(search.toLowerCase()) ||
      c.branch.toLowerCase().includes(search.toLowerCase())
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
          placeholder="Search name, email, branch, college..."
          className="h-10 w-72 rounded-lg border border-neutral-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl overflow-x-auto">
        {loading ? (
          <p className="p-8 text-center text-sm text-neutral-500">Loading customers...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Mobile</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-left px-4 py-3">College</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Verified</th>
                <th className="text-left px-4 py-3">Joined</th>
                {canManageRoles && <th className="text-left px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(c => (
                <tr key={c.uid} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{c.name}</p>
                    <p className="text-xs text-neutral-500">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-neutral-700">{c.branch || '—'}</td>
                  <td className="px-4 py-3 text-neutral-700">{c.college || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 w-fit">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          c.role === 'ADMIN' ? 'bg-primary-50 text-primary-700' : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {c.role}
                      </span>
                      {c.isCreator && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                          👑 CREATOR
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.emailVerified ? '✅' : '—'}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">{c.createdAt}</td>
                  {canManageRoles && (
                    <td className="px-4 py-3">
                      {c.isCreator ? (
                        <span className="text-xs text-neutral-400">Protected</span>
                      ) : c.role === 'ADMIN' ? (
                        <button
                          onClick={() => changeRole(c, 'CUSTOMER')}
                          disabled={updatingUid === c.uid}
                          className="text-xs font-semibold text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
                        >
                          {updatingUid === c.uid ? 'Updating...' : 'Remove Admin'}
                        </button>
                      ) : (
                        <button
                          onClick={() => changeRole(c, 'ADMIN')}
                          disabled={updatingUid === c.uid}
                          className="text-xs font-semibold text-primary-700 border border-primary-200 rounded-lg px-3 py-1.5 hover:bg-primary-50 disabled:opacity-50"
                        >
                          {updatingUid === c.uid ? 'Updating...' : 'Make Admin'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && !error && (
                <tr>
                  <td colSpan={canManageRoles ? 8 : 7} className="px-4 py-8 text-center text-neutral-500">
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
