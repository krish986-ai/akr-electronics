import { z } from 'zod';

export const imageUploadSchema = z.object({
  category: z.enum(['products', 'categories', 'brands', 'kits', 'banners', 'website', 'avatars']),
  file: z.instanceof(Buffer).or(z.instanceof(File)),
  name: z.string().max(100).optional(),
});

export type ImageUploadInput = z.infer<typeof imageUploadSchema>;

export const MAX_IMAGE_SIZE_KB = 400;

export const validateImageFile = (file: any): { isValid: boolean; error?: string } => {
  const maxSize = MAX_IMAGE_SIZE_KB * 1024;

  if (!file) {
    return { isValid: false, error: 'File is required' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: `Image must be under ${MAX_IMAGE_SIZE_KB} KB` };
  }

  if (typeof file.type !== 'string' || !file.type.startsWith('image/')) {
    return { isValid: false, error: 'Only image files are allowed' };
  }

  return { isValid: true };
};
