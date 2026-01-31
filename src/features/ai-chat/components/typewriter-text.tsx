import { cn } from '@/shared/lib/utils'
import { Text } from '@/tw'
import React, { useEffect, useRef, useState } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}

export function TypewriterText({ text, speed = 20, className, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const indexRef = useRef(0)
  const previousTextRef = useRef('')

  useEffect(() => {
    // If text is shorter (regeneration), reset
    if (text.length < previousTextRef.current.length) {
      indexRef.current = 0
      setDisplayedText('')
    }
    previousTextRef.current = text

    if (indexRef.current >= text.length) {
      onComplete?.()
      return
    }

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1))
        indexRef.current += 1
      } else {
        clearInterval(interval)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <Text className={cn('text-base leading-6', className)}>
      {displayedText}
      {displayedText.length < text.length && <Text className="opacity-50">▌</Text>}
    </Text>
  )
}
