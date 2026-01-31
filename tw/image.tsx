import { Image as ExpoImage } from 'expo-image'
import React from 'react'
import { StyleSheet } from 'react-native'
import { useCssElement } from 'react-native-css'
import Animated from 'react-native-reanimated'

const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage)

export type ImageProps = React.ComponentProps<typeof ExpoImage> & {
  className?: string
}

function CSSImage(props: ImageProps) {
  const { objectFit, ...style } = StyleSheet.flatten(props.style)

  return (
    <AnimatedExpoImage
      contentFit={objectFit}
      {...props}
      source={typeof props.source === 'string' ? { uri: props.source } : props.source}
      style={style}
    />
  )
}

export const Image = (props: ImageProps) => {
  return useCssElement(CSSImage, props, { className: 'style' })
}

Image.displayName = 'CSS(Image)'
