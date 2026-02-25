// ExternalLink - Opens URLs in browser
import { Linking, Pressable, type PressableProps } from 'react-native'

interface ExternalLinkProps extends Omit<PressableProps, 'onPress'> {
  href: string
  children: React.ReactNode
}

export function ExternalLink({ href, children, ...props }: ExternalLinkProps) {
  return (
    <Pressable onPress={() => Linking.openURL(href)} {...props}>
      {children}
    </Pressable>
  )
}
