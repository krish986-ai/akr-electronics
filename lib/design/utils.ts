// Design System Utilities

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Variant utilities
export const buttonVariants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700',
  outline: 'border border-neutral-300 text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100',
  ghost: 'text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200',
  danger: 'bg-error text-white hover:bg-red-600 active:bg-red-700',
};

export const buttonSizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

export const inputVariants = {
  default: 'border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500',
  filled: 'border-0 bg-neutral-100 text-neutral-900 placeholder:text-neutral-500',
  flushed: 'border-0 border-b border-neutral-300 bg-transparent text-neutral-900 placeholder:text-neutral-500',
};

export const cardVariants = {
  default: 'bg-white border border-neutral-200 rounded-lg shadow-sm',
  elevated: 'bg-white rounded-lg shadow-md',
  outlined: 'bg-transparent border border-neutral-200 rounded-lg',
  flat: 'bg-neutral-50 rounded-lg',
};

export const badgeVariants = {
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-secondary-100 text-secondary-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  neutral: 'bg-neutral-100 text-neutral-800',
};

// Focus styles for accessibility
export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';

// Responsive utilities
export const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export const gridCols = {
  auto: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  products: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  features: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};
