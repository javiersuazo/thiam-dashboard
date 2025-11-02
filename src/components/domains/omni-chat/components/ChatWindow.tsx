'use client'

import type { ChatMode, DockPosition, Message } from '../types'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

interface ChatWindowProps {
  mode: ChatMode
  dockPosition: DockPosition
  messages: Message[]
  inputValue: string
  isLoading: boolean
  onSendMessage: () => void
  onInputChange: (value: string) => void
  onMinimize: () => void
  onFullscreen: () => void
  onChangeDockPosition: (position: DockPosition) => void
}

export function ChatWindow({
  mode,
  dockPosition,
  messages,
  inputValue,
  isLoading,
  onSendMessage,
  onInputChange,
  onMinimize,
  onFullscreen,
  onChangeDockPosition,
}: ChatWindowProps) {
  const isFullscreen = mode === 'fullscreen'

  const getDockedStyles = () => {
    if (isFullscreen) {
      return 'fixed inset-0 w-full h-full'
    }

    switch (dockPosition) {
      case 'left':
        return 'fixed left-0 top-0 bottom-0 w-96 max-w-[90vw]'
      case 'right':
        return 'fixed right-0 top-0 bottom-0 w-96 max-w-[90vw]'
      case 'bottom':
        return 'fixed bottom-0 left-0 right-0 h-96 max-h-[90vh]'
      default:
        return 'fixed right-0 top-0 bottom-0 w-96 max-w-[90vw]'
    }
  }

  const getBorderStyles = () => {
    if (isFullscreen) return ''

    switch (dockPosition) {
      case 'left':
        return 'border-r'
      case 'right':
        return 'border-l'
      case 'bottom':
        return 'border-t'
      default:
        return 'border-l'
    }
  }

  return (
    <div
      className={`${getDockedStyles()} ${getBorderStyles()} z-[9998] bg-white dark:bg-gray-900 shadow-2xl border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out`}
      style={{
        transform: isFullscreen ? 'none' : undefined,
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-brand-500 to-brand-600">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
          <div>
            <h3 className="text-white font-semibold text-lg">TASTY LABS AI</h3>
            <p className="text-white/80 text-xs">Your intelligent assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isFullscreen && mode === 'docked' && (
            <div className="flex items-center gap-0.5 mr-2">
              <button
                onClick={() => onChangeDockPosition('left')}
                className={`p-1.5 rounded-lg transition-colors ${
                  dockPosition === 'left'
                    ? 'bg-white/30'
                    : 'hover:bg-white/20'
                }`}
                title="Dock left"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="2" y="2" width="6" height="16" rx="1" />
                </svg>
              </button>

              <button
                onClick={() => onChangeDockPosition('right')}
                className={`p-1.5 rounded-lg transition-colors ${
                  dockPosition === 'right'
                    ? 'bg-white/30'
                    : 'hover:bg-white/20'
                }`}
                title="Dock right"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="12" y="2" width="6" height="16" rx="1" />
                </svg>
              </button>

              <button
                onClick={() => onChangeDockPosition('bottom')}
                className={`p-1.5 rounded-lg transition-colors ${
                  dockPosition === 'bottom'
                    ? 'bg-white/30'
                    : 'hover:bg-white/20'
                }`}
                title="Dock bottom"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="2" y="12" width="16" height="6" rx="1" />
                </svg>
              </button>
            </div>
          )}

          <button
            onClick={onMinimize}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Minimize"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <button
            onClick={onFullscreen}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
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
    </div>
  )
}
