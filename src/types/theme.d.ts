export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeColors {
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  background: string
  foreground: string
  card: string
  cardForeground: string
  border: string
  input: string
  ring: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  success: string
  successForeground: string
  warning: string
  warningForeground: string
}

export interface ThemeSpacing {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
  '3xl': number
}

export interface ThemeFontSizes {
  xs: number
  sm: number
  base: number
  lg: number
  xl: number
  '2xl': number
  '3xl': number
  '4xl': number
}

export interface ThemeBorderRadius {
  none: number
  sm: number
  md: number
  lg: number
  xl: number
  full: number
}

export interface Theme {
  mode: ThemeMode
  colors: ThemeColors
  spacing: ThemeSpacing
  fontSizes: ThemeFontSizes
  borderRadius: ThemeBorderRadius
  isDark: boolean
}

export interface ThemeContextValue {
  theme: Theme
  themeMode: ThemeMode
  isDark: boolean
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
  colors: ThemeColors
}
