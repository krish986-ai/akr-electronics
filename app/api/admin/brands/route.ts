import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { revalidatePath } from 'next/cache';

function revalidateStorefrontBrands() {
  revalidatePath('/products');
}

const brandSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  description: z.string().max(300).default(''),
});

export async function POST(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const brand = brandSchema.parse(await request.json());
    await getAdminDb().collection('brands').doc(brand.id).set(brand);
    revalidateStorefrontBrands();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to save brand' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { id } = z.object({ id: z.string() }).parse(await request.json());
    const db = getAdminDb();

    const doc = await db.collection('brands').doc(id).get();
    const slug = doc.data()?.slug;
    if (slug) {
      const inUse = await db.collection('products').where('brandSlug', '==', slug).limit(1).get();
      if (!inUse.empty) {
        return NextResponse.json(
          { error: 'Brand has products assigned. Move or delete them first.' },
          { status: 409 }
        );
      }
    }

    await db.collection('brands').doc(id).delete();
    revalidateStorefrontBrands();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
