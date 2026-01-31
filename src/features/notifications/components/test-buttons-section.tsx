import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives'
import React from 'react'

interface TestButtonsSectionProps {
  onSendTest: () => void
  onScheduleTest: () => void
  onClearAll: () => void
  isLoading?: boolean
  className?: string
}

export function TestButtonsSection({
  onSendTest,
  onScheduleTest,
  onClearAll,
  isLoading = false,
  className,
}: TestButtonsSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Test Notifications</CardTitle>
      </CardHeader>
      <CardContent className="gap-3">
        <Button variant="primary" onPress={onSendTest} isLoading={isLoading}>
          Send Test Notification
        </Button>

        <Button variant="outline" onPress={onScheduleTest}>
          Schedule in 5 seconds
        </Button>

        <Button variant="ghost" onPress={onClearAll}>
          Clear All Scheduled
        </Button>
      </CardContent>
    </Card>
  )
}
