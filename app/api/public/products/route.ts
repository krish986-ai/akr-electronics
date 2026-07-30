import { NextRequest, NextResponse } from 'next/server';
import { queryServerProducts } from '@/lib/data/server-catalog';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const maxPrice = params.get('maxPrice');

  const result = await queryServerProducts({
    search: params.get('search') ?? undefined,
    category: params.get('category') ?? undefined,
    brand: params.get('brand') ?? undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort: params.get('sort') ?? undefined,
    page: Number(params.get('page') ?? '1') || 1,
    pageSize: Number(params.get('pageSize') ?? '12') || 12,
  });

  const response = NextResponse.json(result);
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return response;
}
