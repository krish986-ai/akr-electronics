'use client';

import { auth } from '@/lib/firebase/config';

export async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const user = auth?.currentUser;
  if (!user) {
    throw new Error('Not signed in');
  }
  const token = await user.getIdToken();
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export async function adminUpload<T>(path: string, formData: FormData): Promise<T> {
  const user = auth?.currentUser;
  if (!user) {
    throw new Error('Not signed in');
  }
  const token = await user.getIdToken();
  const res = await fetch(path, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Upload failed (${res.status})`);
  }
  return data as T;
}

export async function adminMutate<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await adminFetch(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}
