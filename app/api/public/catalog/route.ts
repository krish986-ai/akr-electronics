import { NextResponse } from 'next/server';
import { getServerBrands, getServerCategories, getServerProducts } from '@/lib/data/server-catalog';

export async function GET() {
  const [products, categories, brands] = await Promise.all([
    getServerProducts(),
    getServerCategories(),
    getServerBrands(),
  ]);

  return NextResponse.json({ products, categories, brands });
}
