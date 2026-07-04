import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';

export async function GET(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const snapshot = await getAdminDb()
      .collection('bulkEnquiries')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    const enquiries = snapshot.docs.map(d => {
      const { createdAt, ...data } = d.data();
      return {
        ...data,
        id: d.id,
        createdAt: createdAt?.toDate?.()?.toISOString() ?? '',
      };
    });

    return NextResponse.json({ enquiries });
  } catch {
    return NextResponse.json({ error: 'Failed to list enquiries' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { id, status } = z
      .object({ id: z.string().min(1), status: z.enum(['NEW', 'CONTACTED', 'CLOSED']) })
      .parse(await request.json());
    await getAdminDb().collection('bulkEnquiries').doc(id).update({ status });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'id and a valid status are required' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 });
  }
}
