'use client';

import { brands, products } from '@/lib/mock/products';

export default function AdminBrandsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-sm text-neutral-500">{brands.length} brands in catalog</p>
        </div>
        <button className="px-4 h-10 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
          + Add Brand
        </button>
      </div>

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
                  <p className="font-semibold text-sm">{brand.name}</p>
                  <p className="text-xs text-neutral-500">/{brand.slug}</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-3">{brand.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-neutral-500">{count} products</span>
                <button className="text-xs text-primary-600 hover:underline">Edit</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
