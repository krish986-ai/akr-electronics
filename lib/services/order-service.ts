import { prisma } from '@/lib/prisma';
import { CreateOrderInput } from '@/lib/validation/checkout-validation';
import { InventoryService } from './inventory-service';
import { Prisma } from '@prisma/client';

export class OrderService {
  static async createOrder(userId: string, data: CreateOrderInput) {
    const orderNumber = this.generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        orderStatus: 'PENDING',
        paymentStatus: 'PENDING',
        shippingStatus: 'PENDING',
        shippingAddressId: data.shippingAddressId,
        billingAddressId: data.billingAddressId,
        subtotal: new Prisma.Decimal(data.subtotal),
        tax: new Prisma.Decimal(data.tax),
        shippingCost: new Prisma.Decimal(data.shippingCost),
      },
    });

    await Promise.all(
      data.cartItems.map(item =>
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId || null,
            kitId: item.kitId || null,
            quantity: item.quantity,
            price: new Prisma.Decimal(item.price),
          },
        })
      )
    );

    await Promise.all(
      data.cartItems.map(item =>
        InventoryService.updateStock(
          item.productId || '',
          -item.quantity,
          'PURCHASE',
          `Order ${orderNumber}`,
          order.id
        ).catch(() => null)
      )
    );

    return this.getOrderById(order.id);
  }

  static async getOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { name: true, sku: true } },
            kit: { select: { name: true } },
          },
        },
        user: { select: { name: true, email: true } },
        shippingAddress: true,
        billingAddress: true,
      },
    });
  }

  static async getUserOrders(userId: string, limit: number = 10) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        items: {
          select: { quantity: true, price: true },
        },
      },
    });
  }

  static async updateOrderStatus(orderId: string, status: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status as any },
    });
  }

  static async updatePaymentStatus(orderId: string, status: string, paymentId?: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: status as any,
        paymentId: paymentId || undefined,
      },
    });
  }

  static async updateShippingStatus(orderId: string, status: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { shippingStatus: status as any },
    });
  }

  static async cancelOrder(orderId: string) {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    await Promise.all(
      order.items.map(item =>
        InventoryService.releaseReservedStock(
          item.productId || '',
          item.quantity
        ).catch(() => null)
      )
    );

    return prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: 'CANCELLED' },
    });
  }

  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }
}
