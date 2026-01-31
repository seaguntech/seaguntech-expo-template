# TW - CSS-Wrapped React Native Components

This directory contains CSS-wrapped React Native components for use with NativeWind v5 and Tailwind CSS v4.

## Usage

```tsx
import { View, Text, Pressable, ScrollView, Image } from '@/tw'

export default function MyScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        <Text className="text-xl font-bold text-foreground">Hello!</Text>
      </View>
    </ScrollView>
  )
}
```

## Available Components

| Component              | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `View`                 | Basic container with className support                |
| `Text`                 | Text component with className support                 |
| `Pressable`            | Touchable component                                   |
| `ScrollView`           | Scrollable container with `contentContainerClassName` |
| `TextInput`            | Text input field                                      |
| `Image`                | Image component (from expo-image)                     |
| `FlatList`             | Virtualized list                                      |
| `FlashList`            | High-performance list (@shopify/flash-list)           |
| `SafeAreaView`         | Safe area container                                   |
| `KeyboardAvoidingView` | Keyboard-aware container                              |
| `Modal`                | Modal overlay                                         |
| `RefreshControl`       | Pull-to-refresh control                               |

## Animated Components

```tsx
import {
  AnimatedView,
  AnimatedScrollView,
  AnimatedText,
  AnimatedPressable,
  CSSAnimated,
} from '@/tw'
```

### CSSAnimated Object

```tsx
import { CSSAnimated } from '@/tw'

// Use like react-native-reanimated but with className support
<CSSAnimated.View className="bg-primary" entering={FadeIn} />
<CSSAnimated.Text className="text-white" />
<CSSAnimated.Pressable className="p-4" />
<CSSAnimated.ScrollView className="flex-1" />
```

---

## Animation Best Practices

### GPU-Friendly Properties (USE THESE)

These properties are hardware-accelerated and run on the GPU:

```tsx
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

const offset = useSharedValue(0)

// ✅ GOOD - GPU accelerated, smooth 60fps
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: offset.value },
    { translateY: offset.value },
    { scale: withSpring(1.2) },
    { rotate: `${offset.value}deg` },
  ],
  opacity: withSpring(offset.value > 50 ? 1 : 0.5),
}))
```

### Layout-Triggering Properties (AVOID ANIMATING)

These properties trigger layout recalculation and run on the JS thread:

```tsx
// ❌ BAD - Triggers layout, causes jank
const badStyle = useAnimatedStyle(() => ({
  width: withSpring(expanded ? 200 : 100), // AVOID
  height: withSpring(expanded ? 200 : 100), // AVOID
  padding: withSpring(expanded ? 20 : 10), // AVOID
  margin: withSpring(expanded ? 20 : 10), // AVOID
  borderWidth: withSpring(expanded ? 2 : 1), // AVOID
}))
```

### Alternatives for Layout Animations

Instead of animating `width`/`height`, use `transform`:

```tsx
// ✅ GOOD - Use scaleX/scaleY instead of width/height
const progressStyle = useAnimatedStyle(() => ({
  transform: [{ scaleX: progress.value }],
}))

// Apply with transform-origin
<AnimatedView
  className="h-2 bg-primary origin-left"
  style={progressStyle}
/>
```

---

## Reanimated Patterns

### 1. Basic Shared Value Animation

```tsx
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'

function FadeInView({ children }) {
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withSpring(1)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return <AnimatedView style={animatedStyle}>{children}</AnimatedView>
}
```

### 2. Derived Values

```tsx
import { useDerivedValue, interpolate } from 'react-native-reanimated'

const scale = useDerivedValue(() => {
  return interpolate(progress.value, [0, 1], [0.8, 1])
})
```

### 3. Gesture-Driven Animations

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

function DraggableBox() {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX
      translateY.value = e.translationY
    })
    .onEnd(() => {
      translateX.value = withSpring(0)
      translateY.value = withSpring(0)
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }))

  return (
    <GestureDetector gesture={gesture}>
      <AnimatedView className="w-20 h-20 bg-primary rounded-xl" style={animatedStyle} />
    </GestureDetector>
  )
}
```

### 4. Entry/Exit Animations

```tsx
import { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated'
;<AnimatedView
  entering={FadeIn.duration(300)}
  exiting={FadeOut.duration(200)}
  className="bg-card p-4 rounded-xl"
>
  <Text>Animated content</Text>
</AnimatedView>
```

### 5. Layout Animations

```tsx
import { LinearTransition, FadeIn, FadeOut } from 'react-native-reanimated'

// Smooth list reordering
{
  items.map((item) => (
    <AnimatedView key={item.id} layout={LinearTransition} entering={FadeIn} exiting={FadeOut}>
      <ItemCard item={item} />
    </AnimatedView>
  ))
}
```

---

## Performance Checklist

Before deploying animations:

- [ ] Only animate GPU-friendly properties (`transform`, `opacity`)
- [ ] Use `useAnimatedStyle` for dynamic styles (not inline objects)
- [ ] Use `useDerivedValue` for computed animation values
- [ ] Add `'worklet'` directive when using `runOnJS` callbacks
- [ ] Memoize animated components with `React.memo` when appropriate
- [ ] Test on low-end devices to ensure 60fps

---

## Common Mistakes

### ❌ Inline Animated Styles

```tsx
// BAD - Creates new style object every render
<AnimatedView style={{ opacity: opacity.value }} />
```

### ✅ Use useAnimatedStyle

```tsx
// GOOD - Memoized animated style
const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
<AnimatedView style={style} />
```

### ❌ Animating Layout Properties

```tsx
// BAD - width animation triggers layout
const style = useAnimatedStyle(() => ({
  width: progress.value * 200,
}))
```

### ✅ Use Transform Instead

```tsx
// GOOD - scaleX is GPU-accelerated
const style = useAnimatedStyle(() => ({
  transform: [{ scaleX: progress.value }],
}))
```

---

## CSS Variable Hook

```tsx
import { useCSSVariable } from '@/tw'

function ThemedComponent() {
  const primaryColor = useCSSVariable('--color-primary')

  // Use in animated styles or inline styles
  return <View style={{ borderColor: primaryColor }} />
}
```
