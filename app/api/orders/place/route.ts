import { createHmac } from 'crypto';
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
  status: z.enum(['CONFIRMED', 'PENDING']),
  paymentMethod: z.string().min(1).max(60),
  shippingMethod: z.enum(['standard', 'express']),
  qrPayerName: z.string().min(2).max(100).optional(),
  qrTransactionId: z.string().regex(/^\d{12}$/, 'Transaction ID must be 12 digits').optional(),
  razorpayPaymentId: z.string().max(100).optional(),
  razorpayOrderId: z.string().max(100).optional(),
  razorpaySignature: z.string().max(200).optional(),
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

  if (order.status === 'PENDING') {
    if (!order.qrPayerName || !order.qrTransactionId) {
      return NextResponse.json(
        { error: 'QR payments need your UPI name and the 12-digit transaction ID' },
        { status: 400 }
      );
    }
    const duplicate = await db
      .collection('orders')
      .where('qrTransactionId', '==', order.qrTransactionId)
      .limit(1)
      .get();
    if (!duplicate.empty) {
      return NextResponse.json(
        { error: 'This transaction ID has already been used for another order' },
        { status: 409 }
      );
    }
  }

  if (order.razorpayPaymentId || order.razorpayOrderId || order.razorpaySignature) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (
      !keySecret ||
      !order.razorpayPaymentId ||
      !order.razorpayOrderId ||
      !order.razorpaySignature
    ) {
      return NextResponse.json({ error: 'Payment could not be verified' }, { status: 400 });
    }
    const expected = createHmac('sha256', keySecret)
      .update(`${order.razorpayOrderId}|${order.razorpayPaymentId}`)
      .digest('hex');
    if (expected !== order.razorpaySignature) {
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';
    const rzpOrder = await fetch(`https://api.razorpay.com/v1/orders/${order.razorpayOrderId}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
    }).then(r => (r.ok ? r.json() : null));
    if (!rzpOrder || rzpOrder.amount !== Math.round(order.total * 100)) {
      return NextResponse.json(
        { error: 'Payment amount does not match the order total' },
        { status: 400 }
      );
    }
  }

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
