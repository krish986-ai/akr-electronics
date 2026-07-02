'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore, cartSubtotal, cartShipping } from '@/lib/stores/cart';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/mock/products';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const subtotal = cartSubtotal(items);
  const shipping = cartShipping(subtotal);
  const total = subtotal + shipping;
  const remainingForFree = FREE_DELIVERY_THRESHOLD - subtotal;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Your cart is empty</h1>
        <p className="text-sm text-neutral-500 mb-6">Add some components and start building.</p>
        <Link
          href="/products"
          className="inline-block bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Shopping Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-600 hover:underline">
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {remainingForFree > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              Add ₹{remainingForFree.toLocaleString('en-IN')} more for <strong>free delivery</strong> 🚚
            </div>
          )}
          {items.map(item => (
            <div
              key={item.productId}
              className="bg-white border border-neutral-200 rounded-xl p-4 flex gap-4 items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productId}`}
                  className="text-sm font-medium text-neutral-900 hover:text-primary-600 line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-neutral-400 mt-0.5">₹{item.price.toLocaleString('en-IN')} · Incl. GST</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-neutral-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 text-neutral-600 hover:bg-neutral-50"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 text-neutral-600 hover:bg-neutral-50"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-bold text-neutral-900 whitespace-nowrap">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 h-fit">
          <h2 className="font-bold text-neutral-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal (incl. GST)</span>
              <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Shipping</span>
              <span className={shipping === 0 ? 'text-emerald-600 font-medium' : 'font-medium'}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-neutral-200 text-base font-bold">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="block w-full mt-5 h-11 leading-[44px] text-center rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
          >
            Proceed to Checkout →
          </Link>
          <Link
            href="/products"
            className="block w-full mt-2 h-11 leading-[44px] text-center rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50"
          >
            Continue Shopping
          </Link>
          <p className="text-[11px] text-neutral-400 text-center mt-3">
            🔒 Secure checkout · 💵 COD available · 🧾 GST invoice
          </p>
        </div>
      </div>
    </div>
  );
}
