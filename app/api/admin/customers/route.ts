import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { isCreatorEmail } from '@/lib/auth/creator';

interface ProfileFields {
  role: string;
  phone: string;
  branch: string;
  college: string;
}

export async function GET(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const [authUsers, profileDocs] = await Promise.all([
      getAdminAuth().listUsers(1000),
      getAdminDb().collection('users').get(),
    ]);
    const profiles = new Map<string, ProfileFields>(
      profileDocs.docs.map(d => {
        const data = d.data();
        return [
          d.id,
          {
            role: (data.role as string) ?? 'CUSTOMER',
            phone: (data.phone as string) ?? '',
            branch: (data.branch as string) ?? '',
            college: (data.college as string) ?? '',
          },
        ];
      })
    );

    const customers = authUsers.users.map(user => {
      const profile = profiles.get(user.uid);
      const creator = isCreatorEmail(user.email);
      return {
        uid: user.uid,
        email: user.email ?? '',
        name: user.displayName ?? user.email?.split('@')[0] ?? '—',
        role: creator ? 'ADMIN' : profile?.role ?? 'CUSTOMER',
        phone: profile?.phone ?? '',
        branch: profile?.branch ?? '',
        college: profile?.college ?? '',
        isCreator: creator,
        createdAt: user.metadata.creationTime ?? '',
        lastSignIn: user.metadata.lastSignInTime ?? '',
        disabled: user.disabled,
        emailVerified: user.emailVerified,
      };
    });

    return NextResponse.json({ customers });
  } catch {
    return NextResponse.json({ error: 'Failed to list customers' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  let body: { uid?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { uid, role } = body;
  if (!uid || (role !== 'ADMIN' && role !== 'CUSTOMER')) {
    return NextResponse.json({ error: 'uid and role (ADMIN or CUSTOMER) are required' }, { status: 400 });
  }

  try {
    const target = await getAdminAuth().getUser(uid);
    if (isCreatorEmail(target.email)) {
      return NextResponse.json(
        { error: 'The creator account is protected and cannot be changed' },
        { status: 403 }
      );
    }

    await getAdminDb().collection('users').doc(uid).set(
      {
        role,
        email: target.email?.toLowerCase() ?? '',
        name: target.displayName ?? target.email?.split('@')[0] ?? '',
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, uid, role });
  } catch {
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
