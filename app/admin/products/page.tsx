'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { getProducts, resetCatalogCache } from '@/lib/data/catalog';
import { adminFetch, adminMutate } from '@/lib/api/admin-client';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { safeImageSrc } from '@/lib/utils/image';
import { Brand, CategoryNode, Product, categoryTree, brands, GST_RATE_DEFAULT, STANDARD_WARRANTY } from '@/lib/mock/products';

interface EditorState {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  price: string;
  originalPrice: string;
  categorySlug: string;
  brandSlug: string;
  description: string;
  stock: string;
  countryOfOrigin: string;
  warrantyDays: string;
  featuresText: string;
  specsText: string;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
}

const EMPTY_EDITOR: EditorState = {
  name: '',
  slug: '',
  sku: '',
  image: '',
  price: '',
  originalPrice: '',
  categorySlug: '',
  brandSlug: '',
  description: '',
  stock: '0',
  countryOfOrigin: 'India',
  warrantyDays: String(STANDARD_WARRANTY.days),
  featuresText: '',
  specsText: '',
  isNew: false,
  isBestseller: false,
  isFeatured: false,
};

function productToEditor(p: Product): EditorState {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    image: p.image,
    price: String(p.price),
    originalPrice: p.originalPrice ? String(p.originalPrice) : '',
    categorySlug: p.categorySlug,
    brandSlug: p.brandSlug,
    description: p.description,
    stock: String(p.stock),
    countryOfOrigin: p.countryOfOrigin,
    warrantyDays: String(p.warranty?.days ?? STANDARD_WARRANTY.days),
    featuresText: p.features.join('\n'),
    specsText: Object.entries(p.specifications)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n'),
    isNew: Boolean(p.isNew),
    isBestseller: Boolean(p.isBestseller),
    isFeatured: Boolean(p.isFeatured),
  };
}

type ProductCategoryOption = CategoryNode & { parentName?: string };

function productCategoryOptions(categories: CategoryNode[]): ProductCategoryOption[] {
  return categories.flatMap(category => [
    category,
    ...(category.children ?? []).map(child => ({ ...child, parentName: category.name })),
  ]);
}

