import { db, auth } from '@/lib/firebase/config';

export function getDb() {
  if (!db) {
    throw new Error('Firestore not initialized. Check Firebase config.');
  }
  return db;
}

export function getAuth() {
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Check Firebase config.');
  }
  return auth;
}
