import { useState, useEffect, useCallback } from 'react'
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo'

export interface NetworkStatus {
  isConnected: boolean
  isInternetReachable: boolean | null
  type: string | null
  isWifi: boolean
  isCellular: boolean
  details: NetInfoState | null
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    isWifi: false,
    isCellular: false,
    details: null,
  })

  const updateStatus = useCallback((state: NetInfoState) => {
    setStatus({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
      details: state,
    })
  }, [])

  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch()
    updateStatus(state)
    return state
  }, [updateStatus])

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(updateStatus)

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener(updateStatus)

    return () => {
      unsubscribe()
    }
  }, [updateStatus])

  return {
    ...status,
    refresh,
    isOffline: !status.isConnected,
  }
}
