import { NextRequest, NextResponse } from 'next/server';
import { CartRepository } from '@/lib/firestore/repositories';
import { ProductRepository } from '@/lib/firestore/repositories';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, kitId, quantity } = body;

    if (!productId && !kitId) {
      return NextResponse.json({ error: 'Product or Kit ID required' }, { status: 400 });
    }

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    if (productId) {
      const product = await ProductRepository.getById(productId);
      if (!product || product.stock < quantity) {
        return NextResponse.json({ error: 'Product not available or insufficient stock' }, { status: 400 });
      }
    }

    const cartItem = await CartRepository.addItem(userId, {
      productId,
      kitId,
      quantity,
    });

    return NextResponse.json(
      { success: true, data: cartItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await CartRepository.getItems(userId);

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Get cart items error:', error);
    return NextResponse.json(
      { error: 'Failed to get cart items' },
      { status: 500 }
    );
  }
}
