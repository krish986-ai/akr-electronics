'use client';

import { useState } from 'react';
import {
  productReviews as seedReviews,
  productQuestions as seedQuestions,
  products,
  ProductReview,
  ProductQuestion,
} from '@/lib/mock/products';

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<'reviews' | 'questions'>('reviews');
  const [reviews, setReviews] = useState<ProductReview[]>(seedReviews);
  const [questions, setQuestions] = useState<ProductQuestion[]>(seedQuestions);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});

  const productName = (id: string) => products.find(p => p.id === id)?.name ?? `Product #${id}`;

  const setStatus = (id: string, status: ProductReview['status']) =>
    setReviews(rs => rs.map(r => (r.id === id ? { ...r, status } : r)));

  const saveAnswer = (id: string) => {
    const draft = answerDrafts[id]?.trim();
    if (!draft) return;
    setQuestions(qs => qs.map(q => (q.id === id ? { ...q, answer: draft } : q)));
  };

  const pendingCount = reviews.filter(r => r.status === 'PENDING').length;
  const unansweredCount = questions.filter(q => !q.answer).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Reviews & QnA</h1>
      <p className="text-sm text-neutral-400 mb-6">
        {pendingCount} reviews pending · {unansweredCount} questions unanswered
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('reviews')}
          className={`px-4 h-9 rounded-lg text-sm font-medium ${
            tab === 'reviews' ? 'bg-primary-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setTab('questions')}
          className={`px-4 h-9 rounded-lg text-sm font-medium ${
            tab === 'questions' ? 'bg-primary-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          Questions ({questions.length})
        </button>
      </div>

      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs text-neutral-500">{productName(r.productId)}</p>
                  <p className="text-sm font-semibold mt-0.5">
                    <span className="text-amber-400">{'★'.repeat(r.rating)}</span> {r.title}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    r.status === 'APPROVED'
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : r.status === 'PENDING'
                        ? 'bg-amber-600/20 text-amber-400'
                        : 'bg-red-600/20 text-red-400'
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <p className="text-sm text-neutral-300 mt-2">{r.body}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {r.author} · {r.date}
              </p>
              {r.status === 'PENDING' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setStatus(r.id, 'APPROVED')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => setStatus(r.id, 'REJECTED')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-600/80 text-white font-medium hover:bg-red-500"
                  >
                    ✗ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'questions' && (
        <div className="space-y-3">
          {questions.map(q => (
            <div key={q.id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
              <p className="text-xs text-neutral-500">{productName(q.productId)}</p>
              <p className="text-sm font-medium mt-1">Q: {q.question}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {q.author} · {q.date}
              </p>
              {q.answer ? (
                <p className="text-sm text-emerald-400 mt-2">A: {q.answer}</p>
              ) : (
                <div className="flex gap-2 mt-3">
                  <input
                    value={answerDrafts[q.id] ?? ''}
                    onChange={e => setAnswerDrafts(d => ({ ...d, [q.id]: e.target.value }))}
                    placeholder="Write an answer..."
                    className="flex-1 h-9 rounded-lg bg-neutral-900 border border-neutral-700 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={() => saveAnswer(q.id)}
                    className="text-xs px-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-500"
                  >
                    Publish Answer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
