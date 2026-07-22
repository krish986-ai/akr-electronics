import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';

// The product editor needs the exact catalog managed in Admin. Reading through
// the Admin SDK keeps its category and brand selectors in sync with saves.
export async function GET(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const db = getAdminDb();
    const [categories, brands] = await Promise.all([
      db.collection('categories').get(),
      db.collection('brands').get(),
    ]);

    const response = NextResponse.json({
      categories: categories.docs.map(category => ({ id: category.id, ...category.data() })),
      brands: brands.docs.map(brand => ({ id: brand.id, ...brand.data() })),
    });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to load catalog options' }, { status: 500 });
  }
}
