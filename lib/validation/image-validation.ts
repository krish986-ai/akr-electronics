import { z } from 'zod';

export const imageUploadSchema = z.object({
  category: z.enum(['products', 'categories', 'brands', 'kits', 'banners', 'website', 'avatars']),
  file: z.instanceof(Buffer).or(z.instanceof(File)),
  name: z.string().max(100).optional(),
});

export type ImageUploadInput = z.infer<typeof imageUploadSchema>;

export const MAX_IMAGE_SIZE_KB = 400;

// Product/banner/category images are either external URLs or site-hosted
// upload paths like /api/images/<id>, so plain z.string().url() is too strict.
export const imageUrlSchema = z
  .string()
  .min(1)
  .refine(v => v.startsWith('/') || /^https?:\/\//i.test(v), {
    message: 'Must be an http(s) URL or an uploaded image path',
  });

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
