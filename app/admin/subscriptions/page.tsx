'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminFetch, adminMutate } from '@/lib/api/admin-client';

interface Subscriber {
  email: string;
  active: boolean;
  subscribedAt: string | null;
}

interface SendResult {
  sent: number;
  failed: number;
  total: number;
}

export default function AdminSubscriptionsPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [audience, setAudience] = useState<'all' | 'selected'>('all');

  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await adminFetch('/api/admin/subscriptions');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load subscribers');
      setSubscribers(data.subscribers ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const activeSubscribers = useMemo(() => subscribers.filter(s => s.active), [subscribers]);

  const toggleOne = (email: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(prev =>
      prev.size === activeSubscribers.length ? new Set() : new Set(activeSubscribers.map(s => s.email))
    );
  };

  const handleSend = async () => {
    setSendError('');
    setSendResult(null);
    if (!subject.trim() || !message.trim()) {
      setSendError('Subject and message are required');
      return;
    }
    if (audience === 'selected' && selected.size === 0) {
      setSendError('Select at least one subscriber, or switch to "All subscribers"');
      return;
    }
    setSending(true);
    try {
      const result = await adminMutate<SendResult>('/api/admin/subscriptions/send', 'POST', {
        subject: subject.trim(),
        message: message.trim(),
        from: from.trim() || undefined,
        recipients: audience === 'all' ? 'all' : Array.from(selected),
      });
      setSendResult(result);
      setSubject('');
      setMessage('');
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-neutral-900">Subscriptions</h1>
      <p className="text-sm text-neutral-500 mb-6">
        {activeSubscribers.length} active of {subscribers.length} total newsletter subscribers
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900 text-sm">Subscribers</h2>
            <button
              onClick={toggleAll}
              disabled={activeSubscribers.length === 0}
              className="text-xs font-medium text-primary-600 hover:underline disabled:opacity-50"
            >
              {selected.size === activeSubscribers.length && activeSubscribers.length > 0
                ? 'Deselect all'
                : 'Select all'}
            </button>
          </div>
          {loading ? (
            <p className="p-6 text-center text-sm text-neutral-500">Loading subscribers...</p>
          ) : loadError ? (
            <p className="p-6 text-center text-sm text-red-600">{loadError}</p>
          ) : activeSubscribers.length === 0 ? (
            <p className="p-6 text-center text-sm text-neutral-500">No subscribers yet</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto divide-y divide-neutral-100">
              {activeSubscribers.map(s => (
                <li key={s.email} className="flex items-center gap-3 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(s.email)}
                    onChange={() => toggleOne(s.email)}
                    className="w-4 h-4 rounded border-neutral-300"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-neutral-900 truncate">{s.email}</p>
                    {s.subscribedAt && (
                      <p className="text-xs text-neutral-400">
                        Subscribed {new Date(s.subscribedAt).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4 h-fit">
          <h2 className="font-semibold text-neutral-900 text-sm">Compose broadcast</h2>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">Send to</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAudience('all')}
                className={`flex-1 h-9 rounded-lg text-sm font-medium border ${
                  audience === 'all'
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'border-neutral-300 text-neutral-600'
                }`}
              >
                All subscribers ({activeSubscribers.length})
              </button>
              <button
                onClick={() => setAudience('selected')}
                className={`flex-1 h-9 rounded-lg text-sm font-medium border ${
                  audience === 'selected'
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'border-neutral-300 text-neutral-600'
                }`}
              >
                Selected only ({selected.size})
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">From (optional)</label>
            <input
              type="email"
              value={from}
              onChange={e => setFrom(e.target.value)}
              placeholder="news@akrelectronics.com"
              className="h-9 w-full rounded-lg bg-white border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-neutral-400 mt-1">
              Leave blank to use the default sender address. Must be on a domain verified with Resend.
            </p>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="New Arduino kits are live"
              className="h-9 w-full rounded-lg bg-white border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={6}
              placeholder="Write your update here..."
              className="w-full rounded-lg bg-white border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {sendError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{sendError}</div>
          )}
          {sendResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
              Sent to {sendResult.sent} of {sendResult.total} subscribers
              {sendResult.failed > 0 && ` (${sendResult.failed} failed)`}.
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending}
            className="h-10 px-4 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send broadcast'}
          </button>
        </div>
      </div>
    </div>
  );
}
