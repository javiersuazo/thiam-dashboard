import { useQuery, useMutation } from '@tanstack/react-query'
import { chatService, type SendMessageRequest } from '../api/chat.service'
import { chatAdapter } from '../adapters/chat.adapter'
import type { Message } from '../types'

const USE_MOCK_DATA = true

export const CHAT_KEYS = {
  all: ['chat'] as const,
  history: () => [...CHAT_KEYS.all, 'history'] as const,
}

export function useChatHistory() {
  return useQuery({
    queryKey: CHAT_KEYS.history(),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        const apiMessages = await chatService.getMessageHistory()
        return chatAdapter.toMessages(apiMessages)
      }
      const apiMessages = await chatService.getMessageHistory()
      return chatAdapter.toMessages(apiMessages)
    },
    staleTime: 0,
  })
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async ({ message, onStream }: SendMessageRequest & { onStream?: (text: string) => void }) => {
      if (USE_MOCK_DATA) {
        if (onStream) {
          let streamedText = ''
          await chatService.streamMessage({ message }, (chunk) => {
            streamedText += chunk
            onStream(streamedText)
          })
          return null
        }

        const apiResponse = await chatService.sendMessage({ message })
        return chatAdapter.toMessage(apiResponse.message)
      }

      if (onStream) {
        let streamedText = ''
        await chatService.streamMessage({ message }, (chunk) => {
          streamedText += chunk
          onStream(streamedText)
        })
        return null
      }

      const apiResponse = await chatService.sendMessage({ message })
      return chatAdapter.toMessage(apiResponse.message)
    },
  })
}

export function useGenerateTableData() {
  return useMutation({
    mutationFn: async ({ query }: { query: string }): Promise<Message> => {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockTable = {
        headers: ['Order ID', 'Customer', 'Amount', 'Status'],
        rows: [
          { orderId: '#12345', customer: 'John Doe', amount: '$250.00', status: 'Completed' },
          { orderId: '#12346', customer: 'Jane Smith', amount: '$180.50', status: 'Pending' },
          { orderId: '#12347', customer: 'Bob Johnson', amount: '$420.00', status: 'Completed' },
        ],
      }

      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: `Here are the results for "${query}":`,
          },
          {
            type: 'table',
            table: mockTable,
          },
        ],
        timestamp: new Date(),
      }
    },
  })
}
