import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';

export async function GET(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const snapshot = await getAdminDb()
      .collection('newsletterSubscribers')
      .orderBy('subscribedAt', 'desc')
      .get();

    const subscribers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        email: data.email as string,
        active: data.active !== false,
        subscribedAt: data.subscribedAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('[Admin Subscriptions] Error:', error);
    return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 });
  }
}
