import React from 'react'
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  Image as RNImage,
} from 'react-native'

export const View = ({ children, className, ...props }: any) => (
  <RNView {...props}>{children}</RNView>
)

export const Text = ({ children, className, ...props }: any) => (
  <RNText {...props}>{children}</RNText>
)

export const Pressable = ({ children, className, ...props }: any) => (
  <RNPressable {...props}>{children}</RNPressable>
)

export const Image = ({ className, ...props }: any) => <RNImage {...props} />

export default { View, Text, Pressable, Image }
