import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives'
import { Pressable, Text, View } from '@/tw'
import React from 'react'

interface DebugInfoProps {
  data: Record<string, unknown>
  expanded?: boolean
  onToggle?: () => void
  className?: string
}

export function DebugInfo({ data, expanded = false, onToggle, className }: DebugInfoProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <Pressable onPress={onToggle} className="flex-row items-center justify-between">
          <CardTitle>Debug Info</CardTitle>
          <Text className="text-muted-foreground">{expanded ? '▼' : '▶'}</Text>
        </Pressable>
      </CardHeader>
      {expanded && (
        <CardContent>
          <View className="bg-muted rounded-lg p-3">
            <Text className="text-xs font-mono text-foreground">
              {JSON.stringify(data, null, 2)}
            </Text>
          </View>
        </CardContent>
      )}
    </Card>
  )
}
