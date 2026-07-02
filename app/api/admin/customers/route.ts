import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';

export async function GET(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const [authUsers, roleDocs] = await Promise.all([
      getAdminAuth().listUsers(1000),
      getAdminDb().collection('users').get(),
    ]);
    const roles = new Map(roleDocs.docs.map(d => [d.id, d.data().role as string]));

    const customers = authUsers.users.map(user => ({
      uid: user.uid,
      email: user.email ?? '',
      name: user.displayName ?? user.email?.split('@')[0] ?? '—',
      role: roles.get(user.uid) ?? 'CUSTOMER',
      createdAt: user.metadata.creationTime ?? '',
      lastSignIn: user.metadata.lastSignInTime ?? '',
      disabled: user.disabled,
      emailVerified: user.emailVerified,
    }));

    return NextResponse.json({ customers });
  } catch {
    return NextResponse.json({ error: 'Failed to list customers' }, { status: 500 });
  }
}
