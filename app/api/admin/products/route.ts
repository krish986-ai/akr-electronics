import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { STANDARD_WARRANTY, GST_RATE_DEFAULT } from '@/lib/mock/products';
import { imageUrlSchema } from '@/lib/validation/image-validation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CATALOG_TAG } from '@/lib/data/server-catalog';

const productInputSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  sku: z.string().min(2).max(50),
  image: imageUrlSchema,
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  gstRate: z.number().min(0).max(28).default(GST_RATE_DEFAULT),
  category: z.string().min(1),
  categorySlug: z.string().min(1),
  brand: z.string().min(1),
  brandSlug: z.string().min(1),
  description: z.string().min(10).max(5000),
  specifications: z.record(z.string()).default({}),
  features: z.array(z.string()).default([]),
  packageIncludes: z.array(z.string()).optional(),
  warrantyDays: z.number().int().min(0).default(STANDARD_WARRANTY.days),
  countryOfOrigin: z.string().min(2),
  stock: z.number().int().min(0),
  isNew: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isKit: z.boolean().optional(),
  kitItems: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive() })).optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export function toProductDocument(input: ProductInput) {
  const { warrantyDays, ...rest } = input;
  return {
    ...rest,
    warranty: { ...STANDARD_WARRANTY, days: warrantyDays },
    rating: 0,
    reviews: 0,
  };
}

export async function POST(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const body = await request.json();
    const input = productInputSchema.parse(body);
    const db = getAdminDb();

    const existing = await db.collection('products').where('slug', '==', input.slug).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 });
    }

    const ref = db.collection('products').doc();
    await ref.set({ id: ref.id, ...toProductDocument(input) });
    revalidateTag(CATALOG_TAG, 'max');
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/new-arrivals');

    return NextResponse.json({ success: true, id: ref.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
