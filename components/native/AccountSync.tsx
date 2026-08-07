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

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    let disposeCart: (() => void) | null = null;
    let disposeWishlist: (() => void) | null = null;

    const cartAdapter: ArraySyncAdapter<CartLine> = {
      getLocal: () => useCartStore.getState().items,
      replaceLocal: items => useCartStore.getState().replaceItems(items),
      clearLocal: () => useCartStore.getState().clearCart(),
      fetchRemote: fetchRemoteCart,
      saveRemote: saveRemoteCart,
      subscribeRemote: subscribeToRemoteCart,
      merge: mergeCartItems,
    };

    const wishlistAdapter: ArraySyncAdapter<string> = {
      getLocal: () => useWishlistStore.getState().productIds,
      replaceLocal: ids => useWishlistStore.getState().replaceIds(ids),
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

      if (!user) {
        // Prevents the next signed-out/guest session on a shared device from
        // inheriting — and re-merging into a different account — this one's data.
        cartAdapter.clearLocal();
        wishlistAdapter.clearLocal();
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
      saveRemoteCart(user.uid, state.items).catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    return useWishlistStore.subscribe(state => {
      if (applyingWishlistRemote.current) return;
      const user = auth?.currentUser;
      if (!user) return;
      saveRemoteWishlist(user.uid, state.productIds).catch(() => {});
    });
  }, []);

  return null;
}
