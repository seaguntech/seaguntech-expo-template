import { fireEvent, render } from '@testing-library/react-native'

// Mock the tw components
jest.mock('@/tw', () => ({
  View: ({ children, ...props }: any) => {
    const { View } = require('react-native')
    return <View {...props}>{children}</View>
  },
  Text: ({ children, ...props }: any) => {
    const { Text } = require('react-native')
    return <Text {...props}>{children}</Text>
  },
  Pressable: ({ children, onPress, ...props }: any) => {
    const { TouchableOpacity } = require('react-native')
    return (
      <TouchableOpacity onPress={onPress} {...props}>
        {children}
      </TouchableOpacity>
    )
  },
  ActivityIndicator: (props: any) => {
    const { ActivityIndicator } = require('react-native')
    return <ActivityIndicator {...props} />
  },
}))

// Mock cn utility
jest.mock('@/shared/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

describe('Button Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with default props', () => {
    const { Button } = require('@/shared/ui/primitives/button')
    const { getByText } = render(<Button>Click me</Button>)

    expect(getByText('Click me')).toBeTruthy()
  })

  it('should call onPress when pressed', () => {
    const { Button } = require('@/shared/ui/primitives/button')
    const onPress = jest.fn()
    const { getByText } = render(<Button onPress={onPress}>Click me</Button>)

    fireEvent.press(getByText('Click me'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('should not call onPress when disabled', () => {
    const { Button } = require('@/shared/ui/primitives/button')
    const onPress = jest.fn()
    const { getByText } = render(
      <Button onPress={onPress} disabled>
        Click me
      </Button>,
    )

    fireEvent.press(getByText('Click me'))

    expect(onPress).not.toHaveBeenCalled()
  })

  it('should show loading indicator when isLoading is true', () => {
    const { Button } = require('@/shared/ui/primitives/button')
    const { queryByText } = render(<Button isLoading>Click me</Button>)

    expect(queryByText('Click me')).toBeNull()
  })
})
