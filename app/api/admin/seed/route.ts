import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import {
  products,
  brands,
  categoryTree,
  iotKits,
  coupons,
  productReviews,
  productQuestions,
} from '@/lib/mock/products';

// One-time catalog seeding into Firestore.
// POST /api/admin/seed with header `x-seed-key: <SESSION_SECRET>`.
export async function POST(request: NextRequest) {
  const seedKey = request.headers.get('x-seed-key');
  if (!process.env.SESSION_SECRET || seedKey !== process.env.SESSION_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
    return NextResponse.json(
      { success: false, error: 'Firebase Admin credentials not configured' },
      { status: 503 }
    );
  }

  try {
    const db = getAdminDb();
    const batch = db.batch();

    for (const p of products) {
      batch.set(db.collection('products').doc(p.id), p);
    }
    for (const b of brands) {
      batch.set(db.collection('brands').doc(b.id), b);
    }
    for (const c of categoryTree) {
      batch.set(db.collection('categories').doc(c.id), c);
    }
    for (const kit of iotKits) {
      batch.set(db.collection('kits').doc(kit.id), kit);
    }
    for (const coupon of coupons) {
      batch.set(db.collection('coupons').doc(coupon.code), coupon);
    }
    for (const review of productReviews) {
      batch.set(db.collection('reviews').doc(review.id), review);
    }
    for (const question of productQuestions) {
      batch.set(db.collection('questions').doc(question.id), question);
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      seeded: {
        products: products.length,
        brands: brands.length,
        categories: categoryTree.length,
        kits: iotKits.length,
        coupons: coupons.length,
        reviews: productReviews.length,
        questions: productQuestions.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Seeding failed' },
      { status: 500 }
    );
  }
}
