import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { defaultPaymentSettings } from '@/lib/payments/settings';
import { imageUrlSchema } from '@/lib/validation/image-validation';
import { deleteHostedImage } from '@/lib/storage/cleanup';
import { getAdminActionPassword } from '@/lib/auth/admin-password';

const paymentSettingsSchema = z.object({
  razorpayEnabled: z.boolean(),
  qrEnabled: z.boolean(),
  qrImage: imageUrlSchema.or(z.literal('')),
  qrUpiName: z.string().max(100),
  qrPassword: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const doc = await getAdminDb().collection('config').doc('payments').get();
    return NextResponse.json({
      ...defaultPaymentSettings,
      ...(doc.data() ?? {}),
      razorpayKeyConfigured: Boolean(
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
      ),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load payment settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { qrPassword, ...settings } = paymentSettingsSchema.parse(await request.json());
    const ref = getAdminDb().collection('config').doc('payments');
    const existing = await ref.get();
    const oldImage = (existing.data()?.qrImage as string) ?? '';

    if (settings.qrImage !== oldImage) {
      if (qrPassword !== (await getAdminActionPassword())) {
        return NextResponse.json(
          { error: 'Changing the payment QR requires the QR change password' },
          { status: 403 }
        );
      }
      await deleteHostedImage(oldImage);
    }

    await ref.set(settings);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to save payment settings' }, { status: 500 });
  }
}
