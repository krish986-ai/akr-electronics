'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { getProducts, resetCatalogCache } from '@/lib/data/catalog';
import { adminFetch, adminMutate } from '@/lib/api/admin-client';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { safeImageSrc } from '@/lib/utils/image';
import { Brand, KitItem, Product, brands, GST_RATE_DEFAULT, STANDARD_WARRANTY } from '@/lib/mock/products';

const KIT_CATEGORY_SLUG = 'iot-starter-kits';
const KIT_CATEGORY_NAME = 'IoT Starter Kits';

interface EditorState {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  price: string;
  originalPrice: string;
  brandSlug: string;
  description: string;
  stock: string;
  countryOfOrigin: string;
  warrantyDays: string;
  items: KitItem[];
  isFeatured: boolean;
}

const EMPTY_EDITOR: EditorState = {
  name: '',
  slug: '',
  sku: '',
  image: '',
  price: '',
  originalPrice: '',
  brandSlug: '',
  description: '',
  stock: '0',
  countryOfOrigin: 'India',
  warrantyDays: String(STANDARD_WARRANTY.days),
  items: [],
  isFeatured: false,
};

function kitToEditor(p: Product): EditorState {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    image: p.image,
    price: String(p.price),
    originalPrice: p.originalPrice ? String(p.originalPrice) : '',
    brandSlug: p.brandSlug,
    description: p.description,
    stock: String(p.stock),
    countryOfOrigin: p.countryOfOrigin,
    warrantyDays: String(p.warranty?.days ?? STANDARD_WARRANTY.days),
    items: p.kitItems ?? [],
    isFeatured: Boolean(p.isFeatured),
  };
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function editorToPayload(e: EditorState, brandsList: Brand[]) {
  const brand = brandsList.find(b => b.slug === e.brandSlug);
  return {
    name: e.name.trim(),
    slug: e.slug.trim(),
    sku: e.sku.trim(),
    image: e.image.trim(),
    price: Number(e.price),
    originalPrice: e.originalPrice ? Number(e.originalPrice) : undefined,
    gstRate: GST_RATE_DEFAULT,
    category: KIT_CATEGORY_NAME,
    categorySlug: KIT_CATEGORY_SLUG,
    brand: brand?.name ?? e.brandSlug,
    brandSlug: e.brandSlug,
    description: e.description.trim(),
    specifications: {},
    features: [],
    warrantyDays: Number(e.warrantyDays),
    countryOfOrigin: e.countryOfOrigin.trim(),
    stock: Number(e.stock),
    isFeatured: e.isFeatured,
    isKit: true,
    kitItems: e.items,
  };
}

