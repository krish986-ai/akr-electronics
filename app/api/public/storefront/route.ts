import { NextResponse } from 'next/server';
import {
  getServerBanners,
  getServerBrands,
  getServerCategories,
  getServerConfig,
} from '@/lib/data/server-catalog';

export async function GET() {
  const [categories, brands, banners, config] = await Promise.all([
    getServerCategories(),
    getServerBrands(),
    getServerBanners(),
    getServerConfig(),
  ]);

  const response = NextResponse.json({ categories, brands, banners, config });
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return response;
}
