import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { defaultStoreConfig } from '@/lib/mock/products';

const settingsSchema = z.object({
  storeName: z.string().min(2).max(100),
  supportEmail: z.string().email(),
  supportPhone: z.string().min(6).max(20),
  announcement: z.string().max(300),
});

export async function GET(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const doc = await getAdminDb().collection('config').doc('store').get();
    return NextResponse.json({ ...defaultStoreConfig, ...(doc.data() ?? {}) });
  } catch {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const settings = settingsSchema.parse(await request.json());
    console.log('[Settings API] Saving settings:', settings);
    await getAdminDb().collection('config').doc('store').set(settings);
    console.log('[Settings API] Settings saved successfully');

    const response = NextResponse.json({ success: true, settings });
    // Prevent caching to ensure fresh data
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    console.error('[Settings API] Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
