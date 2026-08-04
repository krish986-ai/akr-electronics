'use client';

import { doc, getDoc, onSnapshot, setDoc, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { CartLine } from '@/lib/stores/cart';

const CARTS_COLLECTION = 'carts';

interface RemoteCartDoc {
  items?: CartLine[];
}

export async function fetchRemoteCart(uid: string): Promise<CartLine[] | null> {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, CARTS_COLLECTION, uid));
  if (!snapshot.exists()) return null;
  const items = (snapshot.data() as RemoteCartDoc).items;
  return Array.isArray(items) ? items : [];
}

export async function saveRemoteCart(uid: string, items: CartLine[]): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, CARTS_COLLECTION, uid), { items, updatedAt: serverTimestamp() }, { merge: true });
}

// Live updates from another device/tab signed into the same account. Writes
// this tab makes itself echo back through the listener with
// `hasPendingWrites: true` before the server ack — skip those so a local
// mutation doesn't immediately overwrite itself with a stale read.
export function subscribeToRemoteCart(uid: string, onChange: (items: CartLine[]) => void): Unsubscribe | null {
  if (!db) return null;
  return onSnapshot(doc(db, CARTS_COLLECTION, uid), snapshot => {
    if (snapshot.metadata.hasPendingWrites || !snapshot.exists()) return;
    const items = (snapshot.data() as RemoteCartDoc).items;
    onChange(Array.isArray(items) ? items : []);
  });
}

// Union of a local (e.g. guest) cart and the account's remote cart, summing
// quantities for lines both sides have — used once, on sign-in.
export function mergeCartItems(local: CartLine[], remote: CartLine[]): CartLine[] {
  const merged = new Map<string, CartLine>();
  for (const item of remote) merged.set(item.productId, item);
  for (const item of local) {
    const existing = merged.get(item.productId);
    if (!existing) {
      merged.set(item.productId, item);
      continue;
    }
    const cap = existing.stock || item.stock || existing.quantity + item.quantity;
    merged.set(item.productId, { ...existing, quantity: Math.min(existing.quantity + item.quantity, cap) });
  }
  return Array.from(merged.values());
}