export default function AdminStarterKitsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [brandsList, setBrandsList] = useState<Brand[]>(brands);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [itemSearch, setItemSearch] = useState('');
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
      throw new Error(catalog.error ?? 'Failed to load brands');
    }
    const brs = Array.isArray(catalog.brands) ? (catalog.brands as Brand[]) : [];
    setAllProducts(prods);
    setBrandsList(brs.length ? brs : brands);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const kits = allProducts.filter(p => p.isKit);
  const nonKitProducts = useMemo(() => allProducts.filter(p => !p.isKit), [allProducts]);
  const productById = useMemo(() => new Map(allProducts.map(p => [p.id, p])), [allProducts]);

  const filtered = kits.filter(
    p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const pickableProducts = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    const pool = q
      ? nonKitProducts.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      : nonKitProducts;
    return pool.slice(0, 20);
  }, [nonKitProducts, itemSearch]);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const addItem = (product: Product) => {
    if (!editor || editor.items.some(i => i.productId === product.id)) return;
    setEditor({ ...editor, items: [...editor.items, { productId: product.id, quantity: 1 }] });
  };

  const updateItemQty = (productId: string, quantity: number) => {
    if (!editor) return;
    setEditor({
      ...editor,
      items: editor.items.map(i => (i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i)),
    });
  };

  const removeItem = (productId: string) => {
    if (!editor) return;
    setEditor({ ...editor, items: editor.items.filter(i => i.productId !== productId) });
  };

  const itemsValue = editor
    ? editor.items.reduce((sum, item) => sum + (productById.get(item.productId)?.price ?? 0) * item.quantity, 0)
    : 0;

  const save = async () => {
    if (!editor) return;
    if (editor.items.length === 0) {
      setError('Add at least one product to the kit before saving.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = editorToPayload(editor, brandsList);
      if (editor.id) {
        await adminMutate(`/api/admin/products/${editor.id}`, 'PUT', payload);
        flash('Kit updated ✓');
      } else {
        await adminMutate('/api/admin/products', 'POST', payload);
        flash('Kit created ✓');
      }
      setEditor(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (kit: Product) => {
    if (!confirm(`Delete kit "${kit.name}"? This cannot be undone.`)) return;
    try {
      await adminMutate(`/api/admin/products/${kit.id}`, 'DELETE');
      flash('Kit deleted');
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Starter Kits</h1>
          <p className="text-sm text-neutral-500">
            {kits.length} kit{kits.length === 1 ? '' : 's'} · bundle real catalog products into a kit for students
          </p>
        </div>
        <div className="flex gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search kit name or SKU..."
            className="h-10 w-64 rounded-lg border border-neutral-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => {
              setError('');
              setItemSearch('');
              setEditor({ ...EMPTY_EDITOR, brandSlug: brandsList[0]?.slug ?? brands[0].slug });
            }}
            className="h-10 px-4 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            + New Kit
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          {notice}
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-neutral-500">Loading kits...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Kit</th>
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-right px-4 py-3">Items</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3">Stock</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(kit => (
                <tr key={kit.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image src={safeImageSrc(kit.image)} alt="" width={40} height={40} className="w-10 h-10 rounded-lg object-cover border border-neutral-200" />
                      <span className="font-medium text-neutral-900">{kit.name}</span>
                      {kit.isFeatured && <Chip text="Featured" cls="bg-primary-50 text-primary-700" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">{kit.sku}</td>
                  <td className="px-4 py-3 text-right text-neutral-600">{kit.kitItems?.length ?? 0}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{kit.price.toLocaleString('en-IN')}</td>
                  <td className={`px-4 py-3 text-right font-medium ${kit.stock < 10 ? 'text-red-600' : 'text-neutral-900'}`}>
                    {kit.stock}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setError('');
                        setItemSearch('');
                        setEditor(kitToEditor(kit));
                      }}
                      className="text-primary-600 hover:underline text-xs font-medium mr-3"
                    >
                      Edit
                    </button>
                    <button onClick={() => remove(kit)} className="text-red-600 hover:underline text-xs font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    No starter kits yet. Click "+ New Kit" to bundle your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editor && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-neutral-900">{editor.id ? 'Edit Starter Kit' : 'New Starter Kit'}</h2>
              <button onClick={() => setEditor(null)} className="text-neutral-400 hover:text-neutral-700 text-xl">
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Kit Name *">
                <input
                  className={inputCls}
                  value={editor.name}
                  onChange={e =>
                    setEditor({ ...editor, name: e.target.value, slug: editor.id ? editor.slug : slugify(e.target.value) })
                  }
                />
              </Field>
              <Field label="Slug *">
                <input className={inputCls} value={editor.slug} onChange={e => setEditor({ ...editor, slug: e.target.value })} />
              </Field>
              <Field label="SKU *">
                <input
                  className={inputCls}
                  value={editor.sku}
                  onChange={e => setEditor({ ...editor, sku: e.target.value })}
                  placeholder="AKR-KIT-0000"
                />
              </Field>
              <Field label="Image *">
                <ImageUploadField
                  value={editor.image}
                  onChange={url => setEditor(prev => (prev ? { ...prev, image: url } : prev))}
                  category="kits"
                  onError={setError}
                />
              </Field>
              <Field label="Kit Price ₹ (incl. GST) *">
                <input type="number" className={inputCls} value={editor.price} onChange={e => setEditor({ ...editor, price: e.target.value })} />
              </Field>
              <Field label="MRP ₹ (optional strike-through)">
                <input
                  type="number"
                  className={inputCls}
                  value={editor.originalPrice}
                  onChange={e => setEditor({ ...editor, originalPrice: e.target.value })}
                />
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
              <Field label="Stock (kits available) *">
                <input type="number" className={inputCls} value={editor.stock} onChange={e => setEditor({ ...editor, stock: e.target.value })} />
              </Field>
              <Field label="Country of Origin *">
                <input
                  className={inputCls}
                  value={editor.countryOfOrigin}
                  onChange={e => setEditor({ ...editor, countryOfOrigin: e.target.value })}
                />
              </Field>
              <Field label="Warranty (days)">
                <input
                  type="number"
                  className={inputCls}
                  value={editor.warrantyDays}
                  onChange={e => setEditor({ ...editor, warrantyDays: e.target.value })}
                />
              </Field>
              <div className="flex items-end pb-1">
                <Toggle label="Featured" checked={editor.isFeatured} onChange={v => setEditor({ ...editor, isFeatured: v })} />
              </div>
            </div>

            <Field label="Description * (min 10 chars)" className="mt-4">
              <textarea rows={3} className={inputCls} value={editor.description} onChange={e => setEditor({ ...editor, description: e.target.value })} />
            </Field>

            <div className="mt-5 border-t border-neutral-200 pt-5">
              <h3 className="font-semibold text-neutral-900 text-sm mb-1">Kit Contents *</h3>
              <p className="text-xs text-neutral-500 mb-3">
                Pick real products from your catalog to bundle into this kit. A student buys the kit as one item; each
                component below stays linked to its own live product page and price.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <input
                    value={itemSearch}
                    onChange={e => setItemSearch(e.target.value)}
                    placeholder="Search products to add..."
                    className={inputCls}
                  />
                  <div className="mt-2 border border-neutral-200 rounded-lg max-h-56 overflow-y-auto divide-y divide-neutral-100">
                    {pickableProducts.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addItem(p)}
                        disabled={editor.items.some(i => i.productId === p.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Image src={safeImageSrc(p.image)} alt="" width={28} height={28} className="w-7 h-7 rounded object-cover border border-neutral-200 shrink-0" />
                        <span className="flex-1 text-xs text-neutral-800 line-clamp-1">{p.name}</span>
                        <span className="text-xs text-neutral-400 shrink-0">₹{p.price.toLocaleString('en-IN')}</span>
                      </button>
                    ))}
                    {pickableProducts.length === 0 && (
                      <p className="p-3 text-xs text-neutral-400 text-center">No matching products.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-neutral-600 mb-1">
                    Selected ({editor.items.length}) · Value if bought separately: ₹{itemsValue.toLocaleString('en-IN')}
                  </p>
                  <div className="border border-neutral-200 rounded-lg max-h-56 overflow-y-auto divide-y divide-neutral-100">
                    {editor.items.map(item => {
                      const product = productById.get(item.productId);
                      if (!product) return null;
                      return (
                        <div key={item.productId} className="flex items-center gap-2 px-2 py-1.5">
                          <Image src={safeImageSrc(product.image)} alt="" width={28} height={28} className="w-7 h-7 rounded object-cover border border-neutral-200 shrink-0" />
                          <span className="flex-1 text-xs text-neutral-800 line-clamp-1">{product.name}</span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => updateItemQty(item.productId, Number(e.target.value))}
                            className="w-12 h-7 rounded border border-neutral-300 px-1 text-xs text-center"
                          />
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 hover:underline text-xs shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                    {editor.items.length === 0 && (
                      <p className="p-3 text-xs text-neutral-400 text-center">No products added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 h-11 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editor.id ? 'Save Changes' : 'Create Kit'}
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
