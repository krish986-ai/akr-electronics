import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyUserRequest } from '@/lib/auth/user-guard';

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  image: z.string(),
  price: z.number().min(0),
  quantity: z.number().int().min(1).max(999),
});

const placeOrderSchema = z.object({
  orderNumber: z.string().min(1).max(40),
  placedAt: z.string().min(1),
  status: z.literal('CONFIRMED'),
  paymentMethod: z.string().min(1).max(40),
  shippingMethod: z.enum(['standard', 'express']),
  items: z.array(orderItemSchema).min(1).max(50),
  subtotal: z.number().min(0),
  shipping: z.number().min(0),
  lowOrderCharge: z.number().min(0),
  discount: z.number().min(0),
  total: z.number().min(0),
  address: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(6),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string(),
    pincode: z.string().min(1),
  }),
});

export async function POST(request: NextRequest) {
  const check = await verifyUserRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  let order: z.infer<typeof placeOrderSchema>;
  try {
    order = placeOrderSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const db = getAdminDb();
  try {
    await db.runTransaction(async tx => {
      const productRefs = order.items.map(item => db.collection('products').doc(item.productId));
      const productDocs = await Promise.all(productRefs.map(ref => tx.get(ref)));

      productDocs.forEach((doc, i) => {
        const item = order.items[i];
        if (!doc.exists) {
          throw new Error(`OUT_OF_STOCK:${item.name} is no longer available`);
        }
        const stock = (doc.data()?.stock as number) ?? 0;
        if (stock < item.quantity) {
          throw new Error(
            stock === 0
              ? `OUT_OF_STOCK:${item.name} is out of stock`
              : `OUT_OF_STOCK:Only ${stock} left of ${item.name} — reduce the quantity`
          );
        }
      });

      productDocs.forEach((doc, i) => {
        const stock = (doc.data()?.stock as number) ?? 0;
        tx.update(productRefs[i], { stock: stock - order.items[i].quantity });
      });

      const orderRef = db.collection('orders').doc();
      tx.set(orderRef, {
        ...order,
        userId: check.uid,
        createdAt: new Date(),
      });
    });

    return NextResponse.json({ ok: true, orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('OUT_OF_STOCK:')) {
      return NextResponse.json({ error: message.slice('OUT_OF_STOCK:'.length) }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
