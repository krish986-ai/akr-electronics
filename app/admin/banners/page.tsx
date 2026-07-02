'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { HeroBanner } from '@/lib/mock/products';
import { getBanners } from '@/lib/data/catalog';
import { adminMutate } from '@/lib/api/admin-client';

const GRADIENTS = [
  'from-primary-700 via-primary-600 to-primary-400',
  'from-indigo-700 via-indigo-600 to-blue-400',
  'from-emerald-700 via-emerald-600 to-teal-400',
  'from-rose-700 via-rose-600 to-orange-400',
  'from-neutral-900 via-neutral-800 to-neutral-600',
];

interface BannerForm {
  id?: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
  badge: string;
}

const EMPTY_FORM: BannerForm = {
  title: '',
  subtitle: '',
  cta: 'Shop Now',
  href: '/products',
  gradient: GRADIENTS[0],
  badge: '',
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<BannerForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setBanners(await getBanners());
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveBanner = async () => {
    if (!form) return;
    setSaving(true);
    setError('');
    try {
      await adminMutate('/api/admin/banners', 'POST', {
        id: form.id ?? `hb-${Date.now()}`,
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        cta: form.cta.trim(),
        href: form.href.trim(),
        gradient: form.gradient,
        badge: form.badge.trim() || undefined,
        active: true,
      });
      setForm(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (banner: HeroBanner) => {
    setError('');
    try {
      await adminMutate('/api/admin/banners', 'POST', { ...banner, active: banner.active === false });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Toggle failed');
    }
  };

  const remove = async (banner: HeroBanner) => {
    if (!confirm(`Delete banner "${banner.title}"?`)) return;
    try {
      await adminMutate('/api/admin/banners', 'DELETE', { id: banner.id });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Banners</h1>
          <p className="text-sm text-neutral-500">
            Homepage hero carousel · announcement bar is in{' '}
            <Link href="/admin/settings" className="text-primary-600 hover:underline">
              Settings
            </Link>
          </p>
        </div>
        <button
          onClick={() => {
            setError('');
            setForm({ ...EMPTY_FORM });
          }}
          className="h-10 px-4 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
        >
          + New Banner
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="p-8 text-center text-sm text-neutral-500">Loading banners...</p>
      ) : (
        <div className="space-y-3">
          {banners.map(b => (
            <div
              key={b.id}
              className={`bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-4 ${
                b.active === false ? 'opacity-50' : ''
              }`}
            >
              <div className={`w-24 h-14 rounded-lg bg-gradient-to-r ${b.gradient} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{b.title}</p>
                <p className="text-xs text-neutral-500 truncate">{b.subtitle}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  “{b.cta}” → {b.href}
                </p>
              </div>
              {b.badge && (
                <span className="text-[10px] bg-neutral-100 px-2 py-1 rounded-full whitespace-nowrap">{b.badge}</span>
              )}
              <button
                onClick={() => toggle(b)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                  b.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {b.active !== false ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => {
                  setError('');
                  setForm({
                    id: b.id,
                    title: b.title,
                    subtitle: b.subtitle,
                    cta: b.cta,
                    href: b.href,
                    gradient: b.gradient,
                    badge: b.badge ?? '',
                  });
                }}
                className="text-xs text-primary-600 hover:underline font-medium"
              >
                Edit
              </button>
              <button onClick={() => remove(b)} className="text-xs text-red-600 hover:underline font-medium">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-neutral-900">{form.id ? 'Edit Banner' : 'New Banner'}</h2>
              <button onClick={() => setForm(null)} className="text-neutral-400 hover:text-neutral-700 text-xl">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <Field label="Title *">
                <input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </Field>
              <Field label="Subtitle">
                <input className={inputCls} value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Button text *">
                  <input className={inputCls} value={form.cta} onChange={e => setForm({ ...form, cta: e.target.value })} />
                </Field>
                <Field label="Button link *">
                  <input className={inputCls} value={form.href} onChange={e => setForm({ ...form, href: e.target.value })} placeholder="/products" />
                </Field>
              </div>
              <Field label="Badge (optional)">
                <input className={inputCls} value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Limited offer" />
              </Field>
              <Field label="Background">
                <div className="flex gap-2">
                  {GRADIENTS.map(g => (
                    <button
                      key={g}
                      onClick={() => setForm({ ...form, gradient: g })}
                      className={`w-14 h-9 rounded-lg bg-gradient-to-r ${g} ${
                        form.gradient === g ? 'ring-2 ring-offset-2 ring-primary-600' : ''
                      }`}
                      aria-label="Select gradient"
                    />
                  ))}
                </div>
              </Field>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveBanner}
                disabled={saving || !form.title.trim()}
                className="flex-1 h-11 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Banner'}
              </button>
              <button
                onClick={() => setForm(null)}
                className="h-11 px-5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
