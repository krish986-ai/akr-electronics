import { z } from 'zod';

export const imageUploadSchema = z.object({
  category: z.enum(['products', 'categories', 'brands', 'kits', 'banners', 'website', 'avatars']),
  file: z.instanceof(Buffer).or(z.instanceof(File)),
  name: z.string().max(100).optional(),
});

export type ImageUploadInput = z.infer<typeof imageUploadSchema>;

export const validateImageFile = (file: any): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!file) {
    return { isValid: false, error: 'File is required' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: `File size exceeds 5MB limit` };
  }

  if (!allowedMimes.includes(file.type)) {
    return { isValid: false, error: `File type not allowed. Allowed: ${allowedMimes.join(', ')}` };
  }

  return { isValid: true };
};
