import { cn } from '@/shared/lib/utils'
import { Pressable, ScrollView, Text, View } from '@/tw'
import React from 'react'

interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: number
  disabled?: boolean
}

interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
  className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, variant = 'default', className }: TabsProps) {
  const renderTab = (tab: TabItem) => {
    const isActive = tab.id === activeTab
    const isDisabled = tab.disabled

    const baseStyles = 'flex-row items-center justify-center px-4 py-2.5'

    const variantActiveStyles = {
      default: isActive ? 'border-b-2 border-primary' : 'border-b-2 border-transparent',
      pills: isActive ? 'bg-primary rounded-full' : 'bg-transparent rounded-full',
      underline: isActive ? 'border-b-2 border-primary' : 'border-b-2 border-transparent',
    }

    const textActiveStyles = {
      default: isActive ? 'text-primary font-semibold' : 'text-muted-foreground',
      pills: isActive ? 'text-primary-foreground font-semibold' : 'text-muted-foreground',
      underline: isActive ? 'text-foreground font-semibold' : 'text-muted-foreground',
    }

    return (
      <Pressable
        key={tab.id}
        onPress={() => !isDisabled && onTabChange(tab.id)}
        disabled={isDisabled}
        className={cn(baseStyles, variantActiveStyles[variant], isDisabled && 'opacity-50')}
      >
        {tab.icon && <View className="mr-2">{tab.icon}</View>}
        <Text className={cn('text-base', textActiveStyles[variant])}>{tab.label}</Text>
        {tab.badge !== undefined && tab.badge > 0 && (
          <View className="ml-2 bg-destructive rounded-full px-1.5 py-0.5 min-w-[20px] items-center">
            <Text className="text-xs text-destructive-foreground font-medium">
              {tab.badge > 99 ? '99+' : tab.badge}
            </Text>
          </View>
        )}
      </Pressable>
    )
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={cn(
        'border-b border-border',
        variant === 'pills' && 'border-b-0 bg-muted/50 rounded-full p-1',
        className,
      )}
      contentContainerClassName="flex-row"
    >
      {tabs.map(renderTab)}
    </ScrollView>
  )
}
