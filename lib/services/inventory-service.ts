import { prisma } from '@/lib/prisma';
import { InventoryReason } from '@prisma/client';

export class InventoryService {
  static async updateStock(
    productId: string,
    quantityChange: number,
    reason: InventoryReason,
    notes?: string,
    orderId?: string
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found');

    const newStock = product.stock + quantityChange;
    if (newStock < 0) throw new Error('Insufficient stock');

    await Promise.all([
      prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      }),
      prisma.inventoryHistory.create({
        data: {
          productId,
          quantityChange,
          previousStock: product.stock,
          newStock,
          reason,
          notes,
          orderId,
        },
      }),
    ]);

    return { previousStock: product.stock, newStock };
  }

  static async reserveStock(productId: string, quantity: number) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found');
    if (product.stock - product.reservedStock < quantity) throw new Error('Insufficient stock');

    return prisma.product.update({
      where: { id: productId },
      data: { reservedStock: { increment: quantity } },
    });
  }

  static async releaseReservedStock(productId: string, quantity: number) {
    return prisma.product.update({
      where: { id: productId },
      data: { reservedStock: { decrement: quantity } },
    });
  }

  static async getLowStockProducts(limit: number = 10) {
    return prisma.product.findMany({
      where: {
        isDeleted: false,
        stock: { lte: prisma.raw('low_stock_limit') },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        lowStockLimit: true,
      },
      take: limit,
      orderBy: { stock: 'asc' },
    });
  }

  static async getInventoryHistory(productId: string, limit: number = 50) {
    return prisma.inventoryHistory.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
