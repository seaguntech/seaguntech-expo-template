import { cn } from '@/shared/lib/utils'
import { AnimatedView, Modal, Pressable, Text, View } from '@/tw'
import React from 'react'
import { Keyboard } from 'react-native'
import { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { Button } from './button'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable onPress={Keyboard.dismiss} className="flex-1">
        <AnimatedView
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="flex-1 justify-center items-center bg-black/50 px-4"
        >
          <Pressable onPress={() => {}}>
            <AnimatedView
              entering={SlideInDown.springify().damping(15)}
              exiting={SlideOutDown.duration(200)}
            >
              <View className={cn('bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl', className)}>
                {title && (
                  <Text className="text-xl font-semibold text-card-foreground mb-2">{title}</Text>
                )}
                {description && (
                  <Text className="text-base text-muted-foreground mb-4">{description}</Text>
                )}
                {children}
              </View>
            </AnimatedView>
          </Pressable>
        </AnimatedView>
      </Pressable>
    </Modal>
  )
}

interface DialogActionsProps {
  children: React.ReactNode
  className?: string
}

export function DialogActions({ children, className }: DialogActionsProps) {
  return <View className={cn('flex-row justify-end gap-3 mt-6', className)}>{children}</View>
}

interface AlertDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
}

export function AlertDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}: AlertDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <DialogActions>
        <Button variant="ghost" onPress={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'primary'}
          onPress={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
