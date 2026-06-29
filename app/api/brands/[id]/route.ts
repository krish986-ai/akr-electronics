import { NextRequest, NextResponse } from 'next/server';
import { BrandService } from '@/lib/services/brand-service';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const brand = await BrandService.getBrandById(id);

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error('Fetch brand error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, logo, description, status, isFeatured } = body;

    const brand = await BrandService.updateBrand(id, {
      name,
      logo,
      description,
      status,
      isFeatured,
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error('Update brand error:', error);
    return NextResponse.json(
      { error: 'Failed to update brand', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await BrandService.deleteBrand(id);

    return NextResponse.json({ success: true, message: 'Brand deleted' });
  } catch (error) {
    console.error('Delete brand error:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