function editorToPayload(e: EditorState, categories: CategoryNode[], brandsList: Brand[]) {
  const category = productCategoryOptions(categories).find(c => c.slug === e.categorySlug);
  const brand = brandsList.find(b => b.slug === e.brandSlug);
  const specifications: Record<string, string> = {};
  for (const line of e.specsText.split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) specifications[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return {
    name: e.name.trim(),
    slug: e.slug.trim(),
    sku: e.sku.trim(),
    image: e.image.trim(),
    price: Number(e.price),
    originalPrice: e.originalPrice ? Number(e.originalPrice) : undefined,
    gstRate: GST_RATE_DEFAULT,
    category: category?.name ?? e.categorySlug,
    categorySlug: e.categorySlug,
    brand: brand?.name ?? e.brandSlug,
    brandSlug: e.brandSlug,
    description: e.description.trim(),
    specifications,
    features: e.featuresText.split('\n').map(f => f.trim()).filter(Boolean),
    warrantyDays: Number(e.warrantyDays),
    countryOfOrigin: e.countryOfOrigin.trim(),
    stock: Number(e.stock),
    isNew: e.isNew,
    isBestseller: e.isBestseller,
    isFeatured: e.isFeatured,
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>(categoryTree);
  const [brandsList, setBrandsList] = useState<Brand[]>(brands);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    resetCatalogCache();
    const [prods, catalogResponse] = await Promise.all([
      getProducts(),
      adminFetch('/api/admin/catalog', { cache: 'no-store' }),
    ]);
    const catalog = await catalogResponse.json().catch(() => ({}));
    if (!catalogResponse.ok) {
      throw new Error(catalog.error ?? 'Failed to load categories and brands');
    }
    const cats = Array.isArray(catalog.categories) ? (catalog.categories as CategoryNode[]) : [];
    const brs = Array.isArray(catalog.brands) ? (catalog.brands as Brand[]) : [];
    setProducts(prods);
    setCategories(cats.length ? cats : categoryTree);
    setBrandsList(brs.length ? brs : brands);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const categoryOptions = productCategoryOptions(categories);
  const minPrice = filterMinPrice ? Number(filterMinPrice) : undefined;
  const maxPrice = filterMaxPrice ? Number(filterMaxPrice) : undefined;

  const filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || p.categorySlug === filterCategory;
    const matchesBrand = !filterBrand || p.brandSlug === filterBrand;
    const matchesMinPrice = minPrice === undefined || p.price >= minPrice;
    const matchesMaxPrice = maxPrice === undefined || p.price <= maxPrice;
    return matchesSearch && matchesCategory && matchesBrand && matchesMinPrice && matchesMaxPrice;
  });

  const hasActiveFilters = Boolean(search || filterCategory || filterBrand || filterMinPrice || filterMaxPrice);
  const resetFilters = () => {
    setSearch('');
    setFilterCategory('');
    setFilterBrand('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
  };

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const save = async () => {
    if (!editor) return;
    setSaving(true);
    setError('');
    try {
      const payload = editorToPayload(editor, categories, brandsList);
      if (editor.id) {
        await adminMutate(`/api/admin/products/${editor.id}`, 'PUT', payload);
        flash('Product updated ✓');
      } else {
        await adminMutate('/api/admin/products', 'POST', payload);
        flash('Product created ✓');
      }
      setEditor(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await adminMutate(`/api/admin/products/${product.id}`, 'DELETE');
      flash('Product deleted');
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
          <p className="text-sm text-neutral-500">
            {hasActiveFilters ? `${filtered.length} of ${products.length}` : products.length} in catalog · changes go
            live within ~5 min
          </p>
        </div>
        <div className="flex gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or SKU..."
            className="h-10 w-64 rounded-lg border border-neutral-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => {
              setError('');
              setEditor({
                ...EMPTY_EDITOR,
                categorySlug: categoryOptions[0]?.slug ?? categoryTree[0].slug,
                brandSlug: brandsList[0]?.slug ?? brands[0].slug,
              });
            }}
            className="h-10 px-4 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            + New Product
          </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Category</label>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="h-9 w-48 rounded-lg border border-neutral-300 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <optgroup key={c.slug} label={c.name}>
                <option value={c.slug}>{c.name}</option>
                {(c.children ?? []).map(child => (
                  <option key={child.slug} value={child.slug}>
                    ↳ {child.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Brand</label>
          <select
            value={filterBrand}
            onChange={e => setFilterBrand(e.target.value)}
            className="h-9 w-40 rounded-lg border border-neutral-300 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Brands</option>
            {brandsList.map(b => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Min Price ₹</label>
          <input
            type="number"
            value={filterMinPrice}
            onChange={e => setFilterMinPrice(e.target.value)}
            placeholder="0"
            className="h-9 w-24 rounded-lg border border-neutral-300 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Max Price ₹</label>
          <input
            type="number"
            value={filterMaxPrice}
            onChange={e => setFilterMaxPrice(e.target.value)}
            placeholder="Any"
            className="h-9 w-24 rounded-lg border border-neutral-300 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="h-9 px-3 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-50"
          >
            Reset Filters
          </button>
        )}
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          {notice}
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-neutral-500">Loading products...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3">Badges</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <Image src={safeImageSrc(p.image)} alt="" width={40} height={40} className="w-10 h-10 rounded-lg object-cover border border-neutral-200" />
                      <span className="font-medium text-neutral-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">{p.sku}</td>
                  <td className="px-4 py-3 text-neutral-600">{p.category}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className={`px-4 py-3 text-right font-medium ${p.stock < 50 ? 'text-red-600' : 'text-neutral-900'}`}>
                    {p.stock}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.isFeatured && <Chip text="Featured" cls="bg-primary-50 text-primary-700" />}
                      {p.isBestseller && <Chip text="Bestseller" cls="bg-amber-100 text-amber-700" />}
                      {p.isNew && <Chip text="New" cls="bg-emerald-100 text-emerald-700" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setError('');
                        setEditor(productToEditor(p));
                      }}
                      className="text-primary-600 hover:underline text-xs font-medium mr-3"
                    >
                      Edit
                    </button>
                    <button onClick={() => remove(p)} className="text-red-600 hover:underline text-xs font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    No products match your search/filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editor && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-neutral-900">
                {editor.id ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setEditor(null)} className="text-neutral-400 hover:text-neutral-700 text-xl">
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name *">
                <input
                  className={inputCls}
                  value={editor.name}
                  onChange={e =>
                    setEditor({
                      ...editor,
                      name: e.target.value,
                      slug: editor.id ? editor.slug : slugify(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Slug *">
                <input className={inputCls} value={editor.slug} onChange={e => setEditor({ ...editor, slug: e.target.value })} />
              </Field>
              <Field label="SKU *">
                <input className={inputCls} value={editor.sku} onChange={e => setEditor({ ...editor, sku: e.target.value })} placeholder="AKR-XX-0000" />
              </Field>
              <Field label="Image *">
                <ImageUploadField
                  value={editor.image}
                  onChange={url => setEditor(prev => (prev ? { ...prev, image: url } : prev))}
                  category="products"
                  onError={setError}
                />
              </Field>
              <Field label="Price ₹ (incl. GST) *">
                <input type="number" className={inputCls} value={editor.price} onChange={e => setEditor({ ...editor, price: e.target.value })} />
              </Field>
              <Field label="MRP ₹ (optional strike-through)">
                <input type="number" className={inputCls} value={editor.originalPrice} onChange={e => setEditor({ ...editor, originalPrice: e.target.value })} />
              </Field>
              <Field label="Category *">
                <select className={inputCls} value={editor.categorySlug} onChange={e => setEditor({ ...editor, categorySlug: e.target.value })}>
                  {categories.map(c => (
                    <optgroup key={c.slug} label={c.name}>
                      <option value={c.slug}>{c.name}</option>
                      {(c.children ?? []).map(child => (
                        <option key={child.slug} value={child.slug}>
                          ↳ {child.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <Field label="Brand *">
                <select className={inputCls} value={editor.brandSlug} onChange={e => setEditor({ ...editor, brandSlug: e.target.value })}>
                  {brandsList.map(b => (
                    <option key={b.slug} value={b.slug}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Stock *">
                <input type="number" className={inputCls} value={editor.stock} onChange={e => setEditor({ ...editor, stock: e.target.value })} />
              </Field>
              <Field label="Country of Origin *">
                <input className={inputCls} value={editor.countryOfOrigin} onChange={e => setEditor({ ...editor, countryOfOrigin: e.target.value })} />
              </Field>
              <Field label="Warranty (days)">
                <input type="number" className={inputCls} value={editor.warrantyDays} onChange={e => setEditor({ ...editor, warrantyDays: e.target.value })} />
              </Field>
              <div className="flex items-end gap-4 pb-1">
                <Toggle label="Featured" checked={editor.isFeatured} onChange={v => setEditor({ ...editor, isFeatured: v })} />
                <Toggle label="Bestseller" checked={editor.isBestseller} onChange={v => setEditor({ ...editor, isBestseller: v })} />
                <Toggle label="New" checked={editor.isNew} onChange={v => setEditor({ ...editor, isNew: v })} />
              </div>
            </div>

            <Field label="Description * (min 10 chars)" className="mt-4">
              <textarea rows={3} className={inputCls} value={editor.description} onChange={e => setEditor({ ...editor, description: e.target.value })} />
            </Field>
            <Field label="Features (one per line)" className="mt-4">
              <textarea rows={3} className={inputCls} value={editor.featuresText} onChange={e => setEditor({ ...editor, featuresText: e.target.value })} />
            </Field>
            <Field label="Specifications (Key: Value per line)" className="mt-4">
              <textarea
                rows={4}
                className={inputCls}
                value={editor.specsText}
                onChange={e => setEditor({ ...editor, specsText: e.target.value })}
                placeholder={'Operating Voltage: 5V\nWeight: 25g'}
              />
            </Field>

            <div className="flex gap-3 mt-6">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 h-11 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editor.id ? 'Save Changes' : 'Create Product'}
              </button>
              <button
                onClick={() => setEditor(null)}
                className="h-11 px-5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  'w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="accent-primary-600" />
      {label}
    </label>
  );
}

function Chip({ text, cls }: { text: string; cls: string }) {
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{text}</span>;
}
