import { prisma } from '@/lib/prisma';
import { CreateProductInput, UpdateProductInput, ProductFilterInput } from '@/lib/validation/product-validation';
import { Prisma } from '@prisma/client';

export class ProductService {
  static async createProduct(data: CreateProductInput & { slug?: string; sku?: string }) {
    const slug = data.slug || this.generateSlug(data.name);
    const sku = data.sku || this.generateSKU(data.categoryId);

    return prisma.product.create({
      data: {
        name: data.name,
        slug,
        sku,
        description: data.description,
        shortDescription: data.shortDescription,
        basePrice: new Prisma.Decimal(data.basePrice),
        salePrice: data.salePrice ? new Prisma.Decimal(data.salePrice) : null,
        discountPercent: data.discountPercent,
        stock: data.stock,
        lowStockLimit: data.lowStockLimit,
        weight: data.weight ? new Prisma.Decimal(data.weight) : null,
        dimensions: data.dimensions,
        specifications: data.specifications,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        isFeatured: data.isFeatured,
        isNewArrival: data.isNewArrival,
        isBestseller: data.isBestseller,
        visibility: data.visibility,
        status: data.status,
      },
      include: { category: true, brand: true },
    });
  }

  static async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { displayOrder: 'asc' } },
        reviews: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  static async getProductBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { displayOrder: 'asc' } },
        reviews: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  static async updateProduct(id: string, data: UpdateProductInput) {
    const updateData: Prisma.ProductUpdateInput = {
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription,
      basePrice: data.basePrice ? new Prisma.Decimal(data.basePrice) : undefined,
      salePrice: data.salePrice !== undefined ? (data.salePrice ? new Prisma.Decimal(data.salePrice) : null) : undefined,
      discountPercent: data.discountPercent,
      stock: data.stock,
      lowStockLimit: data.lowStockLimit,
      weight: data.weight ? new Prisma.Decimal(data.weight) : undefined,
      dimensions: data.dimensions,
      specifications: data.specifications,
      categoryId: data.categoryId,
      brandId: data.brandId,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      seoKeywords: data.seoKeywords,
      isFeatured: data.isFeatured,
      isNewArrival: data.isNewArrival,
      isBestseller: data.isBestseller,
      visibility: data.visibility,
      status: data.status,
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true, brand: true },
    });
  }

  static async deleteProduct(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  static async restoreProduct(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  static async publishProduct(id: string) {
    return prisma.product.update({
      where: { id },
      data: { visibility: 'PUBLIC' },
    });
  }

  static async unpublishProduct(id: string) {
    return prisma.product.update({
      where: { id },
      data: { visibility: 'DRAFT' },
    });
  }

  static async listProducts(filters: ProductFilterInput) {
    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.brandId) where.brandId = filters.brandId;
    if (filters.status) where.status = filters.status;
    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;

    if (filters.minPrice || filters.maxPrice) {
      where.basePrice = {};
      if (filters.minPrice) where.basePrice.gte = new Prisma.Decimal(filters.minPrice);
      if (filters.maxPrice) where.basePrice.lte = new Prisma.Decimal(filters.maxPrice);
    }

    const skip = (filters.page - 1) * filters.limit;
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    orderBy[filters.sortBy] = filters.sortOrder;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, brand: true },
        skip,
        take: filters.limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        pages: Math.ceil(total / filters.limit),
      },
    };
  }

  static async searchProducts(query: string, limit: number = 10) {
    return prisma.product.findMany({
      where: {
        isDeleted: false,
        visibility: 'PUBLIC',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        basePrice: true,
        thumbnailImage: true,
      },
    });
  }

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private static generateSKU(categoryId: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `SKU-${timestamp}-${random}`;
  }
}
