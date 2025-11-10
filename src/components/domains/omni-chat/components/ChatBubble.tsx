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
    const target = e.target as HTMLElement
    if (target.closest('.chat-content')) return
    if (target.closest('button')) return

    e.preventDefault()
    onStartDrag(e.clientX, e.clientY)
  }

  return (
    <div
      ref={bubbleRef}
      className={`fixed z-[9999] w-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-brand-200 dark:border-brand-800 flex flex-col overflow-hidden transition-shadow duration-200 animate-[popIn_0.3s_cubic-bezier(0.68,-0.55,0.265,1.55)] ${
        isDragging ? 'shadow-3xl' : 'hover:shadow-brand-500/20'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        height: '700px',
        transform: 'translate(-50%, -50%)',
        willChange: isDragging ? 'transform' : 'auto',
        pointerEvents: 'auto',
      }}
    >
      {!isDragging && (
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-2xl opacity-20 blur-xl animate-[pulse_3s_ease-in-out_infinite]"></div>
      )}

      <div
        className={`relative flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Animated shimmer on drag handle */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_linear_infinite]"></div>

        <div className="flex items-center gap-2 relative z-10">
          <div className="relative">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-[pulse_2s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-[ping_2s_ease-in-out_infinite]"></div>
          </div>
          <span className="text-white font-semibold flex items-center gap-1.5">
            TASTY LABS AI
            <span className="text-xs opacity-75">✨</span>
          </span>
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

      <div className="chat-content flex flex-col flex-1 overflow-hidden" style={{ pointerEvents: 'auto' }}>
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

      <style jsx>{`
        @keyframes popIn {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
