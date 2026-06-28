import { z } from 'zod';

export const createAddressSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  phone: z.string().min(10, 'Valid phone is required').max(15),
  email: z.string().email('Valid email is required'),
  street: z.string().min(5, 'Street address is required').max(255),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  postalCode: z.string().min(5, 'Postal code is required').max(20),
  country: z.string().min(2).default('India'),
  isDefault: z.boolean().default(false),
  type: z.enum(['HOME', 'OFFICE', 'OTHER']).default('HOME'),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
