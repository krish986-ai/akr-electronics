import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { defaultWarrantyPolicy } from '@/lib/mock/products';
import { revalidateTag } from 'next/cache';
import { CATALOG_TAG } from '@/lib/data/server-catalog';

const warrantyPolicySchema = z.object({
  summary: z.string().min(10).max(1000),
  voidsIf: z.string().min(10).max(1000),
});

export async function GET(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const doc = await getAdminDb().collection('config').doc('warranty').get();
    return NextResponse.json({ ...defaultWarrantyPolicy, ...(doc.data() ?? {}) });
  } catch {
    return NextResponse.json({ error: 'Failed to load warranty policy' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const policy = warrantyPolicySchema.parse(await request.json());
    await getAdminDb().collection('config').doc('warranty').set(policy);
    revalidateTag(CATALOG_TAG, 'max');

    const response = NextResponse.json({ success: true, policy });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to save warranty policy' }, { status: 500 });
  }
}

// Removes the custom policy doc entirely, so reads fall back to
// defaultWarrantyPolicy — this is the "delete" action: revert to the
// original built-in policy rather than leaving a blank one live.
export async function DELETE(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    await getAdminDb().collection('config').doc('warranty').delete();
    revalidateTag(CATALOG_TAG, 'max');
    return NextResponse.json({ success: true, policy: defaultWarrantyPolicy });
  } catch {
    return NextResponse.json({ error: 'Failed to reset warranty policy' }, { status: 500 });
  }
}
