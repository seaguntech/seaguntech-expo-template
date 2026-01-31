import { mmkvStorage, STORAGE_KEYS } from '@/shared/lib/storage'
import { useAudioPlayer } from 'expo-audio'
import { useCallback, useEffect, useMemo, useRef } from 'react'

type SoundName = 'success' | 'error' | 'notification' | 'click' | 'toggle'

// Sound file sources - replace null with require('./path/to/sound.mp3') when adding files
const SOUND_SOURCES: Record<SoundName, number | null> = {
  success: null,
  error: null,
  notification: null,
  click: null,
  toggle: null,
}

export function useSounds() {
  const isMutedRef = useRef(false)

  // Create audio players for each sound type
  // When sound files are added, replace null with the actual source
  const successPlayer = useAudioPlayer(SOUND_SOURCES.success)
  const errorPlayer = useAudioPlayer(SOUND_SOURCES.error)
  const notificationPlayer = useAudioPlayer(SOUND_SOURCES.notification)
  const clickPlayer = useAudioPlayer(SOUND_SOURCES.click)
  const togglePlayer = useAudioPlayer(SOUND_SOURCES.toggle)

  const players: Record<SoundName, ReturnType<typeof useAudioPlayer>> = useMemo(() => {
    return {
      success: successPlayer,
      error: errorPlayer,
      notification: notificationPlayer,
      click: clickPlayer,
      toggle: togglePlayer,
    }
  }, [successPlayer, errorPlayer, notificationPlayer, clickPlayer, togglePlayer])

  // Load muted state from storage
  useEffect(() => {
    const muted = mmkvStorage.getBoolean(STORAGE_KEYS.SOUND_MUTED)
    isMutedRef.current = muted ?? false
  }, [])

  const play = useCallback(
    async (name: SoundName) => {
      if (isMutedRef.current) return

      try {
        const player = players[name]
        if (player) {
          player.seekTo(0)
          player.play()
        }
      } catch {
        // Silently fail
      }
    },
    [players],
  )

  const playSuccess = useCallback(() => play('success'), [play])
  const playError = useCallback(() => play('error'), [play])
  const playNotification = useCallback(() => play('notification'), [play])
  const playClick = useCallback(() => play('click'), [play])
  const playToggle = useCallback(() => play('toggle'), [play])

  const setMuted = useCallback((muted: boolean) => {
    isMutedRef.current = muted
    mmkvStorage.setBoolean(STORAGE_KEYS.SOUND_MUTED, muted)
  }, [])

  const toggleMuted = useCallback(() => {
    const newValue = !isMutedRef.current
    setMuted(newValue)
    return newValue
  }, [setMuted])

  return {
    play,
    playSuccess,
    playError,
    playNotification,
    playClick,
    playToggle,
    setMuted,
    toggleMuted,
    isMuted: isMutedRef.current,
  }
}
