import { useState, useEffect, useCallback, useRef } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { supabase } from '@/config/supabase'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export interface NotificationState {
  expoPushToken: string | null
  permission: Notifications.PermissionStatus | null
  isLoading: boolean
  error: string | null
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    expoPushToken: null,
    permission: null,
    isLoading: true,
    error: null,
  })

  const notificationListener = useRef<Notifications.EventSubscription | null>(null)
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  const registerForPushNotifications = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      if (!Device.isDevice) {
        throw new Error('Push notifications require a physical device')
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      setState((prev) => ({ ...prev, permission: finalStatus }))

      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for push notifications')
      }

      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      })

      const token = tokenData.data

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        })
      }

      // Save token to database
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('push_tokens').upsert(
          {
            user_id: userData.user.id,
            token,
            platform: Platform.OS,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
      }

      setState((prev) => ({
        ...prev,
        expoPushToken: token,
        isLoading: false,
      }))

      return token
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to register for notifications'
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }))
      return null
    }
  }, [])

  const checkPermission = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync()
    setState((prev) => ({ ...prev, permission: status }))
    return status
  }, [])

  const requestPermission = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync()
    setState((prev) => ({ ...prev, permission: status }))
    return status
  }, [])

  const scheduleLocalNotification = useCallback(
    async (
      title: string,
      body: string,
      data?: Record<string, unknown>,
      trigger?: Notifications.NotificationTriggerInput,
    ) => {
      return Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: trigger ?? null,
      })
    },
    [],
  )

  const cancelNotification = useCallback(async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  }, [])

  const cancelAllNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync()
  }, [])

  const setBadgeCount = useCallback(async (count: number) => {
    await Notifications.setBadgeCountAsync(count)
  }, [])

  const getBadgeCount = useCallback(async () => {
    return Notifications.getBadgeCountAsync()
  }, [])

  useEffect(() => {
    // Check initial permission
    checkPermission()

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // Handle foreground notification
      },
    )

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (_response) => {
        // Handle notification tap
        // const data = response.notification.request.content.data
        // Navigate based on data
      },
    )

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove()
      }
      if (responseListener.current) {
        responseListener.current.remove()
      }
    }
  }, [checkPermission])

  return {
    ...state,
    hasPermission: state.permission === 'granted',
    registerForPushNotifications,
    checkPermission,
    requestPermission,
    scheduleLocalNotification,
    cancelNotification,
    cancelAllNotifications,
    setBadgeCount,
    getBadgeCount,
  }
}
