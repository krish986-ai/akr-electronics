'use client';

export interface ArraySyncAdapter<T> {
  getLocal: () => T[];
  getLocalOwner: () => string | null;
  replaceLocal: (items: T[], ownerUid?: string | null) => void;
  clearLocal: () => void;
  fetchRemote: (uid: string) => Promise<T[] | null>;
  saveRemote: (uid: string, items: T[]) => Promise<void>;
  subscribeRemote: (uid: string, onChange: (items: T[]) => void) => (() => void) | null;
  merge: (local: T[], remote: T[]) => T[];
}

// Runs once per sign-in: merges whatever's in the local store (e.g. added as
// a guest) into the account's remote copy, hydrates the local store with the
// result, then keeps a live listener open for changes made elsewhere (e.g.
// the same account open on another device). Returns a disposer for that
// listener, to be called on sign-out or before the next sign-in.
//
// `withRemoteApplied` should bracket the local-store write it's given so the
// caller's own write-through subscription (watching the same store, for
// pushing genuine local edits back to Firestore) can tell this hydration
// apart from a real local change and skip re-saving it right back.
export async function syncOnSignIn<T>(
  uid: string,
  adapter: ArraySyncAdapter<T>,
  withRemoteApplied: (apply: () => void) => void
): Promise<() => void> {
  // Local data left behind by a *different* account on this device (sign-out
  // clear didn't run — tab closed, crash, etc.) must never merge into this
  // sign-in. Only data with no owner (guest additions) or already owned by
  // this same uid is safe to fold in.
  const localOwner = adapter.getLocalOwner();
  const localItems = localOwner === null || localOwner === uid ? adapter.getLocal() : [];
  const remoteItems = (await adapter.fetchRemote(uid).catch(() => null)) ?? [];
  const merged = adapter.merge(localItems, remoteItems);

  withRemoteApplied(() => adapter.replaceLocal(merged, uid));

  if (merged.length > 0) {
    await adapter.saveRemote(uid, merged).catch(err => {
      console.error('syncOnSignIn: failed to persist merged data', err);
    });
  }

  const unsubscribe = adapter.subscribeRemote(uid, items => {
    withRemoteApplied(() => adapter.replaceLocal(items, uid));
  });

  return () => unsubscribe?.();
}
