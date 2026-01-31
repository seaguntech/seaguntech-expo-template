import { Input, type InputProps } from '@/shared/ui'
import React from 'react'
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form'

interface FormInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  rules?: RegisterOptions<T, Path<T>>
  inputProps?: Omit<InputProps, 'value' | 'onChangeText' | 'onBlur' | 'error'>
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  rules,
  inputProps,
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          {...inputProps}
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  )
}
