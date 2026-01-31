import { supabase } from '@/config/supabase'
import { Button } from '@/shared/ui/primitives'
import React, { useState } from 'react'
import { Linking } from 'react-native'

interface ButtonSendEmailProps {
  to: string
  subject?: string
  templateId?: string
  templateData?: Record<string, unknown>
  onSuccess?: () => void
  onError?: (error: string) => void
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ButtonSendEmail({
  to,
  subject,
  templateId,
  templateData,
  onSuccess,
  onError,
  children,
  variant = 'primary',
  size = 'md',
  className,
}: ButtonSendEmailProps) {
  const [isSending, setIsSending] = useState(false)

  const handleSendEmail = async () => {
    setIsSending(true)

    try {
      if (templateId) {
        // Send via Supabase Edge Function (Resend)
        const { error } = await supabase.functions.invoke('resend-email', {
          body: {
            to,
            subject,
            templateId,
            templateData,
          },
        })

        if (error) throw error
        onSuccess?.()
      } else {
        // Open native email client
        const mailtoUrl = `mailto:${to}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
        const canOpen = await Linking.canOpenURL(mailtoUrl)

        if (canOpen) {
          await Linking.openURL(mailtoUrl)
          onSuccess?.()
        } else {
          throw new Error('Cannot open email client')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email'
      onError?.(errorMessage)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onPress={handleSendEmail}
      isLoading={isSending}
      className={className}
    >
      {children ?? 'Send Email'}
    </Button>
  )
}
