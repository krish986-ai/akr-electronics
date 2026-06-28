// Design System Tokens
// Centralized design constants for the entire application

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#F0F4FF',
    100: '#E0E8FF',
    200: '#C5D5FF',
    300: '#A3BFFF',
    400: '#5E8EFF',
    500: '#0066FF', // Primary
    600: '#0052CC',
    700: '#003D99',
    800: '#002966',
    900: '#001433',
  },

  // Secondary Brand Colors
  secondary: {
    50: '#FFF5F0',
    100: '#FFE8E0',
    200: '#FFC5B3',
    300: '#FFA380',
    400: '#FF844D',
    500: '#FF6B35', // Secondary
    600: '#E55A24',
    700: '#CC481B',
    800: '#99351D',
    900: '#663D26',
  },

  // Accent Colors
  accent: {
    50: '#E0FFFF',
    100: '#B3FFFF',
    200: '#80FFFF',
    300: '#4DFFFF',
    400: '#1AFFFF',
    500: '#00D9FF', // Accent
    600: '#00B8D4',
    700: '#0099CC',
    800: '#007399',
    900: '#004D66',
  },

  // Neutrals
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',

  // Text
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
};

export const typography = {
  fontFamily: {
    sans: 'system-ui, -apple-system, sans-serif',
    mono: 'Menlo, Monaco, Courier New, monospace',
  },

  fontSize: {
    xs: { size: '12px', lineHeight: '16px' },
    sm: { size: '14px', lineHeight: '20px' },
    base: { size: '16px', lineHeight: '24px' },
    lg: { size: '18px', lineHeight: '28px' },
    xl: { size: '20px', lineHeight: '28px' },
    '2xl': { size: '24px', lineHeight: '32px' },
    '3xl': { size: '30px', lineHeight: '36px' },
    '4xl': { size: '36px', lineHeight: '43px' },
    '5xl': { size: '48px', lineHeight: '1' },
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
};

export const borderRadius = {
  none: '0px',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  hide: -1,
  auto: 0,
  base: 1,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  notification: 800,
};

export const animations = {
  fadeIn: 'fadeIn 300ms ease-in-out',
  slideUp: 'slideUp 300ms ease-out',
  slideDown: 'slideDown 300ms ease-out',
  slideLeft: 'slideLeft 300ms ease-out',
  slideRight: 'slideRight 300ms ease-out',
  scaleIn: 'scaleIn 200ms ease-out',
};
