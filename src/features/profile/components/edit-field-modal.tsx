import { FormInput } from '@/shared/ui/forms'
import { Button, Dialog, DialogActions } from '@/shared/ui/primitives'
import { Text, View } from '@/tw'
import type { ProfileField } from '@/types'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface EditFieldModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (value: string) => Promise<void>
  field: ProfileField | null
  currentValue: string
  isLoading?: boolean
}

const FIELD_LABELS: Record<ProfileField, string> = {
  displayName: 'Display Name',
  firstName: 'First Name',
  lastName: 'Last Name',
  phone: 'Phone Number',
  bio: 'Bio',
}

const FIELD_PLACEHOLDERS: Record<ProfileField, string> = {
  displayName: 'Enter your display name',
  firstName: 'Enter your first name',
  lastName: 'Enter your last name',
  phone: '+1 (555) 123-4567',
  bio: 'Tell us about yourself...',
}

type EditFieldValues = {
  value: string
}

export function EditFieldModal({
  isOpen,
  onClose,
  onSave,
  field,
  currentValue,
  isLoading = false,
}: EditFieldModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditFieldValues>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: { value: currentValue },
  })

  useEffect(() => {
    if (!isOpen) return
    reset({ value: currentValue })
  }, [currentValue, isOpen, reset])

  const submit = handleSubmit(async (values) => {
    if (!field) return
    try {
      await onSave(values.value.trim())
      onClose()
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Failed to save',
      })
    }
  })

  if (!field) return null

  const isMultiline = field === 'bio'
  const rootError = errors.root?.message

  return (
    <Dialog open={isOpen} onClose={onClose} title={`Edit ${FIELD_LABELS[field]}`}>
      <View className="mt-4">
        <FormInput
          control={control}
          name="value"
          rules={{
            validate: (value) => {
              if (field === 'displayName' && value.trim().length < 2) {
                return 'Display name must be at least 2 characters'
              }
              if (field === 'phone' && value.trim() && !/^[+\d\s\-()]+$/.test(value)) {
                return 'Please enter a valid phone number'
              }
              return true
            },
          }}
          inputProps={{
            label: FIELD_LABELS[field],
            placeholder: FIELD_PLACEHOLDERS[field],
            multiline: isMultiline,
            numberOfLines: isMultiline ? 4 : 1,
            autoCapitalize: field === 'phone' ? 'none' : 'words',
            keyboardType: field === 'phone' ? 'phone-pad' : 'default',
            blurOnSubmit: !isMultiline,
            returnKeyType: 'done',
            onSubmitEditing: submit,
          }}
        />
      </View>

      {rootError && (
        <View className="bg-destructive/10 p-3 rounded-lg mt-3">
          <Text className="text-destructive text-sm">{rootError}</Text>
        </View>
      )}

      <DialogActions>
        <Button variant="ghost" onPress={onClose} disabled={isLoading || isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onPress={submit}
          isLoading={isLoading || isSubmitting}
          disabled={isLoading || isSubmitting}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
