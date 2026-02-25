import type { OnboardingStep, OnboardingConfig } from '@/types'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Seaguntech',
    description:
      'Your all-in-one productivity app with AI-powered features, task management, and premium subscriptions.',
    icon: 'sparkles',
    features: [
      {
        id: 'ai',
        title: 'AI Assistant',
        description: 'Chat with AI to boost your productivity',
        icon: 'brain',
      },
      {
        id: 'tasks',
        title: 'Task Management',
        description: 'Organize and track your tasks effortlessly',
        icon: 'checkmark.circle',
      },
      {
        id: 'sync',
        title: 'Cloud Sync',
        description: 'Your data synced across all devices',
        icon: 'cloud',
      },
    ],
  },
  {
    id: 'permissions',
    title: 'Enable Notifications',
    description:
      'Stay updated with task reminders and important alerts. You can customize these settings anytime.',
    icon: 'bell',
    action: {
      type: 'permission',
      permission: 'notifications',
      buttonText: 'Enable Notifications',
    },
  },
  {
    id: 'tutorial',
    title: "You're All Set!",
    description:
      'Start exploring the app and discover all the features designed to help you be more productive.',
    icon: 'checkmark.seal',
    action: {
      type: 'button',
      buttonText: 'Get Started',
    },
  },
]

export const ONBOARDING_CONFIG: OnboardingConfig = {
  steps: ONBOARDING_STEPS,
  allowSkip: true,
  showProgressBar: true,
  animationType: 'slide',
}

export const ONBOARDING_FEATURE_HIGHLIGHTS = [
  {
    id: 'ai-chat',
    title: 'AI-Powered Chat',
    description: 'Get instant help with our intelligent AI assistant',
    icon: 'bubble.left.and.bubble.right',
    screen: 'ai',
  },
  {
    id: 'task-management',
    title: 'Smart Tasks',
    description: 'Create, organize, and complete tasks with ease',
    icon: 'list.bullet.rectangle',
    screen: 'tasks',
  },
  {
    id: 'offline-mode',
    title: 'Offline Support',
    description: "Work without internet, sync when you're back online",
    icon: 'wifi.slash',
    screen: 'offline',
  },
  {
    id: 'premium',
    title: 'Premium Features',
    description: 'Unlock advanced features with a subscription',
    icon: 'star.fill',
    screen: 'premium',
  },
] as const

export const TOTAL_ONBOARDING_STEPS = ONBOARDING_STEPS.length
