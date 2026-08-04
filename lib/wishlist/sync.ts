'use client';

import { doc, getDoc, onSnapshot, setDoc, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Rides on the existing users/{uid} profile doc (lib/auth/profile.ts) rather
// than a new collection, so it needs no firestore.rules changes — the
// owner-or-admin rule on that document already covers arbitrary fields.
const WISHLIST_FIELD = 'wishlist';

export async function fetchRemoteWishlist(uid: string): Promise<string[] | null> {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.exists()) return null;
  const ids = snapshot.data()?.[WISHLIST_FIELD];
  return Array.isArray(ids) ? ids : [];
}

export async function saveRemoteWishlist(uid: string, productIds: string[]): Promise<void> {
  if (!db) return;
  await setDoc(
    doc(db, 'users', uid),
    { [WISHLIST_FIELD]: productIds, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export function subscribeToRemoteWishlist(
  uid: string,
  onChange: (productIds: string[]) => void
): Unsubscribe | null {
  if (!db) return null;
  return onSnapshot(doc(db, 'users', uid), snapshot => {
    if (snapshot.metadata.hasPendingWrites || !snapshot.exists()) return;
    const ids = snapshot.data()?.[WISHLIST_FIELD];
    onChange(Array.isArray(ids) ? ids : []);
  });
}

export function mergeWishlistIds(local: string[], remote: string[]): string[] {
  return Array.from(new Set([...remote, ...local]));
}
