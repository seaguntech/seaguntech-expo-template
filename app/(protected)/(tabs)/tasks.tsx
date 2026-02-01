import { Badge, Button, Card, CardContent } from '@/shared/ui'
import { ScrollView, Text, View } from '@/tw'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function TasksScreen() {
  const { t } = useTranslation()

  // Sample tasks for UI demonstration
  const sampleTasks = [
    { id: '1', title: 'Review project requirements', status: 'completed', priority: 'high' },
    { id: '2', title: 'Design dashboard layout', status: 'in_progress', priority: 'medium' },
    { id: '3', title: 'Implement authentication', status: 'pending', priority: 'urgent' },
    { id: '4', title: 'Write unit tests', status: 'pending', priority: 'low' },
  ]

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-6">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-foreground">{t('tasks.title')}</Text>
        <Button variant="primary" size="sm">
          {`+ ${t('tasks.addTask')}`}
        </Button>
      </View>

      <View className="gap-3">
        {sampleTasks.map((task) => (
          <Card key={task.id} variant="outlined">
            <CardContent>
              <View className="flex-row items-start">
                <View
                  className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 items-center justify-center ${
                    task.status === 'completed' ? 'bg-success border-success' : 'border-border'
                  }`}
                >
                  {task.status === 'completed' && (
                    <Text className="text-success-foreground text-xs">✓</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base ${
                      task.status === 'completed'
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {task.title}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        ))}
      </View>

      <Card variant="outlined" className="mt-6">
        <CardContent>
          <Text className="text-sm text-muted-foreground text-center">
            Full task management with CRUD operations, filtering, and sorting will be implemented in
            Phase 9.
          </Text>
        </CardContent>
      </Card>
    </ScrollView>
  )
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()

  const variants: Record<string, 'success' | 'warning' | 'secondary'> = {
    completed: 'success',
    in_progress: 'warning',
    pending: 'secondary',
  }

  const labels: Record<string, string> = {
    completed: t('tasks.statusCompleted'),
    in_progress: t('tasks.statusInProgress'),
    pending: t('tasks.statusPending'),
  }

  return <Badge variant={variants[status] ?? 'secondary'}>{labels[status] ?? status}</Badge>
}

function PriorityBadge({ priority }: { priority: string }) {
  const { t } = useTranslation()

  const variants: Record<string, 'destructive' | 'warning' | 'secondary' | 'outline'> = {
    urgent: 'destructive',
    high: 'warning',
    medium: 'secondary',
    low: 'outline',
  }

  const labels: Record<string, string> = {
    urgent: t('tasks.priorityUrgent'),
    high: t('tasks.priorityHigh'),
    medium: t('tasks.priorityMedium'),
    low: t('tasks.priorityLow'),
  }

  return <Badge variant={variants[priority] ?? 'outline'}>{labels[priority] ?? priority}</Badge>
}
