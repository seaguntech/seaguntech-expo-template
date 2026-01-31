export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  isStreaming?: boolean
  error?: string
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  error: string | null
  conversationId: string | null
}

export interface StreamingResponse {
  id: string
  object: string
  created: number
  model: string
  choices: StreamingChoice[]
}

export interface StreamingChoice {
  index: number
  delta: {
    role?: MessageRole
    content?: string
  }
  finishReason: string | null
}

export interface CompletionRequest {
  messages: Pick<Message, 'role' | 'content'>[]
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface CompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: CompletionChoice[]
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface CompletionChoice {
  index: number
  message: {
    role: MessageRole
    content: string
  }
  finishReason: string
}

export interface PromptPreset {
  id: string
  name: string
  description: string
  systemPrompt: string
  category: PromptCategory
  icon?: string
  tags?: string[]
}

export type PromptCategory =
  | 'general'
  | 'coding'
  | 'writing'
  | 'analysis'
  | 'creative'
  | 'translation'
  | 'custom'

export interface AIContextValue {
  state: ChatState
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  stopStreaming: () => void
  setSystemPrompt: (prompt: string) => void
  regenerateLastResponse: () => Promise<void>
}

export interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  isDisabled?: boolean
  placeholder?: string
}

export interface MessageBubbleProps {
  message: Message
  isLast?: boolean
  onCopy?: (content: string) => void
  onRegenerate?: () => void
}
