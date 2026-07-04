'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch, adminMutate } from '@/lib/api/admin-client';
import { OrderSettingsPanel } from '@/components/admin/OrderSettingsPanel';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { PaymentSettings, defaultPaymentSettings } from '@/lib/payments/settings';
import { PlacedOrder } from '@/lib/stores/orders';

interface PendingOrder extends PlacedOrder {
  id: string;
  archived?: boolean;
}

interface AdminPaymentSettings extends PaymentSettings {
  razorpayKeyConfigured?: boolean;
}

export default function AdminPaymentsPage() {
  const [error, setError] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Payments</h1>
        <p className="text-sm text-neutral-500">
          Control every payment method, verify QR payments, and tune delivery charges
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <PendingQrPanel onError={setError} />
      <PaymentMethodsPanel onError={setError} />
      <OrderSettingsPanel onError={setError} />
    </div>
  );
}

function PaymentMethodsPanel({ onError }: { onError: (message: string) => void }) {
  const [settings, setSettings] = useState<AdminPaymentSettings>(defaultPaymentSettings);
  const [savedImage, setSavedImage] = useState('');
  const [qrPassword, setQrPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch('/api/admin/payment-settings');
        const data = await res.json();
        if (res.ok) {
          setSettings(data);
          setSavedImage(data.qrImage ?? '');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const qrChanged = settings.qrImage !== savedImage;

  const save = async () => {
    if (qrChanged && !qrPassword) {
      onError('Enter the QR change password to update the payment QR');
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      await adminMutate('/api/admin/payment-settings', 'PUT', {
        razorpayEnabled: settings.razorpayEnabled,
        qrEnabled: settings.qrEnabled,
        qrImage: settings.qrImage,
        qrUpiName: settings.qrUpiName,
        ...(qrChanged ? { qrPassword } : {}),
      });
      setSavedImage(settings.qrImage);
      setQrPassword('');
      setSaved(true);
      onError('');
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="p-8 text-center text-sm text-neutral-500 bg-white rounded-xl border border-neutral-200">
        Loading payment settings...
      </p>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <h2 className="font-semibold text-neutral-900">Payment Methods</h2>
          <p className="text-xs text-neutral-500">
            Cash on Delivery is controlled in Delivery &amp; Order Settings below
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs font-medium text-emerald-600">✓ Saved</span>}
          <button
            onClick={save}
            disabled={saving}
            className="h-9 px-4 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Payment Settings'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="border border-neutral-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-900">💳 Razorpay (Online Payments)</p>
              <p className="text-[11px] text-neutral-500">UPI, cards and netbanking — instant confirmation</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, razorpayEnabled: !prev.razorpayEnabled }))}
              className={`h-9 px-4 rounded-lg text-sm font-semibold border transition-colors ${
                settings.razorpayEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-500'
              }`}
            >
              {settings.razorpayEnabled ? '● Accepting' : '○ Not accepting'}
            </button>
          </div>
          <p
            className={`text-xs rounded-lg p-2.5 border ${
              settings.razorpayKeyConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            {settings.razorpayKeyConfigured
              ? '✓ Razorpay API keys are configured. Swap the test keys for live keys in the environment variables (NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) when going live.'
              : '⚠ Razorpay keys are missing. Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the environment (Vercel dashboard for production), then redeploy.'}
          </p>
        </div>

        <div className="border border-neutral-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-900">📱 Direct UPI QR</p>
              <p className="text-[11px] text-neutral-500">
                Customer scans, pays manually, submits the 12-digit UTR — you verify below
              </p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, qrEnabled: !prev.qrEnabled }))}
              className={`h-9 px-4 rounded-lg text-sm font-semibold border transition-colors ${
                settings.qrEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-500'
              }`}
            >
              {settings.qrEnabled ? '● Accepting' : '○ Not accepting'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">UPI display name</label>
            <input
              value={settings.qrUpiName}
              onChange={e => setSettings(prev => ({ ...prev, qrUpiName: e.target.value }))}
              placeholder="Name customers see, e.g. AKR Electronics"
              className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Payment QR code</label>
            <ImageUploadField
              value={settings.qrImage}
              onChange={url => setSettings(prev => ({ ...prev, qrImage: url }))}
              category="website"
              onError={onError}
            />
          </div>

          {qrChanged && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <label className="block text-xs font-semibold text-red-700 mb-1">
                🔒 QR change password required
              </label>
              <input
                type="password"
                value={qrPassword}
                onChange={e => setQrPassword(e.target.value)}
                placeholder="Enter the QR change password"
                className="w-full h-10 rounded-lg border border-red-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <p className="text-[11px] text-red-600 mt-1">
                Changing the payment QR needs the special password. Without it the save will be rejected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PendingQrPanel({ onError }: { onError: (message: string) => void }) {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');

  const reload = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load orders');
      setOrders(data.orders.filter((o: PendingOrder) => o.status === 'PENDING' && !o.archived));
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const act = async (order: PendingOrder, action: 'confirm' | 'reject') => {
    const message =
      action === 'confirm'
        ? `Confirm payment for ${order.orderNumber}? The order will move to the Orders section.`
        : `Reject payment for ${order.orderNumber}? The order will be cancelled and stock restored.`;
    if (!window.confirm(message)) return;
    setWorkingId(order.id);
    try {
      await adminMutate(
        '/api/admin/orders',
        'PATCH',
        action === 'confirm' ? { id: order.id, status: 'CONFIRMED' } : { id: order.id, reject: true }
      );
      setOrders(prev => prev.filter(o => o.id !== order.id));
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to update payment');
    } finally {
      setWorkingId('');
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-neutral-900">
          ⏳ Pending QR Payment Verifications
          {orders.length > 0 && (
            <span className="ml-2 text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          )}
        </h2>
        <p className="text-xs text-neutral-500">
          Match the payer name and 12-digit UTR against your UPI app, then confirm or reject
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500 py-4 text-center">Loading pending payments...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-neutral-500 py-4 text-center">
          No QR payments waiting for verification ✓
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="border border-orange-200 bg-orange-50/40 rounded-xl p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="min-w-[130px]">
                  <p className="font-mono font-semibold text-sm text-neutral-900">{order.orderNumber}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(order.placedAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <p className="text-sm font-medium text-neutral-900">{order.address.name}</p>
                  <p className="text-xs text-neutral-500">{order.address.email} · {order.address.phone}</p>
                </div>
                <div className="min-w-[170px]">
                  <p className="text-xs text-neutral-500">
                    Payer (UPI name):{' '}
                    <span className="font-semibold text-neutral-900">{order.qrPayerName ?? '—'}</span>
                  </p>
                  <p className="text-xs text-neutral-500">
                    UTR: <span className="font-mono font-semibold text-neutral-900">{order.qrTransactionId ?? '—'}</span>
                  </p>
                </div>
                <p className="font-bold text-neutral-900">₹{order.total.toLocaleString('en-IN')}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => act(order, 'confirm')}
                    disabled={workingId === order.id}
                    className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    ✓ Confirm Payment
                  </button>
                  <button
                    onClick={() => act(order, 'reject')}
                    disabled={workingId === order.id}
                    className="h-9 px-4 rounded-lg border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                {order.items.map(i => `${i.quantity} × ${i.name}`).join(' · ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
