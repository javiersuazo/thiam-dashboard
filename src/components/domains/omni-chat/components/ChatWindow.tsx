'use client'

import type { ChatMode, Message } from '../types'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

interface ChatWindowProps {
  mode: ChatMode
  messages: Message[]
  inputValue: string
  isLoading: boolean
  onSendMessage: () => void
  onInputChange: (value: string) => void
  onMinimize: () => void
  onFullscreen: () => void
}

export function ChatWindow({
  mode,
  messages,
  inputValue,
  isLoading,
  onSendMessage,
  onInputChange,
  onMinimize,
  onFullscreen,
}: ChatWindowProps) {
  const isFullscreen = mode === 'fullscreen'

  return (
    <div
      className={`${isFullscreen ? 'fixed inset-0 w-full h-full z-[9998]' : ''} bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-all duration-500 ease-out animate-[slideIn_0.4s_ease-out]`}
    >
      <div className="relative flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 animate-[gradientShift_6s_ease-in-out_infinite]"></div>

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_linear_infinite]"></div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-[pulse_2s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-[ping_2s_ease-in-out_infinite]"></div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              TASTY LABS AI
              <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">✨</span>
            </h3>
            <p className="text-white/90 text-xs font-medium animate-[fadeIn_0.5s_ease-in]">
              Your intelligent assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors relative z-10"
            title="Minimize"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <button
            onClick={onFullscreen}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors relative z-10"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList messages={messages} isLoading={isLoading} />

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <ChatInput
            value={inputValue}
            onChange={onInputChange}
            onSend={onSendMessage}
            isLoading={isLoading}
            placeholder="Ask me anything about your catering business..."
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
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
        @keyframes wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(20deg);
          }
          75% {
            transform: rotate(-20deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
