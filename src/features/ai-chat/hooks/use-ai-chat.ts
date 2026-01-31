import { useState, useCallback, useRef } from 'react'
import { supabase } from '@/config/supabase'
import type { Message, ChatState, CompletionRequest } from '@/types'

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

interface UseAIChatOptions {
  systemPrompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: null,
    conversationId: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const systemPromptRef = useRef(options.systemPrompt ?? '')

  const setSystemPrompt = useCallback((prompt: string) => {
    systemPromptRef.current = prompt
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isStreaming: true,
      }

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage, assistantMessage],
        isLoading: true,
        isStreaming: true,
        error: null,
      }))

      abortControllerRef.current = new AbortController()

      try {
        const messagesToSend = [
          ...(systemPromptRef.current
            ? [{ role: 'system' as const, content: systemPromptRef.current }]
            : []),
          ...state.messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content: content.trim() },
        ]

        const request: CompletionRequest = {
          messages: messagesToSend,
          model: options.model ?? 'gpt-4o-mini',
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? 2048,
          stream: true,
        }

        const { data, error } = await supabase.functions.invoke('ai-completion', {
          body: request,
        })

        if (error) throw error

        // Handle streaming response
        if (data?.content) {
          setState((prev) => ({
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: data.content, isStreaming: false }
                : m,
            ),
            isLoading: false,
            isStreaming: false,
          }))
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get response'

        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === assistantMessage.id ? { ...m, error: errorMessage, isStreaming: false } : m,
          ),
          isLoading: false,
          isStreaming: false,
          error: errorMessage,
        }))
      }
    },
    [state.messages, options.model, options.temperature, options.maxTokens],
  )

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort()
    setState((prev) => ({
      ...prev,
      isLoading: false,
      isStreaming: false,
      messages: prev.messages.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
    }))
  }, [])

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      isStreaming: false,
      error: null,
      conversationId: null,
    })
  }, [])

  const regenerateLastResponse = useCallback(async () => {
    const lastUserMessage = [...state.messages].reverse().find((m) => m.role === 'user')

    if (!lastUserMessage) return

    // Remove last assistant message
    setState((prev) => ({
      ...prev,
      messages: prev.messages.slice(0, -1),
    }))

    // Resend the last user message
    await sendMessage(lastUserMessage.content)
  }, [state.messages, sendMessage])

  return {
    state,
    sendMessage,
    stopStreaming,
    clearMessages,
    setSystemPrompt,
    regenerateLastResponse,
  }
}
