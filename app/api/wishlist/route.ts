import { NextRequest, NextResponse } from 'next/server';
import { WishlistService } from '@/lib/services/wishlist-service';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wishlist = await WishlistService.getWishlist(userId);
    return NextResponse.json(wishlist);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const item = await WishlistService.addToWishlist(userId, body.productId, body.kitId);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 400 });
  }
}
