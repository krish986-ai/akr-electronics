import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { STANDARD_WARRANTY } from '@/lib/mock/products';
import { imageUrlSchema } from '@/lib/validation/image-validation';
import { deleteHostedImage } from '@/lib/storage/cleanup';
import { revalidatePath } from 'next/cache';

function revalidateStorefrontProducts() {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/new-arrivals');
}

const productUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
  sku: z.string().min(2).max(50).optional(),
  image: imageUrlSchema.optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().nullable().optional(),
  gstRate: z.number().min(0).max(28).optional(),
  category: z.string().min(1).optional(),
  categorySlug: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  brandSlug: z.string().min(1).optional(),
  description: z.string().min(10).max(5000).optional(),
  specifications: z.record(z.string()).optional(),
  features: z.array(z.string()).optional(),
  packageIncludes: z.array(z.string()).optional(),
  warrantyDays: z.number().int().min(0).optional(),
  countryOfOrigin: z.string().min(2).optional(),
  stock: z.number().int().min(0).optional(),
  isNew: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await props.params;
  try {
    const body = await request.json();
    const input = productUpdateSchema.parse(body);
    const db = getAdminDb();

    const ref = db.collection('products').doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { warrantyDays, originalPrice, ...rest } = input;
    const update: Record<string, unknown> = { ...rest };
    if (warrantyDays !== undefined) {
      update.warranty = { ...STANDARD_WARRANTY, ...(doc.data()?.warranty ?? {}), days: warrantyDays };
    }
    if (originalPrice !== undefined) {
      update.originalPrice = originalPrice;
    }

    const oldImage = doc.data()?.image as string | undefined;
    await ref.update(update);
    if (input.image && oldImage && input.image !== oldImage) {
      await deleteHostedImage(oldImage);
    }
    revalidateStorefrontProducts();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await props.params;
  try {
    const ref = getAdminDb().collection('products').doc(id);
    const doc = await ref.get();
    await ref.delete();
    await deleteHostedImage(doc.data()?.image as string | undefined);
    revalidateStorefrontProducts();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
