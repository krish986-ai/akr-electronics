import { prisma } from '@/lib/prisma';

export class WishlistService {
  static async addToWishlist(userId: string, productId?: string, kitId?: string) {
    if (!productId && !kitId) throw new Error('Product or Kit ID required');

    return prisma.wishlistItem.create({
      data: { userId, productId: productId || null, kitId: kitId || null },
    }).catch(() => null);
  }

  static async removeFromWishlist(userId: string, itemId: string) {
    return prisma.wishlistItem.delete({
      where: { id: itemId, userId },
    }).catch(() => null);
  }

  static async getWishlist(userId: string) {
    return prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: { select: { id: true, name: true, basePrice: true, thumbnailImage: true } },
        kit: { select: { id: true, name: true, basePrice: true, thumbnailImage: true } },
      },
    });
  }

  static async clearWishlist(userId: string) {
    return prisma.wishlistItem.deleteMany({
      where: { userId },
    });
  }

  static async moveToCart(userId: string, itemId: string) {
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: { id: itemId, userId },
    });

    if (!wishlistItem) throw new Error('Wishlist item not found');

    return {
      productId: wishlistItem.productId,
      kitId: wishlistItem.kitId,
    };
  }
}
