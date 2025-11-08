export interface ApiMessage {
  id: string
  role: string
  content: unknown[]
  created_at: string
  is_streaming?: boolean
}

export interface SendMessageRequest {
  message: string
  context?: Record<string, unknown>
}

export interface SendMessageResponse {
  message: ApiMessage
  suggested_actions?: string[]
}

export const chatService = {
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: `You said: "${request.message}". This is a mock response from TASTY LABS AI.`,
          }
        ],
        created_at: new Date().toISOString(),
      },
    }
  },

  async getMessageHistory(): Promise<ApiMessage[]> {
    await new Promise(resolve => setTimeout(resolve, 500))

    return []
  },

  async streamMessage(
    request: SendMessageRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const fullResponse = `This is a streamed response to: "${request.message}". I can help you with menu planning, order management, inventory tracking, and more!`

    const words = fullResponse.split(' ')

    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 50))
      onChunk(word + ' ')
    }
  },
}
