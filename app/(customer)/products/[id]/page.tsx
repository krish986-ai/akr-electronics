'use client';

import { useMemo, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getProductBySlugOrId,
  getRelatedProducts,
  productReviews,
  productQuestions,
  estimateDelivery,
  FREE_DELIVERY_THRESHOLD,
} from '@/lib/mock/products';
import { StoreProductCard } from '@/components/store/StoreProductCard';
import { useCartStore } from '@/lib/stores/cart';

const TABS = ['Description', 'Specification', 'Warranty', 'Reviews', 'QnA', 'Country of Origin'] as const;
type Tab = (typeof TABS)[number];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const product = getProductBySlugOrId(id);

  const [tab, setTab] = useState<Tab>('Description');
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const reviews = useMemo(
    () => productReviews.filter(r => r.productId === product?.id && r.status === 'APPROVED'),
    [product]
  );
  const questions = useMemo(() => productQuestions.filter(q => q.productId === product?.id), [product]);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Product not found</h1>
        <Link href="/products" className="text-primary-600 hover:underline">
          Browse all products →
        </Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const related = getRelatedProducts(product);
  const gallery = [product.image, ...(product.images ?? [])];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <nav className="text-xs text-neutral-500 mb-6 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary-600">Shop</Link>
        <span>/</span>
        <Link href={`/products?category=${product.categorySlug}`} className="hover:text-primary-600">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-neutral-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gallery[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 mt-3">
              {gallery.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} view ${i + 1}`}
                  className="w-16 h-16 rounded-lg border border-neutral-200 object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400">
            <Link href={`/products?brand=${product.brandSlug}`} className="hover:text-primary-600">
              {product.brand}
            </Link>
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mt-1">{product.name}</h1>

          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="text-amber-500">★ {product.rating}</span>
            <span className="text-neutral-500">({product.reviews} ratings)</span>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-500">SKU: {product.sku}</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-neutral-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-neutral-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-semibold text-red-600">-{discount}%</span>
              </>
            )}
          </div>
          <p className="text-xs text-neutral-500">Inclusive of {product.gstRate}% GST</p>

          <p className={`mt-3 text-sm font-semibold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
          </p>

          <ul className="mt-4 space-y-1.5">
            {product.features.map(f => (
              <li key={f} className="text-sm text-neutral-700 flex gap-2">
                <span className="text-primary-600">•</span>
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-5 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-xs font-semibold text-neutral-700 mb-2">📍 Check estimated delivery</p>
            <div className="flex gap-2">
              <input
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit pincode"
                className="flex-1 h-9 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => setDeliveryMsg(estimateDelivery(pincode))}
                className="h-9 px-4 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700"
              >
                Check
              </button>
            </div>
            {deliveryMsg && (
              <p className={`text-xs mt-2 ${deliveryMsg.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                {deliveryMsg.message}
              </p>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center border border-neutral-300 rounded-lg">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-10 text-lg text-neutral-600 hover:bg-neutral-50"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="w-9 h-10 text-lg text-neutral-600 hover:bg-neutral-50"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              disabled={product.stock === 0}
              onClick={() => {
                addItem(product, quantity);
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
              }}
              className="flex-1 h-10 rounded-lg border-2 border-primary-600 text-primary-600 text-sm font-semibold hover:bg-primary-50 disabled:opacity-50"
            >
              {added ? '✓ Added to Cart' : '🛒 Add to Cart'}
            </button>
            <button
              disabled={product.stock === 0}
              onClick={() => {
                addItem(product, quantity);
                router.push('/checkout');
              }}
              className="flex-1 h-10 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              ⚡ Buy Now
            </button>
          </div>

          <div className="mt-3 flex gap-2 text-sm">
            <Link
              href="/wishlist"
              className="flex-1 h-9 grid place-items-center rounded-lg border border-neutral-300 text-neutral-600 hover:border-primary-400 hover:text-primary-600"
            >
              ♡ Wishlist
            </Link>
            <Link
              href={`/compare?add=${product.id}`}
              className="flex-1 h-9 grid place-items-center rounded-lg border border-neutral-300 text-neutral-600 hover:border-primary-400 hover:text-primary-600"
            >
              ⇄ Compare
            </Link>
            <Link
              href="/bulk-orders"
              className="flex-1 h-9 grid place-items-center rounded-lg border border-neutral-300 text-neutral-600 hover:border-primary-400 hover:text-primary-600"
            >
              🏢 Bulk Order?
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <TrustChip icon="🛡️" text={`${product.warranty.days}-Day Warranty`} />
            <TrustChip icon="🚚" text={`Free Delivery ₹${FREE_DELIVERY_THRESHOLD}+`} />
            <TrustChip icon="💵" text="Cash on Delivery" />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="border-b border-neutral-200 flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === t
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {t}
              {t === 'Reviews' && ` (${reviews.length})`}
              {t === 'QnA' && ` (${questions.length})`}
            </button>
          ))}
        </div>

        <div className="py-6 max-w-3xl">
          {tab === 'Description' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-700 leading-relaxed">{product.description}</p>
              {product.packageIncludes && (
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm mb-2">Package Includes</h3>
                  <ul className="space-y-1">
                    {product.packageIncludes.map(item => (
                      <li key={item} className="text-sm text-neutral-700 flex gap-2">
                        <span className="text-emerald-600">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {tab === 'Specification' && (
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([key, value], i) => (
                  <tr key={key} className={i % 2 === 0 ? 'bg-neutral-50' : ''}>
                    <td className="py-2.5 px-3 font-medium text-neutral-700 w-1/3">{key}</td>
                    <td className="py-2.5 px-3 text-neutral-600">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'Warranty' && (
            <div className="space-y-3 text-sm text-neutral-700">
              <h3 className="font-semibold text-neutral-900">{product.warranty.days}-Day Warranty</h3>
              <p>{product.warranty.summary}</p>
              <h4 className="font-semibold text-neutral-900 pt-2">What voids the warranty</h4>
              <p>{product.warranty.voidsIf}</p>
            </div>
          )}

          {tab === 'Reviews' && (
            <div className="space-y-5">
              {reviews.length === 0 && (
                <p className="text-sm text-neutral-500">No reviews yet. Be the first to review this product.</p>
              )}
              {reviews.map(r => (
                <div key={r.id} className="border-b border-neutral-100 pb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-amber-500">
                      {'★'.repeat(r.rating)}
                      {'☆'.repeat(5 - r.rating)}
                    </span>
                    <span className="font-semibold text-neutral-900">{r.title}</span>
                  </div>
                  <p className="text-sm text-neutral-700 mt-1">{r.body}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {r.author} · {r.date}
                  </p>
                </div>
              ))}
              <p className="text-xs text-neutral-500">Sign in to write a review.</p>
            </div>
          )}

          {tab === 'QnA' && (
            <div className="space-y-4">
              {questions.length === 0 && <p className="text-sm text-neutral-500">No questions yet.</p>}
              {questions.map(q => (
                <div key={q.id} className="border-b border-neutral-100 pb-3">
                  <p className="text-sm font-medium text-neutral-900">Q: {q.question}</p>
                  {q.answer ? (
                    <p className="text-sm text-neutral-700 mt-1">A: {q.answer}</p>
                  ) : (
                    <p className="text-xs text-neutral-400 mt-1 italic">Awaiting answer from AKR team</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">
                    {q.author} · {q.date}
                  </p>
                </div>
              ))}
              <p className="text-xs text-neutral-500">Only registered users can ask questions.</p>
            </div>
          )}

          {tab === 'Country of Origin' && (
            <p className="text-sm text-neutral-700">
              <span className="font-semibold">Country of Origin:</span> {product.countryOfOrigin}
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-5">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => (
              <StoreProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TrustChip({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
      <p className="text-lg">{icon}</p>
      <p className="text-[10px] font-medium text-neutral-600 mt-0.5">{text}</p>
    </div>
  );
}
