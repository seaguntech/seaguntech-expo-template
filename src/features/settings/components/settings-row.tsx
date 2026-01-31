import { cn } from '@/shared/lib/utils'
import { Pressable, Text, useCSSVariable, View } from '@/tw'
import type { SettingRow as SettingRowType } from '@/types'
import React from 'react'
import { Switch } from 'react-native'

interface SettingsRowProps {
  row: SettingRowType
  isFirst?: boolean
  isLast?: boolean
}

export function SettingsRow({ row, isFirst, isLast }: SettingsRowProps) {
  const primaryColor = useCSSVariable('--color-primary')
  const mutedColor = useCSSVariable('--color-muted')

  const renderContent = () => {
    switch (row.type) {
      case 'toggle':
        return (
          <Switch
            value={row.value as boolean}
            onValueChange={row.onChange as (value: boolean) => void}
            disabled={row.disabled}
            trackColor={{ false: mutedColor as string, true: primaryColor as string }}
            thumbColor="#ffffff"
          />
        )
      case 'navigation':
        return <Text className="text-muted-foreground">→</Text>
      case 'select':
        return (
          <View className="flex-row items-center">
            <Text className="text-muted-foreground mr-2">{String(row.value ?? '')}</Text>
            <Text className="text-muted-foreground">→</Text>
          </View>
        )
      case 'info':
        return <Text className="text-muted-foreground">{String(row.value ?? '')}</Text>
      case 'button':
        return null
      default:
        return null
    }
  }

  const handlePress = () => {
    if (row.disabled) return
    if (row.type === 'toggle' && row.onChange) {
      row.onChange(!(row.value as boolean))
    } else if (row.onPress) {
      row.onPress()
    }
  }

  const isInteractive = row.type !== 'info' && !row.disabled

  return (
    <Pressable
      onPress={isInteractive ? handlePress : undefined}
      disabled={!isInteractive}
      className={cn(
        'flex-row items-center justify-between py-3',
        !isLast && 'border-b border-border',
        row.disabled && 'opacity-50',
      )}
    >
      <View className="flex-row items-center flex-1">
        {row.icon && (
          <View
            className="w-8 h-8 rounded-lg items-center justify-center mr-3"
            style={{ backgroundColor: row.iconColor ? `${row.iconColor}20` : undefined }}
          >
            <Text className="text-lg">{row.icon}</Text>
          </View>
        )}
        <View className="flex-1">
          <Text
            className={cn('text-base', row.destructive ? 'text-destructive' : 'text-foreground')}
          >
            {row.label}
          </Text>
          {row.description && (
            <Text className="text-sm text-muted-foreground mt-0.5">{row.description}</Text>
          )}
        </View>
      </View>
      {renderContent()}
    </Pressable>
  )
}
