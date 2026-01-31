import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/ui/primitives'
import { Text, View } from '@/tw'

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function SettingsSection({ title, children, className }: SettingsSectionProps) {
  return (
    <View className={cn('mb-6', className)}>
      <Text className="text-lg font-semibold text-foreground mb-3">{title}</Text>
      <Card variant="outlined">
        <CardContent>{children}</CardContent>
      </Card>
    </View>
  )
}
