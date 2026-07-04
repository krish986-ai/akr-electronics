'use client';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase/config';
import { PlacedOrder, useOrdersStore } from '@/lib/stores/orders';

function docToPlacedOrder(data: Record<string, unknown>): PlacedOrder {
  const order = data as unknown as PlacedOrder;
  return {
    ...order,
    shippingMethod: order.shippingMethod ?? 'standard',
    lowOrderCharge: order.lowOrderCharge ?? 0,
  };
}

export async function submitOrder(_userId: string, order: PlacedOrder): Promise<void> {
  if (isFirebaseConfigured && auth?.currentUser) {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch('/api/orders/place', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `Order failed (${res.status})`);
    }
    return;
  }
  useOrdersStore.getState().placeOrder(order);
}

export async function fetchMyOrders(userId: string): Promise<PlacedOrder[]> {
  if (isFirebaseConfigured && db) {
    const snapshot = await getDocs(query(collection(db, 'orders'), where('userId', '==', userId)));
    return snapshot.docs
      .map(d => docToPlacedOrder(d.data()))
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  }
  return useOrdersStore.getState().orders;
}

export async function fetchMyOrder(userId: string, orderNumber: string): Promise<PlacedOrder | null> {
  if (isFirebaseConfigured && db) {
    const snapshot = await getDocs(
      query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        where('orderNumber', '==', orderNumber)
      )
    );
    return snapshot.empty ? null : docToPlacedOrder(snapshot.docs[0].data());
  }
  return useOrdersStore.getState().orders.find(o => o.orderNumber === orderNumber) ?? null;
}
