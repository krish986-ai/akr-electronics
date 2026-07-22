import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { deleteHostedImage } from '@/lib/storage/cleanup';
import { revalidatePath } from 'next/cache';

function revalidateStorefrontCategories() {
  revalidatePath('/');
  revalidatePath('/products');
}

const childSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  icon: z.string().min(1).max(8),
});

const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  icon: z.string().min(1).max(8),
  image: z.string().min(1).optional(),
  children: z.array(childSchema).default([]),
});

export async function POST(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const category = categorySchema.parse(await request.json());
    const ref = getAdminDb().collection('categories').doc(category.id);
    const existing = await ref.get();
    const oldImage = existing.data()?.image as string | undefined;
    await ref.set(category);
    if (oldImage && oldImage !== category.image) {
      await deleteHostedImage(oldImage);
    }
    revalidateStorefrontCategories();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to save category' }, { status: 500 });
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

    const doc = await db.collection('categories').doc(id).get();
    const slug = doc.data()?.slug;
    if (slug) {
      const inUse = await db.collection('products').where('categorySlug', '==', slug).limit(1).get();
      if (!inUse.empty) {
        return NextResponse.json(
          { error: 'Category has products assigned. Move or delete them first.' },
          { status: 409 }
        );
      }
    }

    await db.collection('categories').doc(id).delete();
    await deleteHostedImage(doc.data()?.image as string | undefined);
    revalidateStorefrontCategories();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
