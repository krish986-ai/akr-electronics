'use client';

import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { useCartStore, type CartLine } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { fetchRemoteCart, saveRemoteCart, subscribeToRemoteCart, mergeCartItems } from '@/lib/cart/sync';
import {
  fetchRemoteWishlist,
  saveRemoteWishlist,
  subscribeToRemoteWishlist,
  mergeWishlistIds,
} from '@/lib/wishlist/sync';
import { syncOnSignIn, type ArraySyncAdapter } from '@/lib/sync/account-array-sync';

// Keeps the cart and wishlist identical for the same account everywhere it's
// open — the app (Capacitor WebView) and the browser each have their own
// localStorage, so without this, useCartStore/useWishlistStore's
// zustand-persist state never left the device it was built on. Orders and
// the profile are already Firestore-backed and don't need this.
export function AccountSync() {
  const applyingCartRemote = useRef(false);
  const applyingWishlistRemote = useRef(false);
  // Latest in-flight write-through save, so a sign-out that lands right
  // after an add-to-cart/wishlist edit can wait for it instead of clearing
  // local state out from under a save that hasn't reached Firestore yet.
  const cartSaveInFlight = useRef<Promise<unknown>>(Promise.resolve());
  const wishlistSaveInFlight = useRef<Promise<unknown>>(Promise.resolve());
  // undefined = no auth callback seen yet. Only a real signed-in -> null
  // transition means "this account logged out"; the very first callback
  // reporting null just means the visitor is (and always was) a guest, and
  // their guest cart/wishlist must be left alone.
  const previousUid = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    let disposeCart: (() => void) | null = null;
    let disposeWishlist: (() => void) | null = null;

    const cartAdapter: ArraySyncAdapter<CartLine> = {
      getLocal: () => useCartStore.getState().items,
      getLocalOwner: () => useCartStore.getState().ownerUid,
      replaceLocal: (items, ownerUid) => useCartStore.getState().replaceItems(items, ownerUid),
      clearLocal: () => useCartStore.getState().clearCart(),
      fetchRemote: fetchRemoteCart,
      saveRemote: saveRemoteCart,
      subscribeRemote: subscribeToRemoteCart,
      merge: mergeCartItems,
    };

    const wishlistAdapter: ArraySyncAdapter<string> = {
      getLocal: () => useWishlistStore.getState().productIds,
      getLocalOwner: () => useWishlistStore.getState().ownerUid,
      replaceLocal: (ids, ownerUid) => useWishlistStore.getState().replaceIds(ids, ownerUid),
      clearLocal: () => useWishlistStore.getState().clear(),
      fetchRemote: fetchRemoteWishlist,
      saveRemote: saveRemoteWishlist,
      subscribeRemote: subscribeToRemoteWishlist,
      merge: mergeWishlistIds,
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      disposeCart?.();
      disposeCart = null;
      disposeWishlist?.();
      disposeWishlist = null;

      const wasSignedIn = previousUid.current !== undefined && previousUid.current !== null;
      previousUid.current = user?.uid ?? null;

      if (!user) {
        if (wasSignedIn) {
          // Real sign-out: let any save still in flight land before wiping
          // local state, then clear so the next guest/account on this
          // device can't inherit or re-merge this one's data.
          await Promise.allSettled([cartSaveInFlight.current, wishlistSaveInFlight.current]);
          cartAdapter.clearLocal();
          wishlistAdapter.clearLocal();
        }
        // First callback reporting no user (plain guest session): nothing
        // to clear, whatever's local is the guest's own cart/wishlist.
        return;
      }

      disposeCart = await syncOnSignIn(user.uid, cartAdapter, apply => {
        applyingCartRemote.current = true;
        apply();
        applyingCartRemote.current = false;
      });

      disposeWishlist = await syncOnSignIn(user.uid, wishlistAdapter, apply => {
        applyingWishlistRemote.current = true;
        apply();
        applyingWishlistRemote.current = false;
      });
    });

    return () => {
      unsubscribeAuth();
      disposeCart?.();
      disposeWishlist?.();
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    return useCartStore.subscribe(state => {
      if (applyingCartRemote.current) return;
      const user = auth?.currentUser;
      if (!user) return;
      cartSaveInFlight.current = saveRemoteCart(user.uid, state.items).catch(err => {
        console.error('Failed to sync cart to account', err);
      });
    });
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    return useWishlistStore.subscribe(state => {
      if (applyingWishlistRemote.current) return;
      const user = auth?.currentUser;
      if (!user) return;
      wishlistSaveInFlight.current = saveRemoteWishlist(user.uid, state.productIds).catch(err => {
        console.error('Failed to sync wishlist to account', err);
      });
    });
  }, []);

  return null;
}
