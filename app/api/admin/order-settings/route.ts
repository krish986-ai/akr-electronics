import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { defaultOrderSettings } from '@/lib/orders/settings';

const orderSettingsSchema = z.object({
  minOrderAmount: z.number().min(0),
  lowOrderCharge: z.number().min(0),
  fastDeliveryCharge: z.number().min(0),
  fastDeliveryEnabled: z.boolean(),
});

export async function GET(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const doc = await getAdminDb().collection('config').doc('orders').get();
    return NextResponse.json({ ...defaultOrderSettings, ...(doc.data() ?? {}) });
  } catch {
    return NextResponse.json({ error: 'Failed to load order settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const settings = orderSettingsSchema.parse(await request.json());
    await getAdminDb().collection('config').doc('orders').set(settings);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to save order settings' }, { status: 500 });
  }
}
