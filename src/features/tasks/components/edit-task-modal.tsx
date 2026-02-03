import { cn } from '@/shared/lib/utils'
import { FormInput } from '@/shared/ui/forms/form-input'
import { Button, Input } from '@/shared/ui/primitives'
import { Modal, Pressable, ScrollView, Text, TextInput, View } from '@/tw'
import type { Task, TaskPriority, TaskStatus, UpdateTaskDto } from '@/types'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'

interface EditTaskModalProps {
  task: Task | null
  visible: boolean
  onClose: () => void
  onSave: (id: string, dto: UpdateTaskDto) => Promise<void>
  isLoading?: boolean
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
]

type EditTaskFormValues = {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  tags: { value: string }[]
}

export function EditTaskModal({
  task,
  visible,
  onClose,
  onSave,
  isLoading = false,
}: EditTaskModalProps) {
  const [tagInput, setTagInput] = useState('')

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditTaskFormValues>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      tags: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tags',
  })

  const status = useWatch({ control, name: 'status' }) ?? 'pending'
  const priority = useWatch({ control, name: 'priority' }) ?? 'medium'

  useEffect(() => {
    if (!task) return
    reset({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      status: task.status,
      tags: (task.tags ?? []).map((tag) => ({ value: tag })),
    })
    setTagInput('')
  }, [task, reset])

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
    if (!task) return
    try {
      const tags = values.tags.map((tag) => tag.value).filter(Boolean)
      await onSave(task.id, {
        title: values.title.trim(),
        description: values.description.trim() || null,
        priority: values.priority,
        status: values.status,
        tags,
      })
      onClose()
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Failed to update task',
      })
    }
  })

  if (!task) return null

  const rootError = errors.root?.message

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <Pressable onPress={onClose} testID="task-edit-cancel-button">
            <Text className="text-primary text-base">Cancel</Text>
          </Pressable>
          <Text className="font-semibold text-foreground">Edit Task</Text>
          <Pressable
            onPress={submit}
            disabled={isLoading || isSubmitting}
            testID="task-save-button"
          >
            <Text
              className={cn(
                'text-base font-semibold',
                isLoading || isSubmitting ? 'text-muted-foreground' : 'text-primary',
              )}
            >
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1 p-4" contentContainerClassName="gap-4">
          <View>
            <Text className="text-sm font-medium text-foreground mb-1">Title *</Text>
            <FormInput
              control={control}
              name="title"
              testID="task-edit-title-input"
              rules={{ required: 'Title is required' }}
              inputProps={{ placeholder: 'Task title', returnKeyType: 'next' }}
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
                  numberOfLines={4}
                  className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground min-h-[100px]"
                />
              )}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Status</Text>
            <View className="flex-row flex-wrap gap-2">
              {STATUSES.map((s) => (
                <Pressable
                  key={s.value}
                  onPress={() => setValue('status', s.value, { shouldDirty: true })}
                  className={cn(
                    'px-3 py-2 rounded-lg border-2',
                    status === s.value ? 'border-primary bg-primary/10' : 'border-border',
                  )}
                >
                  <Text
                    className={cn(
                      'text-sm font-medium',
                      status === s.value ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Priority</Text>
            <View className="flex-row gap-2">
              {PRIORITIES.map((p) => (
                <Pressable
                  key={p.value}
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
              />
              <Button variant="outline" size="sm" onPress={handleAddTag}>
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
        </ScrollView>

        <View className="p-4 border-t border-border">
          <Button variant="destructive" onPress={onClose} testID="task-delete-confirm-button">
            Delete Task
          </Button>
        </View>
      </View>
    </Modal>
  )
}
