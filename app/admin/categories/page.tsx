'use client';

import { useState } from 'react';
import { categoryTree, products, CategoryNode } from '@/lib/mock/products';

export default function AdminCategoriesPage() {
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (id: string) =>
    setExpanded(x => (x.includes(id) ? x.filter(i => i !== id) : [...x, id]));

  const countProducts = (node: CategoryNode) =>
    products.filter(p => p.categorySlug === node.slug).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-neutral-500">Hierarchical category tree · {categoryTree.length} top-level</p>
        </div>
        <button className="px-4 h-10 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
          + Add Category
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-200">
        {categoryTree.map(cat => (
          <div key={cat.id}>
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => toggle(cat.id)}
                className="w-6 h-6 grid place-items-center rounded hover:bg-neutral-100 text-neutral-500"
                aria-label="Expand category"
              >
                {cat.children?.length ? (expanded.includes(cat.id) ? '▾' : '▸') : '·'}
              </button>
              <span className="text-lg">{cat.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-neutral-500">/{cat.slug}</p>
              </div>
              <span className="text-xs text-neutral-500">{countProducts(cat)} products</span>
              <span className="text-xs text-neutral-500">{cat.children?.length ?? 0} subcategories</span>
              <button className="text-xs text-primary-600 hover:underline">Edit</button>
            </div>
            {expanded.includes(cat.id) &&
              cat.children?.map(sub => (
                <div key={sub.id} className="flex items-center gap-3 pl-16 pr-4 py-2 bg-neutral-50 border-t border-neutral-200">
                  <span>{sub.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm">{sub.name}</p>
                    <p className="text-xs text-neutral-500">/{sub.slug}</p>
                  </div>
                  <button className="text-xs text-primary-600 hover:underline">Edit</button>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
