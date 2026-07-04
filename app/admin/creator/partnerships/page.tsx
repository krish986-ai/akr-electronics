'use client';

import { useEffect, useState } from 'react';
import { adminFetch, adminMutate } from '@/lib/api/admin-client';
import { CreatorGuard } from '@/components/admin/CreatorGuard';

interface Partnership {
  id: string;
  name: string;
  logo: string;
  link: string;
  banner: string;
  description: string;
  enabled: boolean;
  createdAt: string;
}

function PartnershipsContent() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Partnership, 'id' | 'createdAt'>>({
    name: '',
    logo: '',
    link: '',
    banner: '',
    description: '',
    enabled: true,
  });

  useEffect(() => {
    loadPartnerships();
  }, []);

  const loadPartnerships = async () => {
    try {
      const res = await adminFetch('/api/admin/creator/partnerships');
      const data = await res.json();
      if (res.ok) {
        setPartnerships(data.partnerships || []);
      }
    } catch (e) {
      setError('Failed to load partnerships');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPartnership = async () => {
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Partnership name is required');
      return;
    }
    if (!formData.logo.trim()) {
      setError('Logo URL is required');
      return;
    }
    if (!formData.link.trim()) {
      setError('Partnership link is required');
      return;
    }
    if (!formData.banner.trim()) {
      setError('Banner URL is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      await adminMutate('/api/admin/creator/partnerships', 'POST', formData);
      setSuccess('Partnership added successfully');
      setFormData({ name: '', logo: '', link: '', banner: '', description: '', enabled: true });
      setShowForm(false);
      loadPartnerships();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add partnership');
    }
  };

  const handleTogglePartnership = async (id: string, enabled: boolean) => {
    try {
      await adminMutate('/api/admin/creator/partnerships', 'PATCH', { id, enabled: !enabled });
      setPartnerships(prev =>
        prev.map(p => (p.id === id ? { ...p, enabled: !enabled } : p))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to toggle partnership');
    }
  };

  const handleDeletePartnership = async (id: string) => {
    if (!window.confirm('Delete this partnership?')) return;
    try {
      await adminMutate('/api/admin/creator/partnerships', 'DELETE', { id });
      setPartnerships(prev => prev.filter(p => p.id !== id));
      setSuccess('Partnership deleted');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete partnership');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Partnerships</h1>
        <p className="text-sm text-neutral-500">Manage partnerships and promotions across AKR Electronics</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          ✓ {success}
        </div>
      )}

      {loading ? (
        <p className="text-center text-sm text-neutral-500">Loading partnerships...</p>
      ) : (
        <>
          <div className="space-y-3">
            {partnerships.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-neutral-200">
                <p className="text-4xl mb-2">🤝</p>
                <p className="font-medium text-neutral-900">No partnerships yet</p>
                <p className="text-sm text-neutral-500 mt-1">Add your first partnership to get started</p>
              </div>
            ) : (
              partnerships.map(p => (
                <div
                  key={p.id}
                  className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <img
                        src={p.logo}
                        alt={p.name}
                        className="w-16 h-16 rounded-lg object-cover border border-neutral-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900">{p.name}</p>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{p.description}</p>
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:underline mt-1 inline-block"
                        >
                          Visit →
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTogglePartnership(p.id, p.enabled)}
                        className={`h-9 px-3 rounded-lg text-xs font-semibold ${
                          p.enabled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                        }`}
                      >
                        {p.enabled ? '✓ Active' : 'Hidden'}
                      </button>
                      <button
                        onClick={() => handleDeletePartnership(p.id)}
                        className="h-9 px-3 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="h-11 px-8 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
            >
              + Add Partnership
            </button>
          )}

          {showForm && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-neutral-900">Add New Partnership</h3>

              <Field label="Partnership Name">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g., Engorio"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </Field>

              <Field label="Logo URL">
                <input
                  type="url"
                  className={inputCls}
                  placeholder="https://example.com/logo.png"
                  value={formData.logo}
                  onChange={e => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                />
              </Field>

              <Field label="Partnership Link">
                <input
                  type="url"
                  className={inputCls}
                  placeholder="https://engorio-915fc.web.app"
                  value={formData.link}
                  onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
                />
              </Field>

              <Field label="Banner Image URL">
                <input
                  type="url"
                  className={inputCls}
                  placeholder="https://example.com/banner.png"
                  value={formData.banner}
                  onChange={e => setFormData(prev => ({ ...prev, banner: e.target.value }))}
                />
              </Field>

              <Field label="Description">
                <textarea
                  rows={3}
                  className={inputCls}
                  placeholder="e.g., Complete IoT project guides, free reports, presentations, and coding tutorials"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </Field>

              <div className="flex gap-2">
                <button
                  onClick={handleAddPartnership}
                  className="h-11 px-8 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
                >
                  Add Partnership
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', logo: '', link: '', banner: '', description: '', enabled: true });
                  }}
                  className="h-11 px-8 rounded-lg border border-neutral-300 text-neutral-600 font-semibold hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const inputCls =
  'w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function PartnershipsPage() {
  return (
    <CreatorGuard>
      <PartnershipsContent />
    </CreatorGuard>
  );
}
