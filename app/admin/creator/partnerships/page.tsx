'use client';

import { useEffect, useState } from 'react';
import { adminFetch, adminMutate } from '@/lib/api/admin-client';
import { CreatorGuard } from '@/components/admin/CreatorGuard';
import { ImageUploadField } from '@/components/admin/ImageUploadField';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
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

  const resetForm = () => {
    setFormData({ name: '', logo: '', link: '', banner: '', description: '', enabled: true });
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  };

  const handleAddPartnership = async () => {
    setFormError('');
    setError('');

    if (!formData.name.trim()) {
      setFormError('Partnership name is required');
      return;
    }
    if (!formData.logo.trim()) {
      setFormError('Logo is required');
      return;
    }
    if (!formData.link.trim()) {
      setFormError('Partnership link is required');
      return;
    }
    if (!formData.banner.trim()) {
      setFormError('Banner is required');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Description is required');
      return;
    }

    try {
      if (editingId) {
        await adminMutate('/api/admin/creator/partnerships', 'PUT', { id: editingId, ...formData });
        setSuccess('Partnership updated successfully');
      } else {
        await adminMutate('/api/admin/creator/partnerships', 'POST', formData);
        setSuccess('Partnership added successfully');
      }
      resetForm();
      loadPartnerships();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save partnership');
    }
  };

  const handleEditPartnership = (partnership: Partnership) => {
    setFormData({
      name: partnership.name,
      logo: partnership.logo,
      link: partnership.link,
      banner: partnership.banner,
      description: partnership.description,
      enabled: partnership.enabled,
    });
    setEditingId(partnership.id);
    setShowForm(true);
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
                        onClick={() => handleEditPartnership(p)}
                        className="h-9 px-3 rounded-lg border border-neutral-300 text-neutral-600 text-xs font-semibold hover:bg-neutral-50"
                      >
                        ✎ Edit
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
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFormData({
                    name: 'Engorio',
                    logo: 'https://engorio-91f5c.web.app/logo.png',
                    link: 'https://engorio-91f5c.web.app',
                    banner: 'https://engorio-91f5c.web.app/banner.png',
                    description: 'Complete IoT project guides, tutorials, and free resources. Learn how to build IoT projects with step-by-step guides, free reports, presentations, and code upload guides without installing heavy software.',
                    enabled: true,
                  });
                  setShowForm(true);
                }}
                className="h-11 px-8 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
              >
                + Add Engorio
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="h-11 px-8 rounded-lg border border-neutral-300 text-neutral-600 font-semibold hover:bg-neutral-50"
              >
                + Custom Partnership
              </button>
            </div>
          )}

          {showForm && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900">{editingId ? 'Edit' : 'Add'} Partnership</h3>
                <button
                  onClick={resetForm}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  ✕ Close
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>
              )}

              <Field label="Partnership Name (e.g., Engorio)">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Partnership name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </Field>

              <Field label="Logo (Square image, min 200x200px)">
                <ImageUploadField
                  value={formData.logo}
                  onChange={url => setFormData(prev => ({ ...prev, logo: url }))}
                  category="website"
                  onError={setFormError}
                  placeholder="Upload or paste logo URL"
                />
              </Field>

              <Field label="Partnership Website URL">
                <input
                  type="url"
                  className={inputCls}
                  placeholder="https://engorio-91f5c.web.app"
                  value={formData.link}
                  onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
                />
              </Field>

              <Field label="Banner Image (1200x300px recommended)">
                <ImageUploadField
                  value={formData.banner}
                  onChange={url => setFormData(prev => ({ ...prev, banner: url }))}
                  category="banners"
                  onError={setFormError}
                  placeholder="Upload or paste banner URL"
                />
              </Field>

              <Field label="Description (What does this partnership offer?)">
                <textarea
                  rows={4}
                  className={inputCls}
                  placeholder="Complete IoT project guides, tutorials, and free resources. Learn how to build IoT projects with step-by-step guides, free reports, presentations, and code upload guides without installing heavy software."
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </Field>

              <div className="flex gap-2">
                <button
                  onClick={handleAddPartnership}
                  className="h-11 px-8 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
                >
                  {editingId ? 'Save Changes' : 'Add Partnership'}
                </button>
                <button
                  onClick={resetForm}
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
