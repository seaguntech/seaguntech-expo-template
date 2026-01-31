import { initI18n, isI18nReady } from '@/config/i18n'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native'
import { QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'

import {
  AuthProvider,
  RevenueCatProvider,
  SidebarProvider,
  StripeProvider,
  ThemeProvider,
  useTheme,
} from '@/shared/context'
import { queryClient } from '@/shared/lib/query-client'
import { useEffect, useState } from 'react'

function RootLayoutNav() {
  const { isDark } = useTheme()

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  )
}

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(isI18nReady())

  // Initialize i18n asynchronously
  useEffect(() => {
    if (!i18nReady) {
      initI18n().then(() => setI18nReady(true))
    }
  }, [i18nReady])

  // Hide splash screen once ready
  useEffect(() => {
    if (i18nReady) {
      SplashScreen.hideAsync().catch(() => {})
    }
  }, [i18nReady])

  // Wait for i18n before rendering
  if (!i18nReady) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <RevenueCatProvider>
                <StripeProvider>
                  <SidebarProvider>
                    <RootLayoutNav />
                  </SidebarProvider>
                </StripeProvider>
              </RevenueCatProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
