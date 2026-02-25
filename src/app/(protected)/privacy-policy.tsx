import React from 'react'
import { ScrollView, Text, View } from '@/tw'
import { useTranslation } from 'react-i18next'

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation()

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-6">
      <Text className="text-2xl font-bold text-foreground mb-6">{t('settings.privacyPolicy')}</Text>

      <Section title="1. Introduction">
        Welcome to Seaguntech. We respect your privacy and are committed to protecting your personal
        data. This privacy policy explains how we collect, use, and safeguard your information when
        you use our mobile application.
      </Section>

      <Section title="2. Information We Collect">
        We collect information you provide directly to us, such as when you create an account,
        update your profile, or contact us for support. This may include your name, email address,
        and profile picture.
      </Section>

      <Section title="3. How We Use Your Information">
        We use the information we collect to provide, maintain, and improve our services, process
        transactions, send you technical notices and support messages, and respond to your comments
        and questions.
      </Section>

      <Section title="4. Data Storage and Security">
        We use industry-standard security measures to protect your data. Your information is stored
        securely using Supabase, which employs encryption and other security technologies.
      </Section>

      <Section title="5. Third-Party Services">
        We may share your information with third-party service providers that perform services on
        our behalf, such as payment processing (Stripe), subscription management (RevenueCat), and
        analytics.
      </Section>

      <Section title="6. Your Rights">
        You have the right to access, update, or delete your personal information at any time. You
        can do this through the app settings or by contacting our support team.
      </Section>

      <Section title="7. Data Retention">
        We retain your personal information for as long as your account is active or as needed to
        provide you services. You may request deletion of your account and associated data at any
        time.
      </Section>

      <Section title="8. Children's Privacy">
        Our service is not directed to children under 13. We do not knowingly collect personal
        information from children under 13.
      </Section>

      <Section title="9. Changes to This Policy">
        We may update this privacy policy from time to time. We will notify you of any changes by
        posting the new policy on this page and updating the effective date.
      </Section>

      <Section title="10. Contact Us" isLast>
        If you have any questions about this privacy policy, please contact us at
        support@seaguntech.com.
      </Section>

      <Text className="text-sm text-muted-foreground text-center mt-8">
        Last updated: January 2026
      </Text>
    </ScrollView>
  )
}

function Section({
  title,
  children,
  isLast = false,
}: {
  title: string
  children: React.ReactNode
  isLast?: boolean
}) {
  return (
    <View className={!isLast ? 'mb-6' : ''}>
      <Text className="text-lg font-semibold text-foreground mb-2">{title}</Text>
      <Text className="text-base text-muted-foreground leading-6">{children}</Text>
    </View>
  )
}
