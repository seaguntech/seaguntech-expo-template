export const EMAIL_TEMPLATES = {
  WELCOME: {
    id: 'welcome',
    subject: 'Welcome to Seaguntech!',
    description: 'Sent when a new user signs up',
  },
  PASSWORD_RESET: {
    id: 'password-reset',
    subject: 'Reset Your Password',
    description: 'Sent when user requests password reset',
  },
  EMAIL_VERIFICATION: {
    id: 'email-verification',
    subject: 'Verify Your Email',
    description: 'Sent to verify email address',
  },
  SUBSCRIPTION_WELCOME: {
    id: 'subscription-welcome',
    subject: 'Welcome to Premium!',
    description: 'Sent when user subscribes to premium',
  },
  SUBSCRIPTION_EXPIRING: {
    id: 'subscription-expiring',
    subject: 'Your Subscription is Expiring Soon',
    description: 'Sent before subscription expires',
  },
  SUBSCRIPTION_EXPIRED: {
    id: 'subscription-expired',
    subject: 'Your Subscription Has Expired',
    description: 'Sent when subscription expires',
  },
  SUBSCRIPTION_RENEWED: {
    id: 'subscription-renewed',
    subject: 'Subscription Renewed Successfully',
    description: 'Sent when subscription auto-renews',
  },
  PAYMENT_RECEIPT: {
    id: 'payment-receipt',
    subject: 'Payment Receipt',
    description: 'Sent after successful payment',
  },
  PAYMENT_FAILED: {
    id: 'payment-failed',
    subject: 'Payment Failed',
    description: 'Sent when payment fails',
  },
  ACCOUNT_DELETED: {
    id: 'account-deleted',
    subject: 'Account Deleted',
    description: 'Sent when account is deleted',
  },
  INVITE: {
    id: 'invite',
    subject: "You've Been Invited to Seaguntech",
    description: 'Sent when user is invited by another user',
  },
} as const

export const EMAIL_PLACEHOLDERS = {
  USER_NAME: '{{user_name}}',
  USER_EMAIL: '{{user_email}}',
  APP_NAME: '{{app_name}}',
  RESET_LINK: '{{reset_link}}',
  VERIFICATION_LINK: '{{verification_link}}',
  INVITE_LINK: '{{invite_link}}',
  SUBSCRIPTION_PLAN: '{{subscription_plan}}',
  EXPIRY_DATE: '{{expiry_date}}',
  AMOUNT: '{{amount}}',
  CURRENCY: '{{currency}}',
  RECEIPT_URL: '{{receipt_url}}',
  CURRENT_YEAR: '{{current_year}}',
  SUPPORT_EMAIL: '{{support_email}}',
} as const

export const EMAIL_CONFIG = {
  fromName: 'Seaguntech',
  fromEmail: 'noreply@seaguntech.com',
  replyTo: 'support@seaguntech.com',
  supportEmail: 'support@seaguntech.com',
} as const

export type EmailTemplateId = keyof typeof EMAIL_TEMPLATES
export type EmailPlaceholder = (typeof EMAIL_PLACEHOLDERS)[keyof typeof EMAIL_PLACEHOLDERS]
