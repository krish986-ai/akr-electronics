'use client';

import { useState } from 'react';
import Link from 'next/link';
import { adminMutate } from '@/lib/api/admin-client';
import { CreatorGuard } from '@/components/admin/CreatorGuard';

function CreatorPanelContent() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async () => {
    setError('');
    setSuccess(false);

    if (!currentPassword) {
      setError('Enter current password');
      return;
    }
    if (!newPassword) {
      setError('Enter new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await adminMutate('/api/admin/creator/password', 'PUT', {
        currentPassword,
        newPassword,
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Creator Panel</h1>
        <p className="text-sm text-neutral-500">Manage creator-only settings, security, and partnerships</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/admin/creator/partnerships"
          className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          <p className="text-2xl mb-2">🤝</p>
          <p className="font-semibold text-neutral-900">Partnerships</p>
          <p className="text-xs text-neutral-500 mt-1">Manage partnerships and promotions</p>
        </Link>
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <p className="text-2xl mb-2">🔐</p>
          <p className="font-semibold text-neutral-900">Security</p>
          <p className="text-xs text-neutral-500 mt-1">Change payment settings password</p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          ✓ Password changed successfully
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-neutral-900">Payment Settings Password</h2>
        <p className="text-sm text-neutral-500">
          This password is required to change payment QR code and perform other sensitive payment operations.
        </p>

        <div className="space-y-3">
          <Field label="Current Password">
            <input
              type="password"
              className={inputCls}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </Field>

          <Field label="New Password">
            <input
              type="password"
              className={inputCls}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </Field>

          <Field label="Confirm New Password">
            <input
              type="password"
              className={inputCls}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </Field>
        </div>

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="h-11 px-8 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
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

export default function CreatorPanelPage() {
  return (
    <CreatorGuard>
      <CreatorPanelContent />
    </CreatorGuard>
  );
}
