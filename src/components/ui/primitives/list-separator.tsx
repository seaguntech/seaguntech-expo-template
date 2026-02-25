import { View } from '@/tw'
import React, { memo } from 'react'

interface ListSeparatorProps {
  height?: number
}

export const ListSeparator = memo(function ListSeparator({ height = 12 }: ListSeparatorProps) {
  return <View style={{ height }} />
})
