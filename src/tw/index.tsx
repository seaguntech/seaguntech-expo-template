import { useCssElement, useNativeVariable as useFunctionalVariable } from 'react-native-css'

import {
  FlashList as ShopifyFlashList,
  FlashListProps as ShopifyFlashListProps,
} from '@shopify/flash-list'
import { Link as RouterLink } from 'expo-router'
import React from 'react'
import {
  ActivityIndicator as RNActivityIndicator,
  FlatList as RNFlatList,
  FlatListProps as RNFlatListProps,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Modal as RNModal,
  Pressable as RNPressable,
  RefreshControl as RNRefreshControl,
  ScrollView as RNScrollView,
  SectionList as RNSectionList,
  SectionListProps as RNSectionListProps,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableHighlight as RNTouchableHighlight,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
  StyleSheet,
} from 'react-native'
import Animated, {
  BaseAnimationBuilder,
  EntryExitAnimationFunction,
  LayoutAnimationFunction,
} from 'react-native-reanimated'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'

// Reanimated layout props type
type ReanimatedLayoutProps = {
  entering?: BaseAnimationBuilder | typeof BaseAnimationBuilder | EntryExitAnimationFunction
  exiting?: BaseAnimationBuilder | typeof BaseAnimationBuilder | EntryExitAnimationFunction
  layout?: BaseAnimationBuilder | typeof BaseAnimationBuilder | LayoutAnimationFunction
}

// Type for className to style mapping
type ClassNameWithContentMapping = {
  className: 'style'
  contentContainerClassName: 'contentContainerStyle'
}

// CSS-enabled Link
export const Link = (props: React.ComponentProps<typeof RouterLink> & { className?: string }) => {
  return useCssElement(RouterLink, props, { className: 'style' })
}

Link.Trigger = RouterLink.Trigger
Link.Menu = RouterLink.Menu
Link.MenuAction = RouterLink.MenuAction
Link.Preview = RouterLink.Preview

// CSS Variable hook
export const useCSSVariable =
  process.env.EXPO_OS !== 'web' ? useFunctionalVariable : (variable: string) => `var(${variable})`

// View
export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string
}

export const View = (props: ViewProps) => {
  return useCssElement(RNView, props, { className: 'style' })
}
View.displayName = 'CSS(View)'

// Text
export type TextProps = React.ComponentProps<typeof RNText> & {
  className?: string
}

export const Text = (props: TextProps) => {
  return useCssElement(RNText, props, { className: 'style' })
}
Text.displayName = 'CSS(Text)'

// ScrollView
export type ScrollViewProps = React.ComponentProps<typeof RNScrollView> & {
  className?: string
  contentContainerClassName?: string
}

export const ScrollView = (props: ScrollViewProps) => {
  return useCssElement(RNScrollView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  })
}
ScrollView.displayName = 'CSS(ScrollView)'

// Pressable
export type PressableProps = React.ComponentProps<typeof RNPressable> & {
  className?: string
}

export const Pressable = (props: PressableProps) => {
  return useCssElement(RNPressable, props, { className: 'style' })
}
Pressable.displayName = 'CSS(Pressable)'

// TextInput
export type TextInputProps = React.ComponentProps<typeof RNTextInput> & {
  className?: string
}

export const TextInput = (props: TextInputProps) => {
  return useCssElement(RNTextInput, props, { className: 'style' })
}
TextInput.displayName = 'CSS(TextInput)'

// AnimatedView - simplified types to avoid deep instantiation
export type AnimatedViewProps = Omit<React.ComponentProps<typeof RNView>, 'style'> &
  ReanimatedLayoutProps & {
    className?: string
    style?: React.ComponentProps<typeof RNView>['style']
  }

export const AnimatedView = (props: AnimatedViewProps) => {
  const element = useCssElement(RNView, props, {
    className: 'style',
  })
  const { style, ...otherProps } = element.props
  const flattenedStyle = StyleSheet.flatten(style)

  return <Animated.View {...otherProps} style={flattenedStyle} />
}
AnimatedView.displayName = 'CSS(AnimatedView)'

// AnimatedScrollView - simplified types to avoid deep instantiation
export type AnimatedScrollViewProps = Omit<
  React.ComponentProps<typeof RNScrollView>,
  'style' | 'contentContainerStyle'
> &
  ReanimatedLayoutProps & {
    className?: string
    contentClassName?: string
    contentContainerClassName?: string
    style?: React.ComponentProps<typeof RNScrollView>['style']
    contentContainerStyle?: React.ComponentProps<typeof RNScrollView>['contentContainerStyle']
  }

export const AnimatedScrollView = (props: AnimatedScrollViewProps) => {
  const element = useCssElement(RNScrollView, props, {
    className: 'style',
    contentClassName: 'contentContainerStyle',
    contentContainerClassName: 'contentContainerStyle',
  })
  const { style, contentContainerStyle, ...otherProps } = element.props
  const flattenedStyle = StyleSheet.flatten(style)
  const flattenedContentContainerStyle = StyleSheet.flatten(contentContainerStyle)

  return (
    <Animated.ScrollView
      {...otherProps}
      style={flattenedStyle}
      contentContainerStyle={flattenedContentContainerStyle}
    />
  )
}
AnimatedScrollView.displayName = 'CSS(AnimatedScrollView)'

// TouchableHighlight with underlayColor extraction
type TouchableHighlightStyle = ViewProps & { underlayColor?: string }

function InternalTouchableHighlight(props: React.ComponentProps<typeof RNTouchableHighlight>) {
  const flattenedStyle = StyleSheet.flatten(props.style) as TouchableHighlightStyle | undefined
  const { underlayColor, ...style } = flattenedStyle ?? {}
  return <RNTouchableHighlight underlayColor={underlayColor} {...props} style={style} />
}

