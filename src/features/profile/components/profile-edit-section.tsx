import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/ui/primitives'
import { Pressable, Text, View } from '@/tw'
import type { ProfileField } from '@/types'

interface ProfileEditSectionProps {
  displayName: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  bio: string | null
  onEditField: (field: ProfileField, currentValue: string) => void
  className?: string
}

export function ProfileEditSection({
  displayName,
  firstName,
  lastName,
  phone,
  bio,
  onEditField,
  className,
}: ProfileEditSectionProps) {
  return (
    <View className={className}>
      <Text className="text-lg font-semibold text-foreground mb-3">Edit Profile</Text>
      <Card variant="outlined">
        <CardContent>
          <EditRow
            label="Display Name"
            value={displayName}
            onPress={() => onEditField('displayName', displayName ?? '')}
          />
          <EditRow
            label="First Name"
            value={firstName}
            onPress={() => onEditField('firstName', firstName ?? '')}
          />
          <EditRow
            label="Last Name"
            value={lastName}
            onPress={() => onEditField('lastName', lastName ?? '')}
          />
          <EditRow label="Phone" value={phone} onPress={() => onEditField('phone', phone ?? '')} />
          <EditRow label="Bio" value={bio} onPress={() => onEditField('bio', bio ?? '')} isLast />
        </CardContent>
      </Card>
    </View>
  )
}

function EditRow({
  label,
  value,
  onPress,
  isLast = false,
}: {
  label: string
  value: string | null
  onPress: () => void
  isLast?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row justify-between items-center py-3',
        !isLast && 'border-b border-border',
      )}
    >
      <Text className="text-foreground">{label}</Text>
      <View className="flex-row items-center">
        <Text
          className={cn('mr-2', value ? 'text-foreground' : 'text-muted-foreground')}
          numberOfLines={1}
        >
          {value || 'Not set'}
        </Text>
        <Text className="text-muted-foreground">→</Text>
      </View>
    </Pressable>
  )
}
