import { cn } from '@/shared/lib/utils'
import { Pressable, ScrollView, Text } from '@/tw'
import type { PromptPreset } from '@/types'
import React, { memo, useCallback } from 'react'

interface PromptLabelItemProps {
  preset: PromptPreset
  isSelected: boolean
  onSelect: (preset: PromptPreset) => void
}

const PromptLabelItem = memo(function PromptLabelItem({
  preset,
  isSelected,
  onSelect,
}: PromptLabelItemProps) {
  const handlePress = useCallback(() => {
    onSelect(preset)
  }, [onSelect, preset])

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        'flex-row items-center px-3 py-2 rounded-full border',
        isSelected ? 'bg-primary border-primary' : 'bg-card border-border',
      )}
    >
      {preset.icon && <Text className="mr-1">{preset.icon}</Text>}
      <Text
        className={cn(
          'text-sm font-medium',
          isSelected ? 'text-primary-foreground' : 'text-foreground',
        )}
      >
        {preset.name}
      </Text>
    </Pressable>
  )
})

interface PromptLabelsProps {
  presets: PromptPreset[]
  selectedId?: string
  onSelect: (preset: PromptPreset) => void
  className?: string
}

export function PromptLabels({ presets, selectedId, onSelect, className }: PromptLabelsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={cn('py-2', className)}
      contentContainerClassName="px-4 gap-2"
    >
      {presets.map((preset) => (
        <PromptLabelItem
          key={preset.id}
          preset={preset}
          isSelected={selectedId === preset.id}
          onSelect={onSelect}
        />
      ))}
    </ScrollView>
  )
}
