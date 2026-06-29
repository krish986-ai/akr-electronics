import { ProductRepository, Product } from '@/lib/firestore/repositories';
import { CreateProductInput, UpdateProductInput, ProductFilterInput } from '@/lib/validation/product-validation';
import { Decimal } from 'decimal.js';

export class ProductService {
  static async createProduct(data: CreateProductInput & { slug?: string; sku?: string }): Promise<Product> {
    const slug = data.slug || this.generateSlug(data.name);
    const sku = data.sku || this.generateSKU();

    return ProductRepository.create({
      name: data.name,
      slug,
      sku,
      description: data.description,
      shortDescription: data.shortDescription,
      basePrice: new Decimal(data.basePrice),
      salePrice: data.salePrice ? new Decimal(data.salePrice) : undefined,
      discountPercent: data.discountPercent || undefined,
      stock: data.stock,
      lowStockLimit: data.lowStockLimit || 10,
      categoryId: data.categoryId,
      brandId: data.brandId || undefined,
      isFeatured: data.isFeatured || false,
      isNewArrival: data.isNewArrival || false,
      isBestseller: data.isBestseller || false,
      visibility: data.visibility || 'DRAFT',
      status: data.status || 'ACTIVE',
      isDeleted: false,
      viewCount: 0,
      displayOrder: 0,
    });
  }

  static async getProductById(id: string): Promise<Product | null> {
    return ProductRepository.getById(id);
  }

  static async updateProduct(id: string, data: UpdateProductInput): Promise<Product | null> {
    const updates: Partial<Product> = {};
    if (data.name) updates.name = data.name;
    if (data.description) updates.description = data.description;
    if (data.basePrice) updates.basePrice = new Decimal(data.basePrice);
    if (data.salePrice) updates.salePrice = new Decimal(data.salePrice);
    if (data.stock !== undefined) updates.stock = data.stock;
    if (data.categoryId) updates.categoryId = data.categoryId;
    if (data.status) updates.status = data.status;
    if (data.visibility) updates.visibility = data.visibility;
    if (data.isFeatured !== undefined) updates.isFeatured = data.isFeatured;

    updates.updatedAt = new Date();
    await ProductRepository.update(id, updates);
    return ProductRepository.getById(id);
  }

  static async deleteProduct(id: string): Promise<void> {
    await ProductRepository.update(id, { isDeleted: true });
  }

  static async publishProduct(id: string): Promise<void> {
    await ProductRepository.update(id, { visibility: 'PUBLIC' });
  }

  static async listProducts(filters: Partial<ProductFilterInput> = {}): Promise<{ products: Product[]; total: number; page: number; pages: number }> {
    const result = await ProductRepository.list({
      limit: filters.limit || 20,
      page: filters.page || 1,
      sortBy: (filters.sortBy as any) || 'createdAt',
      sortOrder: (filters.sortOrder as any) || 'desc',
      categoryId: filters.categoryId,
      brandId: filters.brandId,
      isFeatured: filters.isFeatured,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      status: filters.status as any,
    });
    return {
      products: result.products || [],
      total: result.total || 0,
      page: result.page || 1,
      pages: result.pages || 1
    };
  }

  static async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    const result = await ProductRepository.list({
      limit,
      page: 1,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    return (result.products || []).filter((p: Product) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase())
    );
  }

  private static generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  private static generateSKU(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SKU-${timestamp}-${random}`;
  }
}
