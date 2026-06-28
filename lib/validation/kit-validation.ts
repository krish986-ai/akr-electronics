import { z } from 'zod';

export const createKitSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().max(500).optional(),
  basePrice: z.number().min(0, 'Price must be positive'),
  salePrice: z.number().min(0).optional().nullable(),
  discountPercent: z.number().min(0).max(100).optional().nullable(),
  products: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
  })).min(1, 'At least one product is required'),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.string().optional(),
  isFeatured: z.boolean().default(false),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'HIDDEN', 'DRAFT']).default('DRAFT'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('ACTIVE'),
});

export const updateKitSchema = createKitSchema.partial();

export const kitFilterSchema = z.object({
  search: z.string().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'basePrice', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateKitInput = z.infer<typeof createKitSchema>;
export type UpdateKitInput = z.infer<typeof updateKitSchema>;
export type KitFilterInput = z.infer<typeof kitFilterSchema>;
