'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { products, Product } from '@/lib/mock/products';

const MAX_COMPARE = 4;

function ComparePageInner() {
  const searchParams = useSearchParams();
  const initial = useMemo(() => {
    const fromQuery = searchParams.get('add');
    return fromQuery && products.some(p => p.id === fromQuery) ? [fromQuery] : [];
  }, [searchParams]);

  const [selectedIds, setSelectedIds] = useState<string[]>(initial);
  const selected = selectedIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const specKeys = Array.from(new Set(selected.flatMap(p => Object.keys(p.specifications))));

  const toggle = (id: string) => {
    setSelectedIds(ids =>
      ids.includes(id) ? ids.filter(x => x !== id) : ids.length < MAX_COMPARE ? [...ids, id] : ids
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-neutral-900">⇄ Compare Products</h1>
      <p className="text-sm text-neutral-500 mt-2 mb-6">
        Select up to {MAX_COMPARE} products to compare side by side.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {products.map(p => (
          <button
            key={p.id}
            onClick={() => toggle(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              selectedIds.includes(p.id)
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {selected.length < 2 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
          <p className="text-neutral-500 text-sm">Pick at least 2 products above to start comparing.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-neutral-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-neutral-50">
                <th className="text-left p-3 font-medium text-neutral-500 w-40">Product</th>
                {selected.map(p => (
                  <th key={p.id} className="p-3 min-w-[180px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="w-20 h-20 object-cover rounded-lg mx-auto" />
                    <Link
                      href={`/products/${p.id}`}
                      className="block mt-2 font-semibold text-neutral-900 hover:text-primary-600"
                    >
                      {p.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Price">
                {selected.map(p => (
                  <td key={p.id} className="p-3 text-center font-bold">
                    ₹{p.price.toLocaleString('en-IN')}
                    <span className="block text-[10px] font-normal text-neutral-400">Incl. GST</span>
                  </td>
                ))}
              </CompareRow>
              <CompareRow label="Brand">
                {selected.map(p => (
                  <td key={p.id} className="p-3 text-center">{p.brand}</td>
                ))}
              </CompareRow>
              <CompareRow label="Rating">
                {selected.map(p => (
                  <td key={p.id} className="p-3 text-center">
                    ★ {p.rating} ({p.reviews})
                  </td>
                ))}
              </CompareRow>
              <CompareRow label="Availability">
                {selected.map(p => (
                  <td key={p.id} className={`p-3 text-center font-medium ${p.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </td>
                ))}
              </CompareRow>
              <CompareRow label="Warranty">
                {selected.map(p => (
                  <td key={p.id} className="p-3 text-center">{p.warranty.days} days</td>
                ))}
              </CompareRow>
              {specKeys.map(key => (
                <CompareRow key={key} label={key}>
                  {selected.map(p => (
                    <td key={p.id} className="p-3 text-center text-neutral-600">
                      {p.specifications[key] ?? '—'}
                    </td>
                  ))}
                </CompareRow>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-neutral-100 odd:bg-neutral-50/50">
      <td className="p-3 font-medium text-neutral-700">{label}</td>
      {children}
    </tr>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <ComparePageInner />
    </Suspense>
  );
}
