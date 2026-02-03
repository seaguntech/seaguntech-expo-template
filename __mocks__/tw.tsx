import React from 'react'
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  Image as RNImage,
  ScrollView as RNScrollView,
  TextInput as RNTextInput,
  TouchableOpacity as RNTouchableOpacity,
  TouchableHighlight as RNTouchableHighlight,
  FlatList as RNFlatList,
  SectionList as RNSectionList,
  Modal as RNModal,
  ActivityIndicator as RNActivityIndicator,
  RefreshControl as RNRefreshControl,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
} from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { Link as RouterLink } from 'expo-router'

// Basic components
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

// Scroll and list components
export const ScrollView = ({ children, className, contentContainerClassName, ...props }: any) => (
  <RNScrollView {...props}>{children}</RNScrollView>
)

export const TextInput = ({ className, ...props }: any) => <RNTextInput {...props} />

export const TouchableOpacity = ({ children, className, ...props }: any) => (
  <RNTouchableOpacity {...props}>{children}</RNTouchableOpacity>
)

export const TouchableHighlight = ({ children, className, ...props }: any) => (
  <RNTouchableHighlight {...props}>{children}</RNTouchableHighlight>
)

export const FlatList = ({ className, contentContainerClassName, ...props }: any) => (
  <RNFlatList {...props} />
)

export const SectionList = ({ className, contentContainerClassName, ...props }: any) => (
  <RNSectionList {...props} />
)

// Layout components
export const SafeAreaView = ({ children, className, ...props }: any) => (
  <RNSafeAreaView {...props}>{children}</RNSafeAreaView>
)

export const KeyboardAvoidingView = ({
  children,
  className,
  contentContainerClassName,
  ...props
}: any) => <RNKeyboardAvoidingView {...props}>{children}</RNKeyboardAvoidingView>

// UI components
export const Modal = ({ children, className, ...props }: any) => (
  <RNModal {...props}>{children}</RNModal>
)

export const ActivityIndicator = ({ className, ...props }: any) => (
  <RNActivityIndicator {...props} />
)

export const RefreshControl = ({ className, ...props }: any) => <RNRefreshControl {...props} />

// Navigation
export const Link = ({ children, className, ...props }: any) => (
  <RouterLink {...props}>{children}</RouterLink>
)

// Animated components (basic mock)
export const AnimatedView = View
export const AnimatedText = Text
export const AnimatedScrollView = ScrollView
export const AnimatedPressable = Pressable

// FlashList mock (from @shopify/flash-list)
export const FlashList = ({ className, contentContainerClassName, ...props }: any) => (
  <RNFlatList {...props} />
)

// Default export
export default {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  FlatList,
  SectionList,
  SafeAreaView,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Link,
  FlashList,
  AnimatedView,
  AnimatedText,
  AnimatedScrollView,
  AnimatedPressable,
}
