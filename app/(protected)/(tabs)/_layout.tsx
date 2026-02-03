import { useSidebar, useTheme as useThemeContext } from '@/shared/context'
import { IconSymbol } from '@/shared/ui'
import { HapticTab } from '@/shared/ui/haptic-tab'
import { Pressable } from '@/tw'
import { Tabs } from 'expo-router'

export default function TabLayout() {
  const { colors } = useThemeContext()
  const { toggle } = useSidebar()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.foreground,
        headerShadowVisible: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? 'house.fill' : 'house'} color={color} size={24} />
          ),
          tabBarButtonTestID: 'tab-home',
          headerLeft: () => (
            <Pressable onPress={toggle} className="ml-4">
              <IconSymbol name="line.3.horizontal" color={colors.foreground} size={24} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name={focused ? 'checkmark.circle.fill' : 'checkmark.circle'}
              color={color}
              size={24}
            />
          ),
          tabBarButtonTestID: 'tab-tasks',
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name={focused ? 'bubble.left.and.bubble.right.fill' : 'bubble.left.and.bubble.right'}
              color={color}
              size={24}
            />
          ),
          tabBarButtonTestID: 'tab-ai',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name={focused ? 'person.circle.fill' : 'person.circle'}
              color={color}
              size={24}
            />
          ),
          tabBarButtonTestID: 'tab-profile',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? 'gear' : 'gear'} color={color} size={24} />
          ),
          tabBarButtonTestID: 'tab-settings',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: 'Notifications',
        }}
      />
      <Tabs.Screen
        name="offline"
        options={{
          href: null,
          title: 'Offline',
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          href: null,
          title: 'Payment',
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          href: null,
          title: 'Premium',
          tabBarButtonTestID: 'tab-premium',
        }}
      />
    </Tabs>
  )
}
