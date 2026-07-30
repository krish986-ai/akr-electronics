import { NextResponse } from 'next/server';
import { getServerBrands, getServerCategories, getServerProducts } from '@/lib/data/server-catalog';

export async function GET() {
  const [products, categories, brands] = await Promise.all([
    getServerProducts(),
    getServerCategories(),
    getServerBrands(),
  ]);

  const response = NextResponse.json({ products, categories, brands });
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return response;
}
