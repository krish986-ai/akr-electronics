import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyUserRequest } from '@/lib/auth/user-guard';

const createSchema = z.object({
  amount: z.number().min(1).max(10_000_000),
  receipt: z.string().max(40),
});

export async function POST(request: NextRequest) {
  const check = await verifyUserRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Online payments are not configured yet' }, { status: 503 });
  }

  try {
    const { amount, receipt } = createSchema.parse(await request.json());
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.description ?? 'Could not start the payment' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Could not start the payment' }, { status: 500 });
  }
}
