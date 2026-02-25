import React from 'react'
import { ScrollView, Text, View } from '@/tw'
import { useTranslation } from 'react-i18next'

export default function TermsOfServiceScreen() {
  const { t } = useTranslation()

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-6">
      <Text className="text-2xl font-bold text-foreground mb-6">
        {t('settings.termsOfService')}
      </Text>

      <Section title="1. Acceptance of Terms">
        By accessing or using Seaguntech, you agree to be bound by these Terms of Service. If you do
        not agree to these terms, please do not use our service.
      </Section>

      <Section title="2. Description of Service">
        Seaguntech is a productivity application that provides task management, AI-powered
        assistance, and other features to help you be more productive. Some features may require a
        premium subscription.
      </Section>

      <Section title="3. User Accounts">
        You are responsible for maintaining the confidentiality of your account credentials and for
        all activities that occur under your account. You must provide accurate and complete
        information when creating an account.
      </Section>

      <Section title="4. Subscriptions and Payments">
        Premium features are available through subscription plans. Payment will be charged to your
        App Store or Google Play account. Subscriptions automatically renew unless cancelled at
        least 24 hours before the end of the current period.
      </Section>

      <Section title="5. User Content">
        You retain ownership of any content you create or upload to the service. By using our
        service, you grant us a license to store, process, and display your content as necessary to
        provide the service.
      </Section>

      <Section title="6. Prohibited Uses">
        You agree not to use the service for any unlawful purpose, to harass or harm others, to
        distribute malware, or to attempt to gain unauthorized access to our systems.
      </Section>

      <Section title="7. AI Features">
        Our AI features are provided for productivity assistance. The AI may not always provide
        accurate information. You are responsible for verifying any information or suggestions
        provided by the AI.
      </Section>

      <Section title="8. Intellectual Property">
        The service and its original content, features, and functionality are owned by Seaguntech
        and are protected by international copyright, trademark, and other intellectual property
        laws.
      </Section>

      <Section title="9. Limitation of Liability">
        To the maximum extent permitted by law, Seaguntech shall not be liable for any indirect,
        incidental, special, consequential, or punitive damages resulting from your use of the
        service.
      </Section>

      <Section title="10. Termination">
        We may terminate or suspend your account at any time for violations of these terms. Upon
        termination, your right to use the service will immediately cease.
      </Section>

      <Section title="11. Changes to Terms">
        We reserve the right to modify these terms at any time. We will provide notice of
        significant changes. Continued use of the service after changes constitutes acceptance of
        the new terms.
      </Section>

      <Section title="12. Governing Law">
        These terms shall be governed by and construed in accordance with applicable laws, without
        regard to conflict of law principles.
      </Section>

      <Section title="13. Contact Information" isLast>
        For questions about these Terms of Service, please contact us at legal@seaguntech.com.
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
