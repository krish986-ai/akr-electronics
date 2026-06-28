// Authentication validation schemas

import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

export const phoneSchema = z.string().regex(/^[+\d\-().\s]{10,}$/, 'Invalid phone number').optional();

// Registration validation
export const registerSchema = z
  .object({
    email: emailSchema,
    name: nameSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Password reset request
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

// Confirm password reset
export const passwordResetConfirmSchema = z
  .object({
    code: z.string().min(1, 'Reset code is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;

// Profile update validation
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema,
  image: z.string().url('Invalid image URL').optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
