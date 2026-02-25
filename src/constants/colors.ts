export const Colors = {
  light: {
    primary: '#2563eb',
    primaryForeground: '#ffffff',
    secondary: '#64748b',
    secondaryForeground: '#ffffff',
    background: '#ffffff',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#2563eb',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    accent: '#f1f5f9',
    accentForeground: '#0f172a',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    success: '#22c55e',
    successForeground: '#ffffff',
    warning: '#f59e0b',
    warningForeground: '#ffffff',
  },
  dark: {
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#475569',
    secondaryForeground: '#ffffff',
    background: '#0f172a',
    foreground: '#f8fafc',
    card: '#1e293b',
    cardForeground: '#f8fafc',
    border: '#334155',
    input: '#334155',
    ring: '#3b82f6',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    accent: '#1e293b',
    accentForeground: '#f8fafc',
    destructive: '#dc2626',
    destructiveForeground: '#ffffff',
    success: '#16a34a',
    successForeground: '#ffffff',
    warning: '#d97706',
    warningForeground: '#ffffff',
  },
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
} as const

export type ColorScheme = keyof typeof Colors
export type SpacingKey = keyof typeof Spacing
export type FontSizeKey = keyof typeof FontSizes
export type BorderRadiusKey = keyof typeof BorderRadius
export type ShadowKey = keyof typeof Shadows