export type TouchableHighlightProps = React.ComponentProps<typeof RNTouchableHighlight> & {
  className?: string
}

export const TouchableHighlight = (props: TouchableHighlightProps) => {
  return useCssElement(InternalTouchableHighlight, props, { className: 'style' })
}
TouchableHighlight.displayName = 'CSS(TouchableHighlight)'

// SafeAreaView
export type SafeAreaViewProps = React.ComponentProps<typeof RNSafeAreaView> & {
  className?: string
}

export const SafeAreaView = (props: SafeAreaViewProps) => {
  return useCssElement(RNSafeAreaView, props, { className: 'style' })
}
SafeAreaView.displayName = 'CSS(SafeAreaView)'

// KeyboardAvoidingView
export type KeyboardAvoidingViewProps = React.ComponentProps<typeof RNKeyboardAvoidingView> & {
  className?: string
  contentContainerClassName?: string
}

export const KeyboardAvoidingView = (props: KeyboardAvoidingViewProps) => {
  return useCssElement(RNKeyboardAvoidingView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  })
}
KeyboardAvoidingView.displayName = 'CSS(KeyboardAvoidingView)'

// ActivityIndicator
export type ActivityIndicatorProps = React.ComponentProps<typeof RNActivityIndicator> & {
  className?: string
}

export const ActivityIndicator = (props: ActivityIndicatorProps) => {
  return useCssElement(RNActivityIndicator, props, { className: 'style' })
}
ActivityIndicator.displayName = 'CSS(ActivityIndicator)'

// Modal
export type ModalProps = React.ComponentProps<typeof RNModal> & {
  className?: string
}

export const Modal = (props: ModalProps) => {
  return useCssElement(RNModal, props, { className: 'style' })
}
Modal.displayName = 'CSS(Modal)'

// TouchableOpacity
export type TouchableOpacityProps = React.ComponentProps<typeof RNTouchableOpacity> & {
  className?: string
}

export const TouchableOpacity = (props: TouchableOpacityProps) => {
  return useCssElement(RNTouchableOpacity, props, { className: 'style' })
}
TouchableOpacity.displayName = 'CSS(TouchableOpacity)'

// FlatList with proper generics
export type FlatListProps<ItemT> = Omit<
  RNFlatListProps<ItemT>,
  'style' | 'contentContainerStyle'
> & {
  className?: string
  contentContainerClassName?: string
  style?: RNFlatListProps<ItemT>['style']
  contentContainerStyle?: RNFlatListProps<ItemT>['contentContainerStyle']
}

type FlatListComponent<ItemT> = React.ComponentType<FlatListProps<ItemT>>

export function FlatList<ItemT>(props: FlatListProps<ItemT>) {
  return useCssElement(RNFlatList as FlatListComponent<ItemT>, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  } as ClassNameWithContentMapping)
}
FlatList.displayName = 'CSS(FlatList)'

export type FlashListProps<ItemT> = Omit<ShopifyFlashListProps<ItemT>, 'contentContainerStyle'> & {
  className?: string
  contentContainerClassName?: string
  contentContainerStyle?: ShopifyFlashListProps<ItemT>['contentContainerStyle']
}

type FlashListComponent<ItemT> = React.ComponentType<FlashListProps<ItemT>>

export function FlashList<ItemT>(props: FlashListProps<ItemT>) {
  return useCssElement(ShopifyFlashList as FlashListComponent<ItemT>, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  } as ClassNameWithContentMapping)
}
FlashList.displayName = 'CSS(FlashList)'

// SectionList with proper generics
export type SectionListProps<ItemT, SectionT> = Omit<
  RNSectionListProps<ItemT, SectionT>,
  'style' | 'contentContainerStyle'
> & {
  className?: string
  contentContainerClassName?: string
  style?: RNSectionListProps<ItemT, SectionT>['style']
  contentContainerStyle?: RNSectionListProps<ItemT, SectionT>['contentContainerStyle']
}

type SectionListComponent<ItemT, SectionT> = React.ComponentType<SectionListProps<ItemT, SectionT>>

export function SectionList<ItemT, SectionT>(props: SectionListProps<ItemT, SectionT>) {
  return useCssElement(RNSectionList as SectionListComponent<ItemT, SectionT>, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  } as ClassNameWithContentMapping)
}
SectionList.displayName = 'CSS(SectionList)'

// RefreshControl
export type RefreshControlProps = React.ComponentProps<typeof RNRefreshControl> & {
  className?: string
}

export const RefreshControl = (props: RefreshControlProps) => {
  return useCssElement(RNRefreshControl, props, { className: 'style' })
}
RefreshControl.displayName = 'CSS(RefreshControl)'

// AnimatedText
export const AnimatedText = (
  props: React.ComponentProps<typeof Animated.Text> & { className?: string },
) => {
  return useCssElement(Animated.Text, props, { className: 'style' })
}
AnimatedText.displayName = 'CSS(AnimatedText)'

// AnimatedPressable
export type AnimatedPressableProps = React.ComponentProps<typeof RNPressable> &
  ReanimatedLayoutProps & {
    className?: string
  }

export const AnimatedPressable = (props: AnimatedPressableProps) => {
  const element = useCssElement(RNPressable, props, { className: 'style' })
  const { style, ...otherProps } = element.props
  const flattenedStyle = StyleSheet.flatten(style)

  return <Animated.View {...otherProps} style={flattenedStyle} />
}
AnimatedPressable.displayName = 'CSS(AnimatedPressable)'

// Re-export Animated with CSS support
export const CSSAnimated = {
  ...Animated,
  View: AnimatedView,
  ScrollView: AnimatedScrollView,
  Text: AnimatedText,
  Pressable: AnimatedPressable,
}

export { Image, ImageProps } from './image'
