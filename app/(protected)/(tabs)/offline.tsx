import { formatRelativeTime } from '@/shared/lib/utils'
import { useOfflineStore } from '@/shared/stores'
import { Badge, Button, Card, CardContent } from '@/shared/ui'
import { ScrollView, Text, View } from '@/tw'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function OfflineScreen() {
  const { t } = useTranslation()
  const { isOnline, pendingActions, lastSyncAt, isSyncing, startSync, finishSync } =
    useOfflineStore()

  const handleSync = async () => {
    startSync()
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 2000))
    finishSync()
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-6">
      <Card variant="outlined" className="mb-6">
        <CardContent>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">Connection Status</Text>
            <Badge variant={isOnline ? 'success' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </View>

          <View className="flex-row items-center">
            <Text className="text-4xl mr-4">{isOnline ? '🌐' : '📴'}</Text>
            <View className="flex-1">
              <Text className="text-base text-foreground">
                {isOnline ? 'You are connected to the internet' : t('offline.youAreOffline')}
              </Text>
              {lastSyncAt && (
                <Text className="text-sm text-muted-foreground mt-1">
                  {t('offline.lastSynced', {
                    time: formatRelativeTime(lastSyncAt),
                  })}
                </Text>
              )}
            </View>
          </View>
        </CardContent>
      </Card>

      <Card variant="outlined" className="mb-6">
        <CardContent>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">
              {t('offline.pendingChanges')}
            </Text>
            <Badge variant={pendingActions.length > 0 ? 'warning' : 'secondary'}>
              {pendingActions.length}
            </Badge>
          </View>

          {pendingActions.length === 0 ? (
            <View className="items-center py-4">
              <Text className="text-4xl mb-2">✅</Text>
              <Text className="text-muted-foreground text-center">All changes are synced</Text>
            </View>
          ) : (
            <View className="gap-2">
              {pendingActions.slice(0, 5).map((action) => (
                <View key={action.id} className="flex-row items-center py-2 border-b border-border">
                  <Text className="text-base mr-2">📝</Text>
                  <View className="flex-1">
                    <Text className="text-sm text-foreground">{action.type}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {formatRelativeTime(action.createdAt)}
                    </Text>
                  </View>
                  {action.retryCount > 0 && (
                    <Badge variant="outline">Retry {action.retryCount}</Badge>
                  )}
                </View>
              ))}
              {pendingActions.length > 5 && (
                <Text className="text-sm text-muted-foreground text-center">
                  +{pendingActions.length - 5} more pending actions
                </Text>
              )}
            </View>
          )}
        </CardContent>
      </Card>

      <Button
        variant="primary"
        size="lg"
        onPress={handleSync}
        isLoading={isSyncing}
        disabled={!isOnline || isSyncing || pendingActions.length === 0}
      >
        {t('offline.syncNow')}
      </Button>

      <Text className="text-xs text-muted-foreground text-center mt-4">
        Changes made while offline will be automatically synced when you&apos;re back online.
      </Text>
    </ScrollView>
  )
}
