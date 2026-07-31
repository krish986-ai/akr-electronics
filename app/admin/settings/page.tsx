'use client';

import { useEffect, useState } from 'react';
import { StoreConfig, defaultStoreConfig, WarrantyPolicy, defaultWarrantyPolicy } from '@/lib/mock/products';
import { adminFetch, adminMutate } from '@/lib/api/admin-client';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreConfig>(defaultStoreConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [warranty, setWarranty] = useState<WarrantyPolicy>(defaultWarrantyPolicy);
  const [warrantyLoading, setWarrantyLoading] = useState(true);
  const [warrantySaving, setWarrantySaving] = useState(false);
  const [warrantyError, setWarrantyError] = useState('');
  const [warrantySaved, setWarrantySaved] = useState('');

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
    (async () => {
      try {
        const res = await adminFetch('/api/admin/warranty-settings');
        const data = await res.json();
        if (res.ok) setWarranty(data);
      } catch {
        // keep defaults
      } finally {
        setWarrantyLoading(false);
      }
    })();
  }, []);

  const saveWarranty = async () => {
    setWarrantySaving(true);
    setWarrantyError('');
    setWarrantySaved('');
    try {
      await adminMutate('/api/admin/warranty-settings', 'PUT', warranty);
      setWarrantySaved('✓ Warranty policy saved — applies to every product store-wide');
      setTimeout(() => setWarrantySaved(''), 3000);
    } catch (e) {
      setWarrantyError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setWarrantySaving(false);
    }
  };

  const resetWarranty = async () => {
    if (!confirm('Reset the warranty policy to the original default text? This affects every product.')) return;
    setWarrantySaving(true);
    setWarrantyError('');
    setWarrantySaved('');
    try {
      await adminMutate('/api/admin/warranty-settings', 'DELETE');
      setWarranty(defaultWarrantyPolicy);
      setWarrantySaved('✓ Reset to the default warranty policy');
      setTimeout(() => setWarrantySaved(''), 3000);
    } catch (e) {
      setWarrantyError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setWarrantySaving(false);
    }
  };

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

  if (loading || warrantyLoading) {
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

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          💡 Minimum order for free delivery and the small order charge are configured on the{' '}
          <a href="/admin/payments" className="font-semibold underline">Payments</a> page, under
          Delivery &amp; Order Settings.
        </p>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="h-11 px-8 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-neutral-900">Warranty Policy</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Applies to every product store-wide. Only the number of warranty days stays per-product — set that on
            each product's own editor.
          </p>
        </div>

        {warrantySaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
            {warrantySaved}
          </div>
        )}
        {warrantyError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{warrantyError}</div>
        )}

        <Field label="Warranty summary (shown on every product's Warranty tab)">
          <textarea
            rows={3}
            className={inputCls}
            value={warranty.summary}
            onChange={e => setWarranty(w => ({ ...w, summary: e.target.value }))}
          />
        </Field>
        <Field label="What voids the warranty">
          <textarea
            rows={3}
            className={inputCls}
            value={warranty.voidsIf}
            onChange={e => setWarranty(w => ({ ...w, voidsIf: e.target.value }))}
          />
        </Field>

        <div className="flex gap-3">
          <button
            onClick={saveWarranty}
            disabled={warrantySaving}
            className="h-11 px-8 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {warrantySaving ? 'Saving...' : 'Save Warranty Policy'}
          </button>
          <button
            onClick={resetWarranty}
            disabled={warrantySaving}
            className="h-11 px-5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 disabled:opacity-50"
          >
            Reset to Default
          </button>
        </div>
      </div>
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
