'use client'

import type { Message } from '../types'
import { TableContent } from './content/TableContent'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'items-start gap-3'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      )}

      <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-brand-600 text-white rounded-tr-none'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none'
          } ${isStreaming ? 'animate-pulse' : ''}`}
        >
          {message.content.map((content, index) => (
            <div key={index} className="space-y-2">
              {content.type === 'text' && content.text && (
                <div className="text-sm whitespace-pre-wrap break-words">
                  {content.text}
                </div>
              )}

              {content.type === 'table' && content.table && (
                <div className="mt-2">
                  <TableContent table={content.table} />
                </div>
              )}

              {content.type === 'component' && content.component && (
                <div className="mt-2 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Component: {content.component.type}
                  </div>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(content.component.props, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}

          {!isUser && (
            <div className="mt-2 text-xs opacity-60">
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
