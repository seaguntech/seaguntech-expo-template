import { cn } from '@/shared/lib/utils'
import { Text, TextInput, View } from '@/tw'
import React, { useState } from 'react'

export interface InputProps {
  label?: string
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
  onBlur?: () => void
  onSubmitEditing?: () => void
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  secureTextEntry?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  autoComplete?: 'email' | 'password' | 'name' | 'username' | 'off'
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send'
  blurOnSubmit?: boolean
  editable?: boolean
  multiline?: boolean
  numberOfLines?: number
  className?: string
  inputClassName?: string
  testID?: string
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onSubmitEditing,
  error,
  hint,
  leftIcon,
  rightIcon,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoComplete = 'off',
  returnKeyType,
  blurOnSubmit,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  className,
  inputClassName,
  testID,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View className={cn('w-full', className)}>
      {label && <Text className="text-sm font-medium text-foreground mb-1.5">{label}</Text>}
      <View
        className={cn(
          'flex-row items-center bg-background border rounded-lg px-3',
          isFocused ? 'border-ring' : 'border-input',
          error && 'border-destructive',
          !editable && 'opacity-50',
        )}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className={cn(
            'flex-1 py-3 text-base text-foreground',
            multiline && 'min-h-[100px]',
            inputClassName,
          )}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            onBlur?.()
          }}
          onSubmitEditing={onSubmitEditing}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          testID={testID}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && <Text className="text-sm text-destructive mt-1">{error}</Text>}
      {hint && !error && <Text className="text-sm text-muted-foreground mt-1">{hint}</Text>}
    </View>
  )
}
