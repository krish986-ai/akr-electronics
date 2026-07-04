'use client';

import { useEffect, useState } from 'react';
import { adminFetch, adminMutate } from '@/lib/api/admin-client';
import { OrderSettings, defaultOrderSettings } from '@/lib/orders/settings';

export function OrderSettingsPanel({ onError }: { onError: (message: string) => void }) {
  const [settings, setSettings] = useState<OrderSettings>(defaultOrderSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch('/api/admin/order-settings');
        const data = await res.json();
        if (res.ok) setSettings(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setAmount = (key: keyof OrderSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Number(e.target.value) || 0);
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await adminMutate('/api/admin/order-settings', 'PUT', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to save order settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <h2 className="font-semibold text-neutral-900">Delivery &amp; Order Settings</h2>
          <p className="text-xs text-neutral-500">
            Applied instantly at checkout for all customers
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs font-medium text-emerald-600">✓ Saved</span>}
          <button
            onClick={save}
            disabled={saving || loading}
            className="h-9 px-4 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading settings...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Minimum order amount (₹)
            </label>
            <input
              type="number"
              min={0}
              value={settings.minOrderAmount}
              onChange={setAmount('minOrderAmount')}
              className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Orders below this get the small order charge
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Small order delivery charge (₹)
            </label>
            <input
              type="number"
              min={0}
              value={settings.lowOrderCharge}
              onChange={setAmount('lowOrderCharge')}
              className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Extra delivery charge for orders below the minimum
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Fast delivery charge (₹)
            </label>
            <input
              type="number"
              min={0}
              value={settings.fastDeliveryCharge}
              onChange={setAmount('fastDeliveryCharge')}
              disabled={!settings.fastDeliveryEnabled}
              className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-400"
            />
            <p className="text-[11px] text-neutral-500 mt-1">Charge for 1-2 day delivery</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Fast delivery orders
            </label>
            <button
              onClick={() =>
                setSettings(prev => ({ ...prev, fastDeliveryEnabled: !prev.fastDeliveryEnabled }))
              }
              className={`h-10 w-full rounded-lg text-sm font-semibold border transition-colors ${
                settings.fastDeliveryEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-500'
              }`}
            >
              {settings.fastDeliveryEnabled ? '● Accepting' : '○ Not accepting'}
            </button>
            <p className="text-[11px] text-neutral-500 mt-1">
              Turn off to hide fast delivery at checkout
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Cash on Delivery
            </label>
            <button
              onClick={() => setSettings(prev => ({ ...prev, codEnabled: !prev.codEnabled }))}
              className={`h-10 w-full rounded-lg text-sm font-semibold border transition-colors ${
                settings.codEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-500'
              }`}
            >
              {settings.codEnabled ? '● Accepting' : '○ Not accepting'}
            </button>
            <p className="text-[11px] text-neutral-500 mt-1">
              Turn off to stop taking COD orders
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
