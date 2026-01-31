import { cn } from '@/shared/lib/utils'
import { Pressable, Text, View } from '@/tw'
import React from 'react'

interface HeaderMenuProps {
  children: React.ReactNode
  className?: string
}

export function HeaderMenu({ children, className }: HeaderMenuProps) {
  return <View className={cn('flex-row items-center gap-2', className)}>{children}</View>
}

interface HeaderMenuItemProps {
  icon?: React.ReactNode
  label?: string
  onPress?: () => void
  badge?: number
  disabled?: boolean
  className?: string
}

export function HeaderMenuItem({
  icon,
  label,
  onPress,
  badge,
  disabled = false,
  className,
}: HeaderMenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn('p-2 rounded-full', disabled && 'opacity-50', className)}
    >
      {icon && (
        <View className="relative">
          {icon}
          {badge !== undefined && badge > 0 && (
            <View className="absolute -top-1 -right-1 bg-destructive rounded-full min-w-[16px] h-4 items-center justify-center px-1">
              <Text className="text-[10px] text-destructive-foreground font-bold">
                {badge > 9 ? '9+' : badge}
              </Text>
            </View>
          )}
        </View>
      )}
      {label && !icon && <Text className="text-base text-primary font-medium">{label}</Text>}
    </Pressable>
  )
}
