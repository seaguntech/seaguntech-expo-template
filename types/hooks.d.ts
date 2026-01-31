import type { ImagePickerResult, ImagePickerOptions } from 'expo-image-picker'

export interface UseAsyncResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  execute: (...args: unknown[]) => Promise<T | null>
  reset: () => void
}

export interface UseToggleResult {
  value: boolean
  toggle: () => void
  setTrue: () => void
  setFalse: () => void
  setValue: (value: boolean) => void
}

export interface UseDebounceResult<T> {
  debouncedValue: T
  isPending: boolean
}

export interface UseNetworkStatusResult {
  isOnline: boolean
  isInternetReachable: boolean | null
  connectionType: string | null
}

export interface UseImageUploadOptions extends Partial<ImagePickerOptions> {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  bucket?: string
  path?: string
}

export interface UseImageUploadResult {
  pickImage: () => Promise<ImagePickerResult>
  takePhoto: () => Promise<ImagePickerResult>
  uploadImage: (uri: string) => Promise<string>
  isUploading: boolean
  progress: number
  error: string | null
  reset: () => void
}

export interface UseCacheOptions {
  ttl?: number
  staleWhileRevalidate?: boolean
}

export interface UseCacheResult<T> {
  data: T | null
  isLoading: boolean
  isStale: boolean
  error: Error | null
  refresh: () => Promise<void>
  invalidate: () => void
}

export interface UseCountdownOptions {
  interval?: number
  onComplete?: () => void
}

export interface UseCountdownResult {
  seconds: number
  isRunning: boolean
  start: (seconds: number) => void
  pause: () => void
  resume: () => void
  reset: () => void
  stop: () => void
}

export interface UseClipboardResult {
  copiedText: string | null
  copy: (text: string) => Promise<boolean>
  paste: () => Promise<string | null>
  hasCopied: boolean
}

export interface UseKeyboardResult {
  isVisible: boolean
  height: number
  animatedHeight: number
}

export interface UseRefreshResult {
  isRefreshing: boolean
  onRefresh: () => Promise<void>
}

export interface UsePaginationOptions {
  initialPage?: number
  pageSize?: number
}

export interface UsePaginationResult<T> {
  data: T[]
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
  isLoading: boolean
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: () => void
  previousPage: () => void
  goToPage: (page: number) => void
  refresh: () => Promise<void>
}
