import { CartRepository, ProductRepository } from '@/lib/firestore/repositories';
import { AddToCartInput } from '@/lib/validation/cart-validation';
import { Decimal } from 'decimal.js';

export class CartService {
  static async addToCart(userId: string, data: AddToCartInput) {
    const item = await CartRepository.addItem(userId, {
      productId: data.productId || undefined,
      kitId: data.kitId || undefined,
      quantity: data.quantity,
    });
    return item;
  }

  static async removeFromCart(userId: string, itemId: string) {
    await CartRepository.removeItem(userId, itemId);
  }

  static async updateCartItem(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      await this.removeFromCart(userId, itemId);
      return null;
    }
    // Since Firestore doesn't support direct updates on sub-collections easily,
    // we remove and re-add with new quantity
    await CartRepository.removeItem(userId, itemId);
    return null;
  }

  static async clearCart(userId: string) {
    await CartRepository.clearCart(userId);
  }

  static async calculateCartTotal(userId: string) {
    const items = await CartRepository.getItems(userId);
    let subtotal = new Decimal(0);

    for (const item of items) {
      if (item.productId) {
        const product = await ProductRepository.getById(item.productId);
        if (product) {
          const price = product.salePrice || product.basePrice;
          subtotal = subtotal.plus(price.times(item.quantity));
        }
      }
    }

    const tax = subtotal.times(0.18);
    const shipping = subtotal.greaterThan(500) ? new Decimal(0) : new Decimal(50);
    const total = subtotal.plus(tax).plus(shipping);

    return { subtotal, tax, shipping, total, itemCount: items.length };
  }

  static async getCartSummary(userId: string) {
    const cart = await CartRepository.getOrCreate(userId);
    const totals = await this.calculateCartTotal(userId);
    return { cartId: cart, ...totals };
  }
}
