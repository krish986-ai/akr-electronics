'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProductReview, ProductQuestion, Product } from '@/lib/mock/products';
import { getProducts, getReviews, getQuestions } from '@/lib/data/catalog';
import { adminMutate } from '@/lib/api/admin-client';

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<'reviews' | 'questions'>('reviews');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    setLoading(true);
    const [r, q, p] = await Promise.all([getReviews(), getQuestions(), getProducts()]);
    setReviews(r);
    setQuestions(q);
    setProducts(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const productName = (id: string) => products.find(p => p.id === id)?.name ?? `Product #${id}`;

  const setStatus = async (id: string, status: ProductReview['status']) => {
    setError('');
    try {
      await adminMutate('/api/admin/moderation', 'PATCH', { kind: 'review-status', id, status });
      setReviews(rs => rs.map(r => (r.id === id ? { ...r, status } : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const saveAnswer = async (id: string) => {
    const draft = answerDrafts[id]?.trim();
    if (!draft) return;
    setError('');
    try {
      await adminMutate('/api/admin/moderation', 'PATCH', { kind: 'question-answer', id, answer: draft });
      setQuestions(qs => qs.map(q => (q.id === id ? { ...q, answer: draft } : q)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const pendingCount = reviews.filter(r => r.status === 'PENDING').length;
  const unansweredCount = questions.filter(q => !q.answer).length;

  if (loading) {
    return <p className="p-8 text-center text-sm text-neutral-500">Loading reviews & questions...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-neutral-900">Reviews & QnA</h1>
      <p className="text-sm text-neutral-500 mb-6">
        {pendingCount} reviews pending · {unansweredCount} questions unanswered
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('reviews')}
          className={`px-4 h-9 rounded-lg text-sm font-medium ${
            tab === 'reviews' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setTab('questions')}
          className={`px-4 h-9 rounded-lg text-sm font-medium ${
            tab === 'questions' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Questions ({questions.length})
        </button>
      </div>

      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-neutral-200 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs text-neutral-500">{productName(r.productId)}</p>
                  <p className="text-sm font-semibold mt-0.5">
                    <span className="text-amber-500">{'★'.repeat(r.rating)}</span> {r.title}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    r.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : r.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <p className="text-sm text-neutral-700 mt-2">{r.body}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {r.author} · {r.date}
              </p>
              <div className="flex gap-2 mt-3">
                {r.status !== 'APPROVED' && (
                  <button
                    onClick={() => setStatus(r.id, 'APPROVED')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500"
                  >
                    ✓ Approve
                  </button>
                )}
                {r.status !== 'REJECTED' && (
                  <button
                    onClick={() => setStatus(r.id, 'REJECTED')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-600/80 text-white font-medium hover:bg-red-500"
                  >
                    ✗ Reject
                  </button>
                )}
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-sm text-neutral-500">No reviews yet.</p>}
        </div>
      )}

      {tab === 'questions' && (
        <div className="space-y-3">
          {questions.map(q => (
            <div key={q.id} className="bg-white border border-neutral-200 rounded-xl p-4">
              <p className="text-xs text-neutral-500">{productName(q.productId)}</p>
              <p className="text-sm font-medium mt-1">Q: {q.question}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {q.author} · {q.date}
              </p>
              {q.answer ? (
                <p className="text-sm text-emerald-700 mt-2">A: {q.answer}</p>
              ) : (
                <div className="flex gap-2 mt-3">
                  <input
                    value={answerDrafts[q.id] ?? ''}
                    onChange={e => setAnswerDrafts(d => ({ ...d, [q.id]: e.target.value }))}
                    placeholder="Write an answer..."
                    className="flex-1 h-9 rounded-lg bg-white border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={() => saveAnswer(q.id)}
                    className="text-xs px-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
                  >
                    Publish Answer
                  </button>
                </div>
              )}
            </div>
          ))}
          {questions.length === 0 && <p className="text-sm text-neutral-500">No questions yet.</p>}
        </div>
      )}
    </div>
  );
}
