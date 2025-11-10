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
  onClose: () => void
  onFullscreen: () => void
}

export function ChatWindow({
  mode,
  messages,
  inputValue,
  isLoading,
  onSendMessage,
  onInputChange,
  onClose,
  onFullscreen,
}: ChatWindowProps) {
  const isFullscreen = mode === 'fullscreen'
  const isSidebar = mode === 'sidebar'

  const hasMessages = messages.length > 0

  return (
    <>
      <div
        className={`
          ${isFullscreen ? 'fixed inset-0 w-full h-full z-[9998]' : ''}
          ${isSidebar ? 'fixed top-0 right-0 h-full w-[500px] md:w-[600px] lg:w-[700px] z-[9998] animate-[slideInRight_0.3s_ease-out]' : ''}
          bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-out
          ${!isSidebar && !isFullscreen ? 'animate-[slideIn_0.4s_ease-out]' : ''}
        `}
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
          {isSidebar && (
            <button
              onClick={onFullscreen}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors relative z-10"
              title="Fullscreen"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}

          {isFullscreen && (
            <button
              onClick={onFullscreen}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors relative z-10"
              title="Exit fullscreen"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors relative z-10"
            title="Close"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {!hasMessages ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
            <div className="max-w-2xl w-full space-y-8">
              {/* Welcome Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-lg mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Welcome to TASTY LABS AI
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Your intelligent catering assistant. How can I help you today?
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onInputChange("Show me today's orders")
                    setTimeout(() => onSendMessage(), 100)
                  }}
                  className="group p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Today's Orders</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">View and manage active orders</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onInputChange("What's my revenue this month?")
                    setTimeout(() => onSendMessage(), 100)
                  }}
                  className="group p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Revenue Analytics</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Check sales and performance</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onInputChange("Show me low stock ingredients")
                    setTimeout(() => onSendMessage(), 100)
                  }}
                  className="group p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Inventory Check</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monitor stock levels</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onInputChange("Help me create a new menu")
                    setTimeout(() => onSendMessage(), 100)
                  }}
                  className="group p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Menu Planning</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Create and optimize menus</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Input Section */}
              <div className="space-y-3">
                <ChatInput
                  value={inputValue}
                  onChange={onInputChange}
                  onSend={onSendMessage}
                  isLoading={isLoading}
                  placeholder="Ask me anything about your catering business..."
                />
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  I can help with orders, inventory, menus, analytics, and more
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} isLoading={isLoading} />

            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="max-w-3xl mx-auto px-4 py-4 md:px-6">
                <ChatInput
                  value={inputValue}
                  onChange={onInputChange}
                  onSend={onSendMessage}
                  isLoading={isLoading}
                  placeholder="Ask me anything about your catering business..."
                />
              </div>
            </div>
          </>
        )}
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
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
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
      `}</style>
      </div>
    </>
  )
}
