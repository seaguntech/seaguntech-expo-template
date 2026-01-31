// AI Chat Types

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
  isStreaming?: boolean
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface AiCompletionRequest {
  messages: {
    role: 'system' | 'user' | 'assistant'
    content: string
  }[]
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface AiCompletionResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface UseAiChatOptions {
  systemPrompt?: string
  onError?: (error: Error) => void
}

export interface UseAiChatResult {
  messages: ChatMessage[]
  isLoading: boolean
  isStreaming: boolean
  error: Error | null
  sendMessage: (content: string) => Promise<void>
  regenerateLastResponse: () => Promise<void>
  clearMessages: () => void
  setSystemPrompt: (prompt: string) => void
}
