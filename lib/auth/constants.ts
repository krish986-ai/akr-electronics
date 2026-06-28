export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

export const PROTECTED_ROUTES = {
  CUSTOMER_PREFIX: '/',
  ADMIN_PREFIX: '/admin',
} as const;

export const PUBLIC_ROUTES = [
  '/',
  '/shop',
  '/products',
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.FORGOT_PASSWORD,
] as const;

export const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/products',
  '/admin/orders',
  '/admin/users',
  '/admin/settings',
] as const;

export const SESSION_COOKIE = 'akr-session';
export const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
