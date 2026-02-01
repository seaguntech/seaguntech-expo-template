import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/colors'
import { mmkvStorage, STORAGE_KEYS } from '@/shared/lib/storage'
import type { Theme, ThemeColors, ThemeContextValue, ThemeMode } from '@/types'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Appearance, useColorScheme as useDeviceColorScheme } from 'react-native'

const ThemeContext = createContext<ThemeContextValue | null>(null)

const getStoredThemeMode = (): ThemeMode => {
  const stored = mmkvStorage.getString(STORAGE_KEYS.THEME_MODE)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const deviceColorScheme = useDeviceColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredThemeMode)

  // Determine if dark mode is active
  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return deviceColorScheme === 'dark'
    }
    return themeMode === 'dark'
  }, [themeMode, deviceColorScheme])

  // Get colors based on current mode
  const colors: ThemeColors = useMemo(() => {
    return isDark ? Colors.dark : Colors.light
  }, [isDark])

  // Build complete theme object
  const theme: Theme = useMemo(
    () => ({
      mode: themeMode,
      colors,
      spacing: Spacing,
      fontSizes: FontSizes,
      borderRadius: BorderRadius,
      isDark,
    }),
    [themeMode, colors, isDark],
  )

  // Set theme mode and persist
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode)
    mmkvStorage.setString(STORAGE_KEYS.THEME_MODE, mode)
  }, [])

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? 'light' : 'dark')
  }, [isDark, setThemeMode])

  // Sync with device color scheme changes when in system mode
  useEffect(() => {
    if (themeMode === 'system') {
      // Theme will update automatically via isDark memo
    }
  }, [deviceColorScheme, themeMode])

  // Sync with React Native Appearance to update CSS variables
  useEffect(() => {
    // Update React Native's Appearance to trigger NativeWind CSS updates
    if (process.env.EXPO_OS !== 'web') {
      // Force the appearance to match our theme
      Appearance.setColorScheme(isDark ? 'dark' : 'light')
    }
  }, [isDark])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themeMode,
      isDark,
      setThemeMode,
      toggleTheme,
      colors,
    }),
    [theme, themeMode, isDark, setThemeMode, toggleTheme, colors],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

// Alias for backward compatibility
export const useTheme = useThemeContext

// Convenience hooks
export function useColors(): ThemeColors {
  const { colors } = useThemeContext()
  return colors
}

export function useIsDark(): boolean {
  const { isDark } = useThemeContext()
  return isDark
}

export { ThemeContext }
