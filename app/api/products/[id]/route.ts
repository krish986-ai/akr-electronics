import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { ReviewRepository } from '@/lib/firestore/repositories';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const product = await ProductService.getProductById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const reviews = await ReviewRepository.listByProduct(id, 10);

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        basePrice: product.basePrice.toString(),
        salePrice: product.salePrice?.toString(),
        reviews,
      },
    });
  } catch (error) {
    console.error('Fetch product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error instanceof Error ? error.message : '' },
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
    const {
      name,
      description,
      shortDescription,
      basePrice,
      salePrice,
      discountPercent,
      stock,
      categoryId,
      brandId,
      status,
      visibility,
      isFeatured,
      isNewArrival,
      isBestseller,
    } = body;

    const product = await ProductService.updateProduct(id, {
      name,
      description,
      shortDescription,
      basePrice,
      salePrice,
      discountPercent,
      stock,
      categoryId,
      brandId,
      status,
      visibility,
      isFeatured,
      isNewArrival,
      isBestseller,
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        basePrice: product.basePrice.toString(),
        salePrice: product.salePrice?.toString(),
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error instanceof Error ? error.message : '' },
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

    await ProductService.deleteProduct(id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
