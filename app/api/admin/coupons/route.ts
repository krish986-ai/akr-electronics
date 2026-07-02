import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';

const couponSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/),
  type: z.enum(['PERCENT', 'FLAT']),
  value: z.number().positive(),
  minOrder: z.number().min(0),
  expiresAt: z.string(),
  active: z.boolean(),
});

export async function POST(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const coupon = couponSchema.parse(await request.json());
    await getAdminDb().collection('coupons').doc(coupon.code).set(coupon);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to save coupon' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { code, active } = z
      .object({ code: z.string(), active: z.boolean() })
      .parse(await request.json());
    await getAdminDb().collection('coupons').doc(code).update({ active });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { code } = z.object({ code: z.string() }).parse(await request.json());
    await getAdminDb().collection('coupons').doc(code).delete();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
