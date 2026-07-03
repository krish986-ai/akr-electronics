'use client';

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  college: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface UserProfileInput {
  name: string;
  email: string;
  phone: string;
  branch: string;
  college: string;
}

const MOCK_PROFILE_KEY = 'user-profile';

function readMockProfile(uid: string): UserProfile | null {
  const raw = localStorage.getItem(`${MOCK_PROFILE_KEY}:${uid}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function writeMockProfile(profile: UserProfile): void {
  localStorage.setItem(`${MOCK_PROFILE_KEY}:${profile.uid}`, JSON.stringify(profile));
}

export async function createUserProfile(uid: string, input: UserProfileInput): Promise<void> {
  if (isFirebaseConfigured && db) {
    await setDoc(
      doc(db, 'users', uid),
      {
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        branch: input.branch,
        college: input.college,
        role: 'CUSTOMER',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return;
  }
  writeMockProfile({ uid, ...input, role: 'CUSTOMER' });
}

export async function ensureUserProfile(uid: string, name: string, email: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (snapshot.exists()) return;
  await setDoc(doc(db, 'users', uid), {
    name,
    email: email.toLowerCase(),
    phone: '',
    branch: '',
    college: '',
    role: 'CUSTOMER',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && db) {
    const snapshot = await getDoc(doc(db, 'users', uid));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return {
      uid,
      name: data.name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      branch: data.branch ?? '',
      college: data.college ?? '',
      role: data.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
    };
  }
  return readMockProfile(uid);
}

export async function saveUserProfile(
  uid: string,
  updates: Pick<UserProfileInput, 'name' | 'phone' | 'branch' | 'college'>
): Promise<void> {
  if (isFirebaseConfigured && db) {
    await setDoc(
      doc(db, 'users', uid),
      { ...updates, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return;
  }
  const existing = readMockProfile(uid);
  if (existing) {
    writeMockProfile({ ...existing, ...updates });
  }
}
