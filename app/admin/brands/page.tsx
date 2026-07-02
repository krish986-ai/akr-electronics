'use client';

import { useCallback, useEffect, useState } from 'react';
import { Brand, Product } from '@/lib/mock/products';
import { getBrands, getProducts } from '@/lib/data/catalog';
import { adminMutate } from '@/lib/api/admin-client';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });

  const reload = useCallback(async () => {
    setLoading(true);
    const [b, p] = await Promise.all([getBrands(), getProducts()]);
    setBrands(b);
    setProducts(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    setError('');
    try {
      await adminMutate('/api/admin/brands', 'POST', {
        id: `brand-${Date.now()}`,
        name,
        slug: slugify(name),
        description: form.description.trim(),
      });
      setForm({ name: '', description: '' });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add brand');
    }
  };

  const rename = async (brand: Brand) => {
    const name = prompt('New brand name:', brand.name)?.trim();
    if (!name || name === brand.name) return;
    setError('');
    try {
      await adminMutate('/api/admin/brands', 'POST', { ...brand, name });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rename failed');
    }
  };

  const remove = async (brand: Brand) => {
    if (!confirm(`Delete brand "${brand.name}"?`)) return;
    setError('');
    try {
      await adminMutate('/api/admin/brands', 'DELETE', { id: brand.id });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Brands</h1>
        <p className="text-sm text-neutral-500">{brands.length} brands in catalog</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={addBrand} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-end gap-3 flex-wrap">
        <div className="min-w-[160px]">
          <label className="block text-xs text-neutral-500 mb-1">Brand name</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Seeed Studio"
            className="w-full h-9 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs text-neutral-500 mb-1">Description</label>
          <input
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Short description"
            className="w-full h-9 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button type="submit" className="h-9 px-4 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
          + Add Brand
        </button>
      </form>

      {loading ? (
        <p className="p-8 text-center text-sm text-neutral-500">Loading brands...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map(brand => {
            const count = products.filter(p => p.brandSlug === brand.slug).length;
            return (
              <div key={brand.id} className="bg-white border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-neutral-100 grid place-items-center font-bold text-primary-600">
                    {brand.name[0]}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-neutral-900">{brand.name}</p>
                    <p className="text-xs text-neutral-500">/{brand.slug}</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-3 min-h-[32px]">{brand.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-neutral-500">{count} products</span>
                  <div className="flex gap-3">
                    <button onClick={() => rename(brand)} className="text-xs text-primary-600 hover:underline font-medium">
                      Rename
                    </button>
                    <button onClick={() => remove(brand)} className="text-xs text-red-600 hover:underline font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
