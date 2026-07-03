import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';

const VALID_STATUSES = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export async function GET(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const snapshot = await getAdminDb()
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    const orders = snapshot.docs.map(d => {
      const { createdAt, ...data } = d.data();
      return { id: d.id, ...data };
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: 'Failed to list orders' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  let body: { id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { id, status } = body;
  if (!id || !status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'id and a valid status are required' }, { status: 400 });
  }

  try {
    await getAdminDb().collection('orders').doc(id).update({
      status,
      updatedAt: new Date(),
    });
    return NextResponse.json({ ok: true, id, status });
  } catch {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
