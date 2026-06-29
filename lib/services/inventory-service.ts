import { InventoryRepository, ProductRepository } from '@/lib/firestore/repositories';

export class InventoryService {
  static async updateStock(productId: string, quantityChange: number, reason: string, notes?: string) {
    const product = await ProductRepository.getById(productId);
    if (!product) throw new Error('Product not found');
    
    await InventoryRepository.recordHistory(productId, {
      quantityChange,
      reason,
      notes,
    });

    const newStock = Math.max(0, product.stock + quantityChange);
    await ProductRepository.update(productId, { stock: newStock });
  }

  static async getLowStockProducts() {
    const result = await ProductRepository.list({
      limit: 100,
      page: 1,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    return (result.products || []).filter((p: any) => p.stock <= p.lowStockLimit);
  }

  static async releaseReservedStock(productId: string, quantity: number) {
    // Simplified for Firestore
    const product = await ProductRepository.getById(productId);
    if (product) {
      await ProductRepository.update(productId, { stock: product.stock + quantity });
    }
  }
}
