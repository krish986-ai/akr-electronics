'use client';

import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { PaymentSettings, defaultPaymentSettings } from './settings';

export async function fetchPaymentSettings(): Promise<PaymentSettings> {
  if (!isFirebaseConfigured || !db) return defaultPaymentSettings;
  try {
    const snapshot = await getDoc(doc(db, 'config', 'payments'));
    if (!snapshot.exists()) return defaultPaymentSettings;
    return { ...defaultPaymentSettings, ...snapshot.data() };
  } catch {
    return defaultPaymentSettings;
  }
}
