import React, { type ReactElement, type ReactNode } from 'react'
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer'

const DEFAULT_WAIT_TIMEOUT = 3000
const DEFAULT_WAIT_INTERVAL = 20

const hasText = (node: ReactTestInstance, text: string): boolean => {
  return node.children.some((child) => {
    if (typeof child === 'string') {
      return child === text
    }
    return false
  })
}

const findByText = (renderer: ReactTestRenderer, text: string): ReactTestInstance[] => {
  return renderer.root.findAll((node) => hasText(node, text))
}

const getPressHandler = (node: ReactTestInstance): (() => void) | null => {
  let current: ReactTestInstance | null = node
  while (current) {
    const onPress = current.props?.onPress
    if (typeof onPress === 'function' && !current.props?.disabled) {
      return onPress as () => void
    }
    current = current.parent
  }
  return null
}

export const fireEvent = {
  press: (node: ReactTestInstance) => {
    const pressHandler = getPressHandler(node)
    if (!pressHandler) {
      return
    }
    act(() => {
      pressHandler()
    })
  },
}

export const render = (ui: ReactElement) => {
  let renderer: ReactTestRenderer
  act(() => {
    renderer = create(ui)
  })

  const getByText = (text: string) => {
    const matches = findByText(renderer!, text)
    if (matches.length === 0) {
      throw new Error(`Unable to find element with text: ${text}`)
    }
    return matches[0]
  }

  const queryByText = (text: string) => {
    const matches = findByText(renderer!, text)
    return matches[0] ?? null
  }

  return {
    getByText,
    queryByText,
    unmount: () => renderer!.unmount(),
  }
}

interface RenderHookOptions {
  wrapper?: (props: { children: ReactNode }) => ReactElement
}

export const renderHook = <T,>(callback: () => T, options?: RenderHookOptions) => {
  const result: { current: T | undefined } = { current: undefined }

  const TestHook = () => {
    result.current = callback()
    return null
  }

  const Wrapper = options?.wrapper
  let renderer: ReactTestRenderer

  act(() => {
    renderer = create(
      Wrapper ? (
        <Wrapper>
          <TestHook />
        </Wrapper>
      ) : (
        <TestHook />
      ),
    )
  })

  return {
    result: result as { current: T },
    unmount: () => renderer!.unmount(),
  }
}

export { act }

export const waitFor = async (
  assertion: () => void,
  options?: { timeout?: number; interval?: number },
) => {
  const timeout = options?.timeout ?? DEFAULT_WAIT_TIMEOUT
  const interval = options?.interval ?? DEFAULT_WAIT_INTERVAL
  const endTime = Date.now() + timeout

  let lastError: unknown
  while (Date.now() < endTime) {
    try {
      assertion()
      return
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  throw lastError ?? new Error('waitFor timed out')
}
