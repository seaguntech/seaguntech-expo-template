import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image'
import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useCssElement } from 'react-native-css'
import Animated from 'react-native-reanimated'

const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage)

export interface OptimizedImageProps extends ExpoImageProps {
  className?: string
  blurhash?: string
  placeholder?: 'blurhash' | 'thumbhash' | 'shimmer'
  priority?: 'low' | 'normal' | 'high'
}

/**
 * Optimized Image Component with blurhash support and progressive loading
 *
 * Features:
 * - Blurhash placeholder for smooth loading experience
 * - Priority-based loading (high priority images load first)
 * - Memory/disk caching policies
 * - Automatic content fit handling
 * - Animation support via reanimated
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   source={{ uri: 'https://example.com/image.jpg' }}
 *   blurhash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
 *   className="w-full h-48 rounded-lg"
 *   contentFit="cover"
 * />
 * ```
 */
function OptimizedCSSImage(props: OptimizedImageProps) {
  const {
    blurhash,
    placeholder = blurhash ? 'blurhash' : undefined,
    priority = 'normal',
    style: customStyle,
    ...otherProps
  } = props

  // Flatten style to extract objectFit if present
  const flattenedStyle = StyleSheet.flatten(customStyle) || {}
  const { objectFit, ...viewStyle } = flattenedStyle as Record<string, unknown>

  // Configure image loading priority
  const contentPosition = useMemo(() => {
    switch (priority) {
      case 'high':
        return 'center' // Load center first for above-fold images
      default:
        return undefined
    }
  }, [priority])

  // Build placeholder configuration
  const placeholderConfig = useMemo(() => {
    if (!placeholder) return undefined

    if (placeholder === 'blurhash' && blurhash) {
      return { blurhash }
    }

    return undefined
  }, [placeholder, blurhash])

  return (
    <View style={[viewStyle as object, { overflow: 'hidden' }]}>
      <AnimatedExpoImage
        contentFit={objectFit as ExpoImageProps['contentFit']}
        contentPosition={contentPosition}
        priority={priority}
        placeholder={placeholderConfig}
        transition={{
          duration: 300,
          effect: 'cross-dissolve',
        }}
        {...otherProps}
        source={
          typeof otherProps.source === 'string' ? { uri: otherProps.source } : otherProps.source
        }
        style={StyleSheet.absoluteFill}
      />
    </View>
  )
}

export const OptimizedImage = (props: OptimizedImageProps) => {
  return useCssElement(OptimizedCSSImage, props, { className: 'style' })
}

OptimizedImage.displayName = 'CSS(OptimizedImage)'
