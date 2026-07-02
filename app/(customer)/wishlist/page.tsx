'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { products } from '@/lib/mock/products';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useCartStore } from '@/lib/stores/cart';

export default function WishlistPage() {
  const { productIds, remove } = useWishlistStore();
  const addToCart = useCartStore(state => state.addItem);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const wishlistItems = productIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is (typeof products)[number] => Boolean(p));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">My Wishlist</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {wishlistItems.length} saved product{wishlistItems.length === 1 ? '' : 's'}
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">♡</p>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Tap the ♡ button on any product to save it here.
          </p>
          <Link
            href="/products"
            className="inline-block bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {wishlistItems.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col"
            >
              <Link href={`/products/${product.id}`} className="block aspect-square bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="p-3 flex flex-col flex-1">
                <Link
                  href={`/products/${product.id}`}
                  className="text-sm font-medium text-neutral-900 hover:text-primary-600 line-clamp-2 flex-1"
                >
                  {product.name}
                </Link>
                <p className="text-base font-bold mt-2">
                  ₹{product.price.toLocaleString('en-IN')}
                  <span className="text-[10px] font-normal text-neutral-400 ml-1">Incl. GST</span>
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => addToCart(product, 1)}
                    disabled={product.stock === 0}
                    className="flex-1 h-9 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 disabled:opacity-50"
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    onClick={() => remove(product.id)}
                    aria-label="Remove from wishlist"
                    className="w-9 h-9 rounded-lg border border-neutral-300 text-neutral-500 hover:border-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
