export interface QuickAction {
  type: string
  title: string
  subtitle: string
  icon: string
  route: string
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    type: 'new_task',
    title: 'New Task',
    subtitle: 'Create a new task',
    icon: 'plus.circle.fill',
    route: '/(protected)/(tabs)/tasks?action=create',
  },
  {
    type: 'ai_chat',
    title: 'AI Chat',
    subtitle: 'Start a conversation',
    icon: 'bubble.left.and.bubble.right.fill',
    route: '/(protected)/(tabs)/ai',
  },
  {
    type: 'search',
    title: 'Search',
    subtitle: 'Search tasks and notes',
    icon: 'magnifyingglass',
    route: '/(protected)/(tabs)?action=search',
  },
  {
    type: 'settings',
    title: 'Settings',
    subtitle: 'App preferences',
    icon: 'gear',
    route: '/(protected)/(tabs)/settings',
  },
]

export const HOME_QUICK_ACTIONS = [
  {
    id: 'add-task',
    label: 'Add Task',
    icon: 'plus.circle',
    color: '#2563eb',
    action: 'navigate',
    route: '/(protected)/(tabs)/tasks',
    params: { action: 'create' },
  },
  {
    id: 'ai-chat',
    label: 'AI Chat',
    icon: 'bubble.left.and.bubble.right',
    color: '#8b5cf6',
    action: 'navigate',
    route: '/(protected)/(tabs)/ai',
  },
  {
    id: 'view-premium',
    label: 'Premium',
    icon: 'star.fill',
    color: '#f59e0b',
    action: 'navigate',
    route: '/(protected)/(tabs)/premium',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'bell.fill',
    color: '#ef4444',
    action: 'navigate',
    route: '/(protected)/(tabs)/notifications',
  },
] as const

export const WIDGET_ACTIONS = {
  OPEN_APP: 'open_app',
  CREATE_TASK: 'create_task',
  OPEN_AI: 'open_ai',
  VIEW_TASKS: 'view_tasks',
} as const

export type QuickActionType = (typeof QUICK_ACTIONS)[number]['type']
export type WidgetAction = (typeof WIDGET_ACTIONS)[keyof typeof WIDGET_ACTIONS]
