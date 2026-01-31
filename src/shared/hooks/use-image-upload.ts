import { useState, useCallback } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { supabase } from '@/config/supabase'
import type { UseImageUploadOptions, UseImageUploadResult } from '@/types'

const DEFAULT_OPTIONS: UseImageUploadOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  bucket: 'avatars',
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadResult {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const config = { ...DEFAULT_OPTIONS, ...options }

  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      setError('Permission to access media library is required')
      return false
    }
    return true
  }

  const requestCameraPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      setError('Permission to access camera is required')
      return false
    }
    return true
  }

  const pickImage = useCallback(async (): Promise<ImagePicker.ImagePickerResult> => {
    setError(null)

    const hasPermission = await requestPermissions()
    if (!hasPermission) {
      return { canceled: true, assets: null }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: config.quality,
    })

    return result
  }, [config.quality])

  const takePhoto = useCallback(async (): Promise<ImagePicker.ImagePickerResult> => {
    setError(null)

    const hasPermission = await requestCameraPermissions()
    if (!hasPermission) {
      return { canceled: true, assets: null }
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: config.quality,
    })

    return result
  }, [config.quality])

  const uploadImage = useCallback(
    async (uri: string): Promise<string> => {
      setIsUploading(true)
      setProgress(0)
      setError(null)

      try {
        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(uri)
        if (!fileInfo.exists) {
          throw new Error('File does not exist')
        }

        // Read file as base64
        setProgress(20)
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        })

        // Determine file extension
        const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpg'
        const mimeType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`

        // Generate unique filename
        const fileName = `${config.path ?? ''}${Date.now()}.${fileExt}`

        setProgress(50)

        // Convert base64 to ArrayBuffer
        const binaryString = atob(base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(config.bucket ?? 'avatars')
          .upload(fileName, bytes.buffer, {
            contentType: mimeType,
            upsert: true,
          })

        if (uploadError) {
          throw uploadError
        }

        setProgress(90)

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(config.bucket ?? 'avatars').getPublicUrl(fileName)

        setProgress(100)

        return publicUrl
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed'
        setError(errorMessage)
        throw err
      } finally {
        setIsUploading(false)
      }
    },
    [config.bucket, config.path],
  )

  const reset = useCallback(() => {
    setIsUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  return {
    pickImage,
    takePhoto,
    uploadImage,
    isUploading,
    progress,
    error,
    reset,
  }
}
