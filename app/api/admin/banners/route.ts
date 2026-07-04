import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { deleteHostedImage } from '@/lib/storage/cleanup';

const bannerSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(120),
  subtitle: z.string().max(300),
  cta: z.string().min(1).max(40),
  href: z.string().min(1),
  gradient: z.string().min(1),
  image: z.string().min(1).optional(),
  badge: z.string().max(60).optional(),
  active: z.boolean(),
});

export async function POST(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const banner = bannerSchema.parse(await request.json());
    const ref = getAdminDb().collection('banners').doc(banner.id);
    const existing = await ref.get();
    const oldImage = existing.data()?.image as string | undefined;
    await ref.set(banner);
    if (oldImage && oldImage !== banner.image) {
      await deleteHostedImage(oldImage);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to save banner' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { id } = z.object({ id: z.string() }).parse(await request.json());
    const ref = getAdminDb().collection('banners').doc(id);
    const doc = await ref.get();
    await ref.delete();
    await deleteHostedImage(doc.data()?.image as string | undefined);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
