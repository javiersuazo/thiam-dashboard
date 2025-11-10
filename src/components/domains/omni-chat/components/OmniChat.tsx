'use client'

import { useEffect, useRef } from 'react'
import { useChatState } from '../hooks/useChatState'
import { useChatHistory, useSendMessage } from '../hooks/useChatData'
import type { Message, ChatMode } from '../types'
import { ChatBubble } from './ChatBubble'
import { ChatWindow } from './ChatWindow'
import { ChatMinimized } from './ChatMinimized'

export interface ChatStateInfo {
  mode: ChatMode
  isExpanded: boolean
}

interface OmniChatProps {
  initialMode?: ChatMode
  onMessageSent?: (message: string) => void
  onStateChange?: (state: ChatStateInfo) => void
}

export function OmniChat({
  initialMode = 'minimized',
  onMessageSent,
  onStateChange,
}: OmniChatProps) {
  const chatState = useChatState({
    initialMode,
  })

  useEffect(() => {
    onStateChange?.({
      mode: chatState.mode,
      isExpanded: chatState.isExpanded,
    })
  }, [chatState.mode, chatState.isExpanded, onStateChange])

  const { data: historyMessages = [] } = useChatHistory()
  const sendMessageMutation = useSendMessage()

  useEffect(() => {
    if (historyMessages.length > 0 && chatState.messages.length === 0) {
      historyMessages.forEach(msg => {
        chatState.addMessage({
          role: msg.role,
          content: msg.content,
          isStreaming: false,
        })
      })
    }
  }, [historyMessages])

  const handleSendMessage = async () => {
    if (!chatState.inputValue.trim()) return

    const userMessage = chatState.inputValue
    chatState.addMessage({
      role: 'user',
      content: [{ type: 'text', text: userMessage }],
    })

    chatState.clearInput()
    chatState.setLoading(true)

    const tempId = chatState.addMessage({
      role: 'assistant',
      content: [{ type: 'text', text: '' }],
      isStreaming: true,
    }).id

    try {
      await sendMessageMutation.mutateAsync({
        message: userMessage,
        onStream: (text) => {
          chatState.updateMessage(tempId, {
            content: [{ type: 'text', text }],
          })
        },
      })

      chatState.updateMessage(tempId, { isStreaming: false })
      onMessageSent?.(userMessage)
    } catch (error) {
      chatState.updateMessage(tempId, {
        content: [{ type: 'text', text: 'Sorry, something went wrong. Please try again.' }],
        isStreaming: false,
      })
    } finally {
      chatState.setLoading(false)
    }
  }

  if (chatState.mode === 'minimized') {
    return (
      <ChatMinimized
        position={chatState.floatingPosition}
        onClick={chatState.toggleSidebar}
      />
    )
  }

  if (chatState.mode === 'floating') {
    return (
      <ChatBubble
        position={chatState.floatingPosition}
        isDragging={chatState.isDragging}
        messages={chatState.messages}
        inputValue={chatState.inputValue}
        isLoading={chatState.isLoading}
        onStartDrag={chatState.startDrag}
        onDrag={chatState.onDrag}
        onEndDrag={chatState.endDrag}
        onSendMessage={handleSendMessage}
        onInputChange={chatState.setInput}
        onMinimize={chatState.toggleMinimize}
        onFullscreen={chatState.toggleFullscreen}
      />
    )
  }

  return (
    <ChatWindow
      mode={chatState.mode}
      messages={chatState.messages}
      inputValue={chatState.inputValue}
      isLoading={chatState.isLoading}
      onSendMessage={handleSendMessage}
      onInputChange={chatState.setInput}
      onClose={chatState.mode === 'sidebar' ? chatState.toggleSidebar : chatState.toggleMinimize}
      onFullscreen={chatState.toggleFullscreen}
    />
  )
}
