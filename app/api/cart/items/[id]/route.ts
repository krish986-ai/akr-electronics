import { NextRequest, NextResponse } from 'next/server';
import { CartRepository } from '@/lib/firestore/repositories';

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    const cartItem = await CartRepository.updateItem(userId, id, quantity);

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: cartItem,
    });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart', details: error instanceof Error ? error.message : '' },
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
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await CartRepository.removeItem(userId, id);

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
