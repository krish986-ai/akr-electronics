'use client';

import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { OrderSettings, defaultOrderSettings } from './settings';

export async function fetchOrderSettings(): Promise<OrderSettings> {
  if (!isFirebaseConfigured || !db) return defaultOrderSettings;
  try {
    const snapshot = await getDoc(doc(db, 'config', 'orders'));
    if (!snapshot.exists()) return defaultOrderSettings;
    return { ...defaultOrderSettings, ...snapshot.data() };
  } catch {
    return defaultOrderSettings;
  }
}
