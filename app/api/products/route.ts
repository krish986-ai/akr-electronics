import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const categoryId = searchParams.get('categoryId') || undefined;
    const brandId = searchParams.get('brandId') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as any;
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as any;

    const result = await ProductService.listProducts({
      page,
      limit,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: result.products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        shortDescription: p.shortDescription,
        thumbnailImage: p.thumbnailImage,
        basePrice: p.basePrice.toString(),
        salePrice: p.salePrice?.toString(),
        discountPercent: p.discountPercent,
        stock: p.stock,
        categoryId: p.categoryId,
        brandId: p.brandId,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestseller: p.isBestseller,
        visibility: p.visibility,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      pagination: {
        page: result.page,
        limit: result.pages > 0 ? limit : 0,
        total: result.total,
        pages: result.pages,
      },
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
