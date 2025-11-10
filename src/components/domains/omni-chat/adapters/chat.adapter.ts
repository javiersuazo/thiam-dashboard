import type { Message, MessageContent, MessageRole } from '../types'
import type { ApiMessage } from '../api/chat.service'

type ApiMessageContent = Record<string, unknown>

export const chatAdapter = {
  toMessage(apiMessage: ApiMessage): Message {
    return {
      id: apiMessage.id,
      role: apiMessage.role as MessageRole,
      content: (apiMessage.content as ApiMessageContent[]).map(c => this.toMessageContent(c)),
      timestamp: new Date(apiMessage.created_at),
      isStreaming: apiMessage.is_streaming,
    }
  },

  toMessages(apiMessages: ApiMessage[]): Message[] {
    return apiMessages.map(msg => this.toMessage(msg))
  },

  toMessageContent(apiContent: ApiMessageContent): MessageContent {
    const type = (apiContent.type as string) || 'text'

    if (type === 'text') {
      return {
        type: 'text',
        text: apiContent.text as string,
      }
    }

    if (type === 'table') {
      return {
        type: 'table',
        table: {
          headers: (apiContent.headers as string[]) || [],
          rows: (apiContent.rows as Array<Record<string, unknown>>) || [],
        },
      }
    }

    if (type === 'component') {
      return {
        type: 'component',
        component: {
          type: (apiContent.component_type as string) || 'unknown',
          props: (apiContent.props as Record<string, unknown>) || {},
        },
      }
    }

    return {
      type: 'text',
      text: JSON.stringify(apiContent),
    }
  },

  fromMessage(message: Omit<Message, 'id' | 'timestamp'>): ApiMessage {
    return {
      id: '',
      role: message.role,
      content: message.content.map(c => this.fromMessageContent(c)),
      created_at: new Date().toISOString(),
      is_streaming: message.isStreaming,
    }
  },

  fromMessageContent(content: MessageContent): ApiMessageContent {
    if (content.type === 'text') {
      return {
        type: 'text',
        text: content.text,
      }
    }

    if (content.type === 'table' && content.table) {
      return {
        type: 'table',
        headers: content.table.headers,
        rows: content.table.rows,
      }
    }

    if (content.type === 'component' && content.component) {
      return {
        type: 'component',
        component_type: content.component.type,
        props: content.component.props,
      }
    }

    return {
      type: 'text',
      text: JSON.stringify(content),
    }
  },
}
