import { WishlistRepository } from '@/lib/firestore/repositories';

export class WishlistService {
  static async addToWishlist(userId: string, productId?: string, kitId?: string) {
    if (!productId && !kitId) throw new Error('Product or Kit ID required');
    return WishlistRepository.add(userId, productId, kitId);
  }

  static async removeFromWishlist(userId: string, itemId: string) {
    await WishlistRepository.remove(userId, itemId);
  }

  static async getWishlist(userId: string) {
    return WishlistRepository.getItems(userId);
  }

  static async clearWishlist(userId: string) {
    const items = await WishlistRepository.getItems(userId);
    for (const item of items) {
      await WishlistRepository.remove(userId, item.id);
    }
  }
}
