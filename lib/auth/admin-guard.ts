import { NextRequest } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

export interface AdminCheck {
  ok: boolean;
  uid?: string;
  error?: string;
  status?: number;
}

export async function verifyAdminRequest(request: NextRequest): Promise<AdminCheck> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return { ok: false, error: 'Missing auth token', status: 401 };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const userDoc = await getAdminDb().collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'ADMIN') {
      return { ok: false, error: 'Admin access required', status: 403 };
    }
    return { ok: true, uid: decoded.uid };
  } catch {
    return { ok: false, error: 'Invalid or expired token', status: 401 };
  }
}
