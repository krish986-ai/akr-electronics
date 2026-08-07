import { NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

export interface UserCheck {
  ok: boolean;
  uid?: string;
  email?: string;
  emailVerified?: boolean;
  error?: string;
  status?: number;
}

export async function verifyUserRequest(request: NextRequest): Promise<UserCheck> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return { ok: false, error: 'Missing auth token', status: 401 };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { ok: true, uid: decoded.uid, email: decoded.email, emailVerified: decoded.email_verified === true };
  } catch {
    return { ok: false, error: 'Invalid or expired token', status: 401 };
  }
}
