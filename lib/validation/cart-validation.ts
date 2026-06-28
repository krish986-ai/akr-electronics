import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().optional().nullable(),
  kitId: z.string().optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(999),
}).refine((data) => data.productId || data.kitId, {
  message: 'Either productId or kitId is required',
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be at least 0').max(999),
});

export const removeFromCartSchema = z.object({
  itemId: z.string().min(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
