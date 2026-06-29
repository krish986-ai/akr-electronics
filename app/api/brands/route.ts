import { NextRequest, NextResponse } from 'next/server';
import { BrandService } from '@/lib/services/brand-service';

export async function GET(req: NextRequest) {
  try {
    const brands = await BrandService.listBrands();

    return NextResponse.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error('Fetch brands error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, logo, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const brand = await BrandService.createBrand({
      name,
      slug,
      logo,
      description,
    });

    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error) {
    console.error('Create brand error:', error);
    return NextResponse.json(
      { error: 'Failed to create brand', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
