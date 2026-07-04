import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { ADMIN_ACTION_PASSWORD } from '@/lib/auth/admin-password';

const VALID_STATUSES = [
  'PENDING',
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

  let body: { id?: string; status?: string; archive?: boolean; reject?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { id, status, archive, reject } = body;
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    if (reject === true) {
      const db = getAdminDb();
      await db.runTransaction(async tx => {
        const orderRef = db.collection('orders').doc(id);
        const orderDoc = await tx.get(orderRef);
        if (!orderDoc.exists) throw new Error('NOT_FOUND');
        const items = (orderDoc.data()?.items ?? []) as { productId: string; quantity: number }[];
        const productRefs = items.map(i => db.collection('products').doc(i.productId));
        const productDocs = await Promise.all(productRefs.map(ref => tx.get(ref)));
        productDocs.forEach((doc, i) => {
          if (doc.exists) {
            const stock = (doc.data()?.stock as number) ?? 0;
            tx.update(productRefs[i], { stock: stock + items[i].quantity });
          }
        });
        tx.update(orderRef, { status: 'CANCELLED', updatedAt: new Date() });
      });
      return NextResponse.json({ ok: true, id, status: 'CANCELLED' });
    }

    if (archive === true) {
      await getAdminDb().collection('orders').doc(id).update({
        archived: true,
        archivedAt: new Date(),
      });
      return NextResponse.json({ ok: true, id, archived: true });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'A valid status is required' }, { status: 400 });
    }
    await getAdminDb().collection('orders').doc(id).update({
      status,
      updatedAt: new Date(),
    });
    return NextResponse.json({ ok: true, id, status });
  } catch {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  let body: { id?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  if (body.password !== ADMIN_ACTION_PASSWORD) {
    return NextResponse.json(
      { error: 'Permanently deleting an order requires the admin action password' },
      { status: 403 }
    );
  }

  try {
    await getAdminDb().collection('orders').doc(body.id).delete();
    return NextResponse.json({ ok: true, id: body.id, deleted: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
