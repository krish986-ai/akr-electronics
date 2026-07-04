'use client';

import { useEffect, useState } from 'react';
import { StoreConfig, defaultStoreConfig } from '@/lib/mock/products';
import { adminFetch, adminMutate } from '@/lib/api/admin-client';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreConfig>(defaultStoreConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch('/api/admin/settings');
        const data = await res.json();
        if (res.ok) setSettings(data);
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      console.log('[Settings Page] Saving settings:', settings);
      await adminMutate('/api/admin/settings', 'PUT', settings);
      console.log('[Settings Page] Settings saved, reloading...');

      // Reload settings from API to confirm save
      const res = await adminFetch('/api/admin/settings');
      const data = await res.json();
      console.log('[Settings Page] Reloaded settings:', data);

      if (res.ok) {
        setSettings(data);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('[Settings Page] Error:', e);
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-8 text-center text-sm text-neutral-500">Loading settings...</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">Store-wide configuration · saved to Firestore</p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          ✓ Settings saved — changes appear on the store within a few minutes
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-neutral-900">Store Identity</h2>
        <Field label="Store name">
          <input
            className={inputCls}
            value={settings.storeName}
            onChange={e => setSettings(s => ({ ...s, storeName: e.target.value }))}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Support email">
            <input
              type="email"
              className={inputCls}
              value={settings.supportEmail}
              onChange={e => setSettings(s => ({ ...s, supportEmail: e.target.value }))}
            />
          </Field>
          <Field label="Support phone">
            <input
              className={inputCls}
              value={settings.supportPhone}
              onChange={e => setSettings(s => ({ ...s, supportPhone: e.target.value }))}
            />
          </Field>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-neutral-900">Storefront</h2>
        <Field label="Announcement bar text (shown at the very top of the store)">
          <textarea
            rows={2}
            className={inputCls}
            value={settings.announcement}
            onChange={e => setSettings(s => ({ ...s, announcement: e.target.value }))}
          />
        </Field>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-neutral-900">Delivery Settings</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Minimum order for FREE delivery (₹)">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={settings.freeDeliveryThreshold}
              onChange={e => setSettings(s => ({ ...s, freeDeliveryThreshold: Number(e.target.value) }))}
            />
          </Field>
          <Field label="Delivery charges (₹) if below minimum">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={settings.deliveryCharges}
              onChange={e => setSettings(s => ({ ...s, deliveryCharges: Number(e.target.value) }))}
            />
          </Field>
        </div>
        <p className="text-xs text-neutral-500">
          💡 Example: Set minimum to ₹999 and delivery charges to ₹50. Orders below ₹999 will have ₹50 added to their total.
        </p>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="h-11 px-8 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
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
