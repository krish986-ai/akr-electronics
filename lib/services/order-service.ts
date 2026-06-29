import { OrderRepository, ProductRepository } from '@/lib/firestore/repositories';
import { CreateOrderInput } from '@/lib/validation/checkout-validation';
import { Decimal } from 'decimal.js';

export class OrderService {
  static async createOrder(userId: string, data: CreateOrderInput) {
    const orderNumber = this.generateOrderNumber();
    const subtotal = new Decimal(data.subtotal);
    const tax = new Decimal(data.tax);
    const shippingCost = new Decimal(data.shippingCost);
    const total = subtotal.plus(tax).plus(shippingCost);

    const order = await OrderRepository.create({
      orderNumber,
      userId,
      shippingAddressId: data.shippingAddressId,
      billingAddressId: data.billingAddressId,
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING',
      subtotal,
      tax,
      shippingCost,
      total,
      shippingStatus: 'PENDING',
      isDeleted: false,
    });

    // Deduct inventory for each product
    for (const item of data.cartItems) {
      if (item.productId) {
        const product = await ProductRepository.getById(item.productId);
        if (product) {
          await ProductRepository.update(item.productId, {
            stock: product.stock - item.quantity,
          });
        }
      }
    }

    return order;
  }

  static async getOrderById(orderId: string) {
    return OrderRepository.getById(orderId);
  }

  static async getUserOrders(userId: string) {
    return OrderRepository.getUserOrders(userId);
  }

  static async updateOrderStatus(orderId: string, status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
    await OrderRepository.updateStatus(orderId, status);
    return OrderRepository.getById(orderId);
  }

  static async cancelOrder(orderId: string) {
    await OrderRepository.updateStatus(orderId, 'CANCELLED');
  }

  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }
}
