import { prisma } from '@/lib/prisma';
import { AddToCartInput } from '@/lib/validation/cart-validation';

export class CartService {
  static async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, basePrice: true, salePrice: true } },
            kit: { select: { id: true, name: true, basePrice: true, salePrice: true } },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    return cart;
  }

  static async addToCart(userId: string, data: AddToCartInput) {
    const cart = await this.getOrCreateCart(userId);

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId || null,
        kitId: data.kitId || null,
      },
    });

    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: data.quantity } },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: data.productId || null,
        kitId: data.kitId || null,
        quantity: data.quantity,
      },
      include: {
        product: true,
        kit: true,
      },
    });
  }

  static async removeFromCart(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    return prisma.cartItem.delete({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });
  }

  static async updateCartItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);

    if (quantity <= 0) {
      return this.removeFromCart(userId, itemId);
    }

    return prisma.cartItem.update({
      where: {
        id: itemId,
        cartId: cart.id,
      },
      data: { quantity },
      include: { product: true, kit: true },
    });
  }

  static async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  static async calculateCartTotal(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const items = cart.items;

    let subtotal = 0;
    items.forEach(item => {
      const price = item.product?.salePrice || item.product?.basePrice || item.kit?.salePrice || item.kit?.basePrice || 0;
      subtotal += Number(price) * item.quantity;
    });

    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total, itemCount: items.length };
  }

  static async getCartSummary(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const totals = await this.calculateCartTotal(userId);

    return {
      cart,
      ...totals,
    };
  }
}
