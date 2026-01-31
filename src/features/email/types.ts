// Email Types

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
}

export interface SendEmailRequest {
  to: string
  subject: string
  template: 'welcome' | 'invite' | 'reset-password' | 'notification'
  variables?: Record<string, string>
}

export interface SendEmailResponse {
  id: string
  success: boolean
  error?: string
}
