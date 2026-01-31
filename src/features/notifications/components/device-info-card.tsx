import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives'
import { Text, View } from '@/tw'
import * as Device from 'expo-device'
import React from 'react'
import { Platform } from 'react-native'

interface DeviceInfoCardProps {
  expoPushToken?: string | null
  className?: string
}

export function DeviceInfoCard({ expoPushToken, className }: DeviceInfoCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Device Information</CardTitle>
      </CardHeader>
      <CardContent className="gap-3">
        <InfoRow label="Device" value={Device.modelName ?? 'Unknown'} />
        <InfoRow label="Platform" value={`${Platform.OS} ${Platform.Version}`} />
        <InfoRow label="Physical Device" value={Device.isDevice ? 'Yes' : 'No (Simulator)'} />
        {expoPushToken && (
          <View>
            <Text className="text-sm text-muted-foreground mb-1">Push Token</Text>
            <Text
              className="text-xs text-foreground font-mono bg-muted p-2 rounded"
              numberOfLines={2}
            >
              {expoPushToken}
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm text-foreground font-medium">{value}</Text>
    </View>
  )
}
