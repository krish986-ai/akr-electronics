import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { updateProductSchema } from '@/lib/validation/product-validation';
import { z } from 'zod';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const product = await ProductService.getProductById(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const body = await req.json();
    const validated = updateProductSchema.parse(body);
    const product = await ProductService.updateProduct(id, validated);
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    await ProductService.deleteProduct(id);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
