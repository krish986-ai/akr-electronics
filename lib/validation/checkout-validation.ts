import { z } from 'zod';

export const checkoutSchema = z.object({
  shippingAddressId: z.string().min(1, 'Shipping address is required'),
  billingAddressId: z.string().min(1, 'Billing address is required'),
  shippingMethodId: z.string().min(1, 'Shipping method is required'),
  notes: z.string().max(500).optional(),
});

export const createOrderSchema = checkoutSchema.extend({
  cartItems: z.array(z.object({
    productId: z.string().optional().nullable(),
    kitId: z.string().optional().nullable(),
    quantity: z.number().int().min(1),
    price: z.number().min(0),
  })).min(1, 'Cart must have at least one item'),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  shippingCost: z.number().min(0),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
