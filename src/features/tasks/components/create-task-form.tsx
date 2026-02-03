import { cn } from '@/shared/lib/utils'
import { FormInput } from '@/shared/ui/forms/form-input'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/shared/ui/primitives'
import { Pressable, Text, TextInput, View } from '@/tw'
import type { CreateTaskDto, TaskPriority } from '@/types'
import { useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'

interface CreateTaskFormProps {
  onSubmit: (dto: CreateTaskDto) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  className?: string
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-muted' },
  { value: 'medium', label: 'Medium', color: 'bg-primary/20' },
  { value: 'high', label: 'High', color: 'bg-warning/20' },
  { value: 'urgent', label: 'Urgent', color: 'bg-destructive/20' },
]

type CreateTaskFormValues = {
  title: string
  description: string
  priority: TaskPriority
  tags: { value: string }[]
}

export function CreateTaskForm({
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: CreateTaskFormProps) {
  const [tagInput, setTagInput] = useState('')

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      tags: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tags',
  })

  const priority = useWatch({ control, name: 'priority' }) ?? 'medium'

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (!tag) return
    if (fields.some((field) => field.value === tag)) return
    append({ value: tag })
    setTagInput('')
  }

  const handleRemoveTag = (index: number) => {
    remove(index)
  }

  const submit = handleSubmit(async (values) => {
    try {
      const tags = values.tags.map((tag) => tag.value).filter(Boolean)
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        priority: values.priority,
        tags: tags.length > 0 ? tags : undefined,
      })
      reset({ title: '', description: '', priority: 'medium', tags: [] })
      setTagInput('')
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Failed to create task',
      })
    }
  })

  const rootError = errors.root?.message

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>New Task</CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        <View>
          <Text className="text-sm font-medium text-foreground mb-1">Title *</Text>
          <FormInput
            control={control}
            name="title"
            testID="task-title-input"
            rules={{ required: 'Title is required' }}
            inputProps={{
              placeholder: 'What needs to be done?',
              returnKeyType: 'next',
            }}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground mb-1">Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="Add details..."
                multiline
                numberOfLines={3}
                testID="task-description-input"
                className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground min-h-[80px]"
              />
            )}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground mb-2">Priority</Text>
          <View className="flex-row gap-2">
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                testID={`task-priority-${p.value}`}
                onPress={() => setValue('priority', p.value, { shouldDirty: true })}
                className={cn(
                  'flex-1 py-2 rounded-lg border-2 items-center',
                  priority === p.value ? 'border-primary bg-primary/10' : 'border-border',
                )}
              >
                <Text
                  className={cn(
                    'text-sm font-medium',
                    priority === p.value ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground mb-1">Tags</Text>
          <View className="flex-row gap-2">
            <Input
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add tag..."
              onSubmitEditing={handleAddTag}
              className="flex-1"
              returnKeyType="done"
              testID="task-tag-input"
            />
            <Button variant="outline" size="sm" onPress={handleAddTag} testID="task-addtag-button">
              Add
            </Button>
          </View>
          {fields.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-2">
              {fields.map((tag, index) => (
                <Pressable
                  key={tag.id}
                  onPress={() => handleRemoveTag(index)}
                  className="flex-row items-center bg-primary/10 px-2 py-1 rounded"
                >
                  <Text className="text-sm text-primary mr-1">{tag.value}</Text>
                  <Text className="text-xs text-primary">✕</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {rootError && (
          <View className="bg-destructive/10 p-3 rounded-lg">
            <Text className="text-destructive text-sm">{rootError}</Text>
          </View>
        )}

        <View className="flex-row gap-3 mt-2">
          {onCancel && (
            <Button
              variant="outline"
              onPress={onCancel}
              className="flex-1"
              testID="task-cancel-button"
            >
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            onPress={submit}
            isLoading={isLoading || isSubmitting}
            disabled={isLoading || isSubmitting}
            className="flex-1"
            testID="task-create-button"
          >
            Create Task
          </Button>
        </View>
      </CardContent>
    </Card>
  )
}
