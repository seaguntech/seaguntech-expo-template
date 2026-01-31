import { cn } from '@/shared/lib/utils'
import {
  AnimatedView,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from '@/tw'
import React, { useCallback, useState } from 'react'
import { SlideInDown } from 'react-native-reanimated'

interface SelectOption<T = string> {
  label: string
  value: T
  icon?: React.ReactNode
  disabled?: boolean
}

interface SelectProps<T = string> {
  options: SelectOption<T>[]
  value?: T
  onChange?: (value: T) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  searchable?: boolean
  className?: string
}

export function Select<T = string>({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  searchable = false,
  className,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options

  const handleSelect = useCallback(
    (option: SelectOption<T>) => {
      if (option.disabled) return
      onChange?.(option.value)
      setIsOpen(false)
      setSearchQuery('')
    },
    [onChange],
  )

  const keyExtractor = useCallback((item: SelectOption<T>) => String(item.value), [])

  const renderItem = useCallback(
    ({ item }: { item: SelectOption<T> }) => (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        disabled={item.disabled}
        className={cn(
          'flex-row items-center px-4 py-4 border-b border-border',
          item.disabled && 'opacity-50',
        )}
      >
        {item.icon && <View className="mr-3">{item.icon}</View>}
        <Text
          className={cn(
            'text-base flex-1',
            item.value === value ? 'text-primary font-semibold' : 'text-foreground',
          )}
        >
          {item.label}
        </Text>
        {item.value === value && <Text className="text-primary">✓</Text>}
      </TouchableOpacity>
    ),
    [handleSelect, value],
  )

  return (
    <View className={cn('w-full', className)}>
      {label && <Text className="text-sm font-medium text-foreground mb-1.5">{label}</Text>}
      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          'flex-row items-center justify-between bg-background border rounded-lg px-3 py-3',
          error ? 'border-destructive' : 'border-input',
          disabled && 'opacity-50',
        )}
      >
        <Text
          className={cn('text-base', selectedOption ? 'text-foreground' : 'text-muted-foreground')}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Text className="text-muted-foreground">▼</Text>
      </Pressable>
      {error && <Text className="text-sm text-destructive mt-1">{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable onPress={() => setIsOpen(false)} className="flex-1 justify-end bg-black/50">
          <AnimatedView
            entering={SlideInDown.springify().damping(15)}
            className="bg-card rounded-t-3xl max-h-[70%]"
          >
            <View className="p-4 border-b border-border">
              <View className="w-10 h-1 bg-muted rounded-full self-center mb-4" />
              {searchable && (
                <TextInput
                  className="bg-muted rounded-lg px-4 py-3 text-base text-foreground"
                  placeholder="Search..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
              )}
            </View>
            <FlatList
              data={filteredOptions}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ListEmptyComponent={
                <View className="p-8 items-center">
                  <Text className="text-muted-foreground">No options found</Text>
                </View>
              }
            />
          </AnimatedView>
        </Pressable>
      </Modal>
    </View>
  )
}
