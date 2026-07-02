'use client';

import { useCallback, useEffect, useState } from 'react';
import { CategoryNode, Product } from '@/lib/mock/products';
import { getCategories, getProducts } from '@/lib/data/catalog';
import { adminMutate } from '@/lib/api/admin-client';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📦');
  const [subDrafts, setSubDrafts] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    setLoading(true);
    const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
    setCategories(cats);
    setProducts(prods);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const countProducts = (node: CategoryNode) =>
    products.filter(p => p.categorySlug === node.slug).length;

  const toggle = (id: string) =>
    setExpanded(x => (x.includes(id) ? x.filter(i => i !== id) : [...x, id]));

  const addTopLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setError('');
    try {
      await adminMutate('/api/admin/categories', 'POST', {
        id: `cat-${Date.now()}`,
        name,
        slug: slugify(name),
        icon: newIcon || '📦',
        children: [],
      });
      setNewName('');
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
    }
  };

  const addSub = async (parent: CategoryNode) => {
    const name = subDrafts[parent.id]?.trim();
    if (!name) return;
    setError('');
    try {
      await adminMutate('/api/admin/categories', 'POST', {
        ...parent,
        children: [
          ...(parent.children ?? []),
          { id: `sub-${Date.now()}`, name, slug: slugify(name), icon: '·' },
        ],
      });
      setSubDrafts(d => ({ ...d, [parent.id]: '' }));
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add subcategory');
    }
  };

  const rename = async (parent: CategoryNode) => {
    const name = prompt('New category name:', parent.name)?.trim();
    if (!name || name === parent.name) return;
    setError('');
    try {
      await adminMutate('/api/admin/categories', 'POST', { ...parent, name });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rename failed');
    }
  };

  const removeSub = async (parent: CategoryNode, subId: string) => {
    setError('');
    try {
      await adminMutate('/api/admin/categories', 'POST', {
        ...parent,
        children: (parent.children ?? []).filter(c => c.id !== subId),
      });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove subcategory');
    }
  };

  const removeCategory = async (cat: CategoryNode) => {
    if (!confirm(`Delete category "${cat.name}" and its subcategories?`)) return;
    setError('');
    try {
      await adminMutate('/api/admin/categories', 'DELETE', { id: cat.id });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Categories</h1>
        <p className="text-sm text-neutral-500">{categories.length} top-level categories</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={addTopLevel} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Icon (emoji)</label>
          <input
            value={newIcon}
            onChange={e => setNewIcon(e.target.value)}
            className="h-9 w-16 text-center rounded-lg border border-neutral-300 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-neutral-500 mb-1">Category name</label>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Robotics Parts"
            className="w-full h-9 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button type="submit" className="h-9 px-4 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
          + Add Category
        </button>
      </form>

      {loading ? (
        <p className="p-8 text-center text-sm text-neutral-500">Loading categories...</p>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-200">
          {categories.map(cat => (
            <div key={cat.id}>
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggle(cat.id)}
                  className="w-6 h-6 grid place-items-center rounded hover:bg-neutral-100 text-neutral-500"
                  aria-label="Expand category"
                >
                  {expanded.includes(cat.id) ? '▾' : '▸'}
                </button>
                <span className="text-lg">{cat.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{cat.name}</p>
                  <p className="text-xs text-neutral-500">/{cat.slug}</p>
                </div>
                <span className="text-xs text-neutral-500">{countProducts(cat)} products</span>
                <span className="text-xs text-neutral-400">{cat.children?.length ?? 0} subcategories</span>
                <button onClick={() => rename(cat)} className="text-xs text-primary-600 hover:underline font-medium">
                  Rename
                </button>
                <button onClick={() => removeCategory(cat)} className="text-xs text-red-600 hover:underline font-medium">
                  Delete
                </button>
              </div>
              {expanded.includes(cat.id) && (
                <div className="bg-neutral-50 border-t border-neutral-200">
                  {(cat.children ?? []).map(sub => (
                    <div key={sub.id} className="flex items-center gap-3 pl-16 pr-4 py-2 border-b border-neutral-200/60 last:border-0">
                      <span>{sub.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-800">{sub.name}</p>
                        <p className="text-xs text-neutral-500">/{sub.slug}</p>
                      </div>
                      <button onClick={() => removeSub(cat, sub.id)} className="text-xs text-red-600 hover:underline">
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pl-16 pr-4 py-3">
                    <input
                      value={subDrafts[cat.id] ?? ''}
                      onChange={e => setSubDrafts(d => ({ ...d, [cat.id]: e.target.value }))}
                      placeholder="New subcategory name..."
                      className="flex-1 h-8 rounded-lg border border-neutral-300 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={() => addSub(cat)}
                      className="h-8 px-3 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-700"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
