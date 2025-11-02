'use client'

import { useRef, useEffect } from 'react'
import type { Position, Message } from '../types'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

interface ChatBubbleProps {
  position: Position
  isDragging: boolean
  messages: Message[]
  inputValue: string
  isLoading: boolean
  onStartDrag: (clientX: number, clientY: number) => void
  onDrag: (clientX: number, clientY: number) => void
  onEndDrag: (clientX: number, clientY: number) => void
  onSendMessage: () => void
  onInputChange: (value: string) => void
  onMinimize: () => void
  onFullscreen: () => void
}

export function ChatBubble({
  position,
  isDragging,
  messages,
  inputValue,
  isLoading,
  onStartDrag,
  onDrag,
  onEndDrag,
  onSendMessage,
  onInputChange,
  onMinimize,
  onFullscreen,
}: ChatBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onDrag(e.clientX, e.clientY)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        onEndDrag(e.clientX, e.clientY)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, onDrag, onEndDrag])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.chat-content')) return
    onStartDrag(e.clientX, e.clientY)
  }

  return (
    <div
      ref={bubbleRef}
      className={`fixed z-[9999] w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-transform ${
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxHeight: '600px',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-brand-500 to-brand-600"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white font-semibold">TASTY LABS AI</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <button
            onClick={onFullscreen}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="chat-content flex flex-col flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <ChatInput
            value={inputValue}
            onChange={onInputChange}
            onSend={onSendMessage}
            isLoading={isLoading}
            placeholder="Ask me anything..."
          />
        </div>
      </div>
    </div>
  )
}
