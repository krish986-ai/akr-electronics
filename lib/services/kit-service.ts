import { prisma } from '@/lib/prisma';
import { CreateKitInput, UpdateKitInput, KitFilterInput } from '@/lib/validation/kit-validation';
import { Prisma } from '@prisma/client';

export class KitService {
  static async createKit(data: CreateKitInput & { slug?: string }) {
    const slug = data.slug || this.generateSlug(data.name);

    const kit = await prisma.iotKit.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        basePrice: new Prisma.Decimal(data.basePrice),
        salePrice: data.salePrice ? new Prisma.Decimal(data.salePrice) : null,
        discountPercent: data.discountPercent,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        isFeatured: data.isFeatured,
        visibility: data.visibility,
        status: data.status,
      },
    });

    // Add products to kit
    await Promise.all(
      data.products.map(p =>
        prisma.kitProduct.create({
          data: {
            kitId: kit.id,
            productId: p.productId,
            quantity: p.quantity,
          },
        })
      )
    );

    return this.getKitById(kit.id);
  }

  static async getKitById(id: string) {
    return prisma.iotKit.findUnique({
      where: { id },
      include: {
        products: {
          include: { product: { include: { category: true } } },
        },
        images: { orderBy: { displayOrder: 'asc' } },
      },
    });
  }

  static async getKitBySlug(slug: string) {
    return prisma.iotKit.findUnique({
      where: { slug },
      include: {
        products: {
          include: { product: { include: { category: true } } },
        },
        images: { orderBy: { displayOrder: 'asc' } },
      },
    });
  }

  static async updateKit(id: string, data: UpdateKitInput) {
    const updateData: any = {
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription,
      basePrice: data.basePrice ? new Prisma.Decimal(data.basePrice) : undefined,
      salePrice: data.salePrice !== undefined ? (data.salePrice ? new Prisma.Decimal(data.salePrice) : null) : undefined,
      discountPercent: data.discountPercent,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      seoKeywords: data.seoKeywords,
      isFeatured: data.isFeatured,
      visibility: data.visibility,
      status: data.status,
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    // Update products if provided
    if (data.products) {
      await prisma.kitProduct.deleteMany({ where: { kitId: id } });
      await Promise.all(
        data.products.map(p =>
          prisma.kitProduct.create({
            data: { kitId: id, productId: p.productId, quantity: p.quantity },
          })
        )
      );
    }

    return prisma.iotKit.update({
      where: { id },
      data: updateData,
      include: {
        products: { include: { product: true } },
      },
    });
  }

  static async deleteKit(id: string) {
    return prisma.iotKit.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  static async listKits(filters: KitFilterInput) {
    const where: Prisma.IotKitWhereInput = { isDeleted: false };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
    if (filters.status) where.status = filters.status;

    const skip = (filters.page - 1) * filters.limit;
    const orderBy: Prisma.IotKitOrderByWithRelationInput = {};
    orderBy[filters.sortBy] = filters.sortOrder;

    const [kits, total] = await Promise.all([
      prisma.iotKit.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy,
        include: { products: { include: { product: true } } },
      }),
      prisma.iotKit.count({ where }),
    ]);

    return {
      kits,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        pages: Math.ceil(total / filters.limit),
      },
    };
  }

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
}
