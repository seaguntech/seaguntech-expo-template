import { cn, formatDate } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/ui/primitives'
import { Text, View } from '@/tw'
import type { Profile } from '@/types'

interface ProfileInfoSectionProps {
  profile: Profile | null
  className?: string
}

export function ProfileInfoSection({ profile, className }: ProfileInfoSectionProps) {
  return (
    <View className={className}>
      <Text className="text-lg font-semibold text-foreground mb-3">Account Information</Text>
      <Card variant="outlined">
        <CardContent>
          <InfoRow label="Email" value={profile?.email ?? '-'} />
          <InfoRow label="Display Name" value={profile?.displayName ?? 'Not set'} />
          <InfoRow label="First Name" value={profile?.firstName ?? 'Not set'} />
          <InfoRow label="Last Name" value={profile?.lastName ?? 'Not set'} />
          <InfoRow label="Phone" value={profile?.phone ?? 'Not set'} />
          <InfoRow label="Bio" value={profile?.bio ?? 'Not set'} />
          <InfoRow
            label="Member Since"
            value={profile?.createdAt ? formatDate(profile.createdAt) : '-'}
            isLast
          />
        </CardContent>
      </Card>
    </View>
  )
}

function InfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string
  value: string
  isLast?: boolean
}) {
  return (
    <View className={cn('flex-row justify-between py-3', !isLast && 'border-b border-border')}>
      <Text className="text-muted-foreground">{label}</Text>
      <Text className="text-foreground font-medium flex-1 text-right ml-4" numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}
