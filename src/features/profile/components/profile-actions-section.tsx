import { cn } from '@/shared/lib/utils'
import { Button, Card, CardContent } from '@/shared/ui/primitives'
import { Text, View } from '@/tw'
import { useTranslation } from 'react-i18next'

interface ProfileActionsSectionProps {
  onSignOut: () => void
  onDeleteAccount: () => void
  isSigningOut?: boolean
  className?: string
}

export function ProfileActionsSection({
  onSignOut,
  onDeleteAccount,
  isSigningOut = false,
  className,
}: ProfileActionsSectionProps) {
  const { t } = useTranslation()

  return (
    <View className={cn('gap-4', className)}>
      <Button variant="outline" size="lg" onPress={onSignOut} isLoading={isSigningOut}>
        {t('auth.signOut')}
      </Button>

      <Card variant="outlined" className="border-destructive/50">
        <CardContent>
          <Text className="text-lg font-semibold text-destructive mb-2">
            {t('profile.deleteAccount')}
          </Text>
          <Text className="text-sm text-muted-foreground mb-4">
            {t('profile.deleteAccountWarning')}
          </Text>
          <Button variant="destructive" size="md" onPress={onDeleteAccount}>
            {t('profile.deleteAccount')}
          </Button>
        </CardContent>
      </Card>
    </View>
  )
}
