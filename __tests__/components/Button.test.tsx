import { Button } from '@/components/ui/primitives/button'
import { fireEvent, render } from '../react-native-testing'

// Mock the tw components
vi.mock('@/tw', () => ({
  View: ({ children, ...props }: any) => {
    return <div {...props}>{children}</div>
  },
  Text: ({ children, ...props }: any) => {
    return <span {...props}>{children}</span>
  },
  Pressable: ({ children, onPress, ...props }: any) => {
    return (
      <button onPress={onPress} {...props}>
        {children}
      </button>
    )
  },
  ActivityIndicator: (props: any) => <span {...props} />,
}))

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

describe('Button Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with default props', () => {
    const { getByText } = render(<Button>Click me</Button>)

    expect(getByText('Click me')).toBeTruthy()
  })

  it('should call onPress when pressed', () => {
    const onPress = vi.fn()
    const { getByText } = render(<Button onPress={onPress}>Click me</Button>)

    fireEvent.press(getByText('Click me'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('should not call onPress when disabled', () => {
    const onPress = vi.fn()
    const { getByText } = render(
      <Button onPress={onPress} disabled>
        Click me
      </Button>,
    )

    fireEvent.press(getByText('Click me'))

    expect(onPress).not.toHaveBeenCalled()
  })

  it('should show loading indicator when isLoading is true', () => {
    const { queryByText } = render(<Button isLoading>Click me</Button>)

    expect(queryByText('Click me')).toBeNull()
  })
})
