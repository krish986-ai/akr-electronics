'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/lib/mock/products';
import { getProducts } from '@/lib/data/catalog';
import { safeImageSrc } from '@/lib/utils/image';

const MIN_COMPARE = 2;
const MAX_COMPARE = 10;

function ComparePageInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const initial = useMemo(() => {
    const fromQuery = searchParams.get('add');
    return fromQuery ? [fromQuery] : [];
  }, [searchParams]);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => undefined);
  }, []);

  const [selectedIds, setSelectedIds] = useState<string[]>(initial);
  const selected = selectedIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const specKeys = Array.from(new Set(selected.flatMap(p => Object.keys(p.specifications))));

  const atMax = selectedIds.length >= MAX_COMPARE;

  const add = (id: string) => {
    setSelectedIds(ids => (ids.includes(id) || ids.length >= MAX_COMPARE ? ids : [...ids, id]));
  };

  const remove = (id: string) => {
    setSelectedIds(ids => ids.filter(x => x !== id));
  };

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(p => !selectedIds.includes(p.id))
      .filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, products, selectedIds]);

  useEffect(() => {
    if (!searchOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [searchOpen]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-neutral-900">⇄ Compare Products</h1>
      <p className="text-sm text-neutral-500 mt-2 mb-6">
        Search and select {MIN_COMPARE}–{MAX_COMPARE} products to compare side by side.
      </p>

      <div ref={searchRef} className="relative max-w-md mb-4">
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          disabled={atMax}
          placeholder={atMax ? `Maximum ${MAX_COMPARE} products selected` : 'Search products to compare...'}
          className="w-full h-10 rounded-lg bg-white border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-400"
        />
        {searchOpen && query.trim() !== '' && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="p-3 text-sm text-neutral-400">No matching products</p>
            ) : (
              searchResults.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    add(p.id);
                    setQuery('');
                    setSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50"
                >
                  <Image
                    src={safeImageSrc(p.image)}
                    alt={p.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-cover rounded-md shrink-0"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-neutral-900 truncate">{p.name}</span>
                    <span className="block text-xs text-neutral-400">{p.brand}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {selected.map(p => (
          <span
            key={p.id}
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-medium bg-primary-600 text-white"
          >
            {p.name}
            <button
              onClick={() => remove(p.id)}
              aria-label={`Remove ${p.name} from comparison`}
              className="w-4 h-4 grid place-items-center rounded-full hover:bg-primary-700"
            >
              ×
            </button>
          </span>
        ))}
        {selected.length === 0 && (
          <p className="text-sm text-neutral-400">No products selected yet — search above to add some.</p>
        )}
      </div>

      {selected.length < MIN_COMPARE ? (
        <div className="text-center py-16 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
          <p className="text-neutral-500 text-sm">Pick at least {MIN_COMPARE} products above to start comparing.</p>
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
                    <Image
                      src={safeImageSrc(p.image)}
                      alt={p.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg mx-auto"
                    />
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
